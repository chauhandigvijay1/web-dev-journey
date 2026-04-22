const nodemailer = require('nodemailer')

let transporter

const getTransporter = () => {
  if (transporter) return transporter

  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!user || !pass) {
    return null
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })

  return transporter
}

const sendPasswordResetEmail = async ({ toEmail, resetUrl }) => {
  const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER
  const mailer = getTransporter()

  if (!mailer) {
    throw new Error('Email service is not configured. Set EMAIL_USER and EMAIL_PASS.')
  }

  await mailer.sendMail({
    from: emailFrom,
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

module.exports = {
  sendPasswordResetEmail,
}
