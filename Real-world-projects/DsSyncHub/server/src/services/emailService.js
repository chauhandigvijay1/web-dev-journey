const nodemailer = require('nodemailer')
const logger = require('./logger')

let transportConfigs = null

const trim = (v) => (typeof v === 'string' ? v.trim() : v)

const buildConfigs = () => {
  const user = trim(process.env.EMAIL_USER)
  const pass = trim(process.env.EMAIL_PASS)

  if (!user || !pass) {
    logger.error('[email] EMAIL_USER or EMAIL_PASS not set')
    return null
  }

  const host = trim(process.env.EMAIL_HOST)
  const port = parseInt(trim(process.env.EMAIL_PORT) || '', 10)
  const ports = port ? [port] : [587]
  if (port && port !== 587 && !ports.includes(587)) ports.push(587)

  if (host) {
    return ports.map((p) => {
      logger.info(`[email] adding SMTP config: ${host}:${p}`)
      return {
        transporter: nodemailer.createTransport({
          host,
          port: p,
          secure: p === 465,
          auth: { user, pass },
          connectionTimeout: 10000,
          socketTimeout: 10000,
        }),
        port: p,
      }
    })
  }

  logger.info('[email] using Gmail SMTP (fallback)')
  return [
    {
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      }),
      port: 'gmail',
    },
  ]
}

const getConfigs = () => {
  if (!transportConfigs) transportConfigs = buildConfigs()
  return transportConfigs
}

const resetTransporter = () => {
  transportConfigs = null
}

const sendWithFallback = async (mailOptions) => {
  const configs = getConfigs()
  if (!configs) throw new Error('Email service is not configured. Set EMAIL_USER and EMAIL_PASS.')

  let lastError
  for (const { transporter, port } of configs) {
    try {
      await transporter.sendMail(mailOptions)
      return
    } catch (err) {
      lastError = err
      logger.warn({ err: err.message, port }, 'Email send failed, trying next config')
    }
  }

  resetTransporter()
  throw lastError
}

const getEmailFrom = () => trim(process.env.EMAIL_FROM) || trim(process.env.EMAIL_USER) || ''

const sendPasswordResetEmail = async ({ toEmail, resetUrl }) => {
  await sendWithFallback({
    from: getEmailFrom(),
    to: toEmail,
    subject: 'Reset your DsSync Hub password',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">Password reset requested</h2>
        <p style="margin: 0 0 12px;">We received a request to reset your password for DsSync Hub.</p>
        <p style="margin: 0 0 16px;">
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 16px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px;">
            Reset password
          </a>
        </p>
        <p style="margin: 0 0 8px;">This link expires in 60 minutes.</p>
        <p style="margin: 0; color: #6b7280;">If you did not request this, you can ignore this email.</p>
      </div>
    `,
    text: `Reset your DsSync Hub password:\n\n${resetUrl}\n\nThis link expires in 60 minutes.`,
  })
}

const sendVerificationEmail = async ({ toEmail, verifyUrl }) => {
  await sendWithFallback({
    from: getEmailFrom(),
    to: toEmail,
    subject: 'Verify your DsSync Hub email',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">Verify your email address</h2>
        <p style="margin: 0 0 12px;">Thanks for signing up for DsSync Hub!</p>
        <p style="margin: 0 0 16px;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 10px 16px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px;">
            Verify email
          </a>
        </p>
        <p style="margin: 0 0 8px;">This link expires in 24 hours.</p>
        <p style="margin: 0; color: #6b7280;">If you did not create an account, you can ignore this email.</p>
      </div>
    `,
    text: `Verify your DsSync Hub email:\n\n${verifyUrl}\n\nThis link expires in 24 hours.`,
  })
}

const sendInviteEmail = async ({ toEmail, inviteUrl, inviterName, workspaceName }) => {
  await sendWithFallback({
    from: getEmailFrom(),
    to: toEmail,
    subject: `${inviterName} invited you to ${workspaceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">You've been invited!</h2>
        <p style="margin: 0 0 12px;">${inviterName} invited you to join <strong>${workspaceName}</strong> on DsSync Hub.</p>
        <p style="margin: 0 0 16px;">
          <a href="${inviteUrl}" style="display: inline-block; padding: 10px 16px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px;">
            Accept invitation
          </a>
        </p>
        <p style="margin: 0; color: #6b7280;">This invite expires in 7 days.</p>
      </div>
    `,
    text: `${inviterName} invited you to join ${workspaceName} on DsSync Hub.\n\nAccept: ${inviteUrl}\n\nThis invite expires in 7 days.`,
  })
}

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendInviteEmail,
}
