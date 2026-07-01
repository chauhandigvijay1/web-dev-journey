const env = require("../config/env");

const getResend = () => {
  if (!env.resendApiKey) return null;
  const { Resend } = require("resend");
  return new Resend(env.resendApiKey);
};

async function sendPasswordResetEmail(recipientEmail, rawToken) {
  const resend = getResend();
  const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;

  if (!resend) {
    console.log(`
╔══════════════════════════════════════════════════════╗
║  PASSWORD RESET (No Resend API key configured)      ║
║  To: ${recipientEmail.padEnd(40)}║
║  Reset URL: ${resetUrl.padEnd(30)}║
║  Token: ${rawToken.padEnd(53)}║
╚══════════════════════════════════════════════════════╝
    `);
    return;
  }

  const fromAddress = env.emailFrom || "noreply@devflow-ai.com";

  const { error } = await resend.emails.send({
    from: `DevFlow AI <${fromAddress}>`,
    to: recipientEmail,
    subject: "Reset your DevFlow AI password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin: 0;">DevFlow AI</h1>
        </div>
        <div style="background: #fafafa; border-radius: 12px; padding: 32px; border: 1px solid #e4e4e7;">
          <h2 style="font-size: 18px; color: #18181b; margin: 0 0 12px;">Reset your password</h2>
          <p style="color: #71717a; line-height: 1.6; margin: 0 0 20px;">
            We received a request to reset your password. Click the button below to set a new one. This link expires in <strong>15 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; padding: 12px 32px; background: #18181b; color: #fafafa;
                      text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">
              Reset Password
            </a>
          </div>
          <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5; margin: 0;">
            If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
          </p>
        </div>
        <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
          DevFlow AI — AI-powered development assistant
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}

module.exports = { sendPasswordResetEmail };
