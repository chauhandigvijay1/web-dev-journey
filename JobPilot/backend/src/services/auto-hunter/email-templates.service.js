import { env } from "../../config/env.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildAutoHunterMatchEmail({ userName, match }) {
  const dashboardUrl = `${env.frontendUrl}/dashboard/auto-hunter`;
  const applyUrl = match.applyUrl || match.originalUrl || dashboardUrl;
  const reasons = (match.match?.reasons || []).slice(0, 4);
  const missing = (match.match?.missingSkills || []).slice(0, 4);
  const urgency = match.match?.urgencyLabel || "Standard";
  const score = match.match?.score || 0;

  const html = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 12px;font-family:Arial,sans-serif;color:#0f172a;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="padding:32px;background:linear-gradient(135deg,#0f172a,#2563eb);color:#ffffff;">
                <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.82;">AI Resume Auto Job Hunter</div>
                <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">${escapeHtml(match.title)} at ${escapeHtml(match.company)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 32px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">Hi ${escapeHtml(
                  userName
                )}, a new high-quality match was discovered for your profile.</p>
                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
                  <span style="display:inline-block;border-radius:999px;background:#dbeafe;color:#1d4ed8;padding:8px 12px;font-size:13px;font-weight:700;">Match ${score}%</span>
                  <span style="display:inline-block;border-radius:999px;background:#fef3c7;color:#92400e;padding:8px 12px;font-size:13px;font-weight:700;">${escapeHtml(
                    urgency
                  )}</span>
                </div>
                <p style="margin:0 0 10px;font-size:14px;color:#0f172a;"><strong>Location:</strong> ${escapeHtml(
                  match.location || match.workMode || "Not specified"
                )}</p>
                <p style="margin:0 0 10px;font-size:14px;color:#0f172a;"><strong>Source:</strong> ${escapeHtml(
                  match.source
                )}</p>
                ${
                  reasons.length
                    ? `<div style="margin-top:22px;"><p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#0f172a;">Why it matched</p><ul style="margin:0;padding-left:18px;color:#334155;">${reasons
                        .map((reason) => `<li style="margin-bottom:8px;">${escapeHtml(reason)}</li>`)
                        .join("")}</ul></div>`
                    : ""
                }
                ${
                  missing.length
                    ? `<div style="margin-top:22px;"><p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#0f172a;">Possible gaps</p><ul style="margin:0;padding-left:18px;color:#334155;">${missing
                        .map((skill) => `<li style="margin-bottom:8px;">${escapeHtml(skill)}</li>`)
                        .join("")}</ul></div>`
                    : ""
                }
                <div style="margin:28px 0 18px;">
                  <a href="${escapeHtml(applyUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600;margin-right:10px;">Open Apply Link</a>
                  <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#e2e8f0;color:#0f172a;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600;">Open JobPilot</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const text = [
    `Hi ${userName},`,
    "",
    `A new high-quality job match was discovered: ${match.title} at ${match.company}`,
    `Match score: ${score}%`,
    `Urgency: ${urgency}`,
    `Location: ${match.location || match.workMode || "Not specified"}`,
    `Source: ${match.source}`,
    "",
    reasons.length ? `Why it matched: ${reasons.join(" | ")}` : "",
    missing.length ? `Possible gaps: ${missing.join(", ")}` : "",
    "",
    `Apply link: ${applyUrl}`,
    `Dashboard: ${dashboardUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `New ${score}% match: ${match.title} at ${match.company}`,
    html,
    text,
  };
}
