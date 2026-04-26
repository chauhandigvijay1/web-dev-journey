import { env } from "../config/env.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderList(items) {
  return items
    .filter(Boolean)
    .map((item) => `<li style="margin:0 0 8px;">${escapeHtml(item)}</li>`)
    .join("");
}

function buildLayout({ preheader, heading, intro, content, ctaLabel, ctaUrl, footerNote }) {
  const safePreheader = escapeHtml(preheader);
  return {
    html: `
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safePreheader}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 12px;font-family:Arial,sans-serif;color:#0f172a;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
              <tr>
                <td style="padding:32px 32px 20px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;">
                  <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.85;">JobPilot</div>
                  <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">${escapeHtml(heading)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px 32px;">
                  <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">${escapeHtml(intro)}</p>
                  ${content}
                  <div style="margin:28px 0 18px;">
                    <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600;">${escapeHtml(ctaLabel)}</a>
                  </div>
                  <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#64748b;">${escapeHtml(footerNote)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  };
}

function buildPlainText({ greeting, lines, ctaUrl, footerNote }) {
  return [greeting, "", ...lines, "", ctaUrl, "", footerNote].filter(Boolean).join("\n");
}

function dashboardJobUrl(jobId) {
  return `${env.frontendUrl}/dashboard/jobs/${jobId}`;
}

function dashboardUrl() {
  return `${env.frontendUrl}/dashboard`;
}

export function buildFollowUpReminderEmail({ userName, jobTitle, company, appliedDate, reason, nextAction, jobId }) {
  const jobUrl = dashboardJobUrl(jobId);
  const subject = `Follow-up Reminder: ${jobTitle} at ${company}`;
  const content = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr><td style="padding:0 0 12px;font-size:15px;color:#0f172a;"><strong>Job title:</strong> ${escapeHtml(jobTitle)}</td></tr>
      <tr><td style="padding:0 0 12px;font-size:15px;color:#0f172a;"><strong>Company:</strong> ${escapeHtml(company)}</td></tr>
      <tr><td style="padding:0 0 12px;font-size:15px;color:#0f172a;"><strong>Applied date:</strong> ${escapeHtml(appliedDate)}</td></tr>
      <tr><td style="padding:0 0 12px;font-size:15px;color:#0f172a;"><strong>Reminder reason:</strong> ${escapeHtml(reason)}</td></tr>
      <tr><td style="padding:0 0 12px;font-size:15px;color:#0f172a;"><strong>Suggested next action:</strong> ${escapeHtml(nextAction)}</td></tr>
    </table>
  `;
  const html = buildLayout({
    preheader: `${jobTitle} at ${company} is ready for follow-up.`,
    heading: "Follow-up Reminder",
    intro: `Hi ${userName}, your application is ready for the next step.`,
    content,
    ctaLabel: "Open in JobPilot",
    ctaUrl: jobUrl,
    footerNote: "You are receiving this because reminder emails are enabled for your JobPilot account.",
  }).html;
  const text = buildPlainText({
    greeting: `Hi ${userName},`,
    lines: [
      `Job title: ${jobTitle}`,
      `Company: ${company}`,
      `Applied date: ${appliedDate}`,
      `Reminder reason: ${reason}`,
      `Suggested next action: ${nextAction}`,
      "Open this application in JobPilot:",
    ],
    ctaUrl: jobUrl,
    footerNote: "You are receiving this because reminder emails are enabled for your JobPilot account.",
  });

  return { subject, html, text };
}

export function buildInterviewReminderEmail({ userName, jobTitle, company, reminderDate, nextAction, jobId }) {
  const jobUrl = dashboardJobUrl(jobId);
  const subject = `Interview Reminder: ${jobTitle} at ${company}`;
  const content = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
      Your interview-related application needs attention today.
    </p>
    <ul style="margin:0;padding-left:18px;font-size:15px;color:#0f172a;">
      ${renderList([
        `Job title: ${jobTitle}`,
        `Company: ${company}`,
        `Reminder date: ${reminderDate}`,
        `Suggested next action: ${nextAction}`,
      ])}
    </ul>
  `;
  const html = buildLayout({
    preheader: `${jobTitle} at ${company} has an interview reminder.`,
    heading: "Interview Reminder",
    intro: `Hi ${userName}, keep your interview process moving.`,
    content,
    ctaLabel: "Review Interview Notes",
    ctaUrl: jobUrl,
    footerNote: "Stay ready with your latest notes, resume, and follow-up plan in JobPilot.",
  }).html;
  const text = buildPlainText({
    greeting: `Hi ${userName},`,
    lines: [
      `Interview reminder for ${jobTitle} at ${company}`,
      `Reminder date: ${reminderDate}`,
      `Suggested next action: ${nextAction}`,
      "Open this application in JobPilot:",
    ],
    ctaUrl: jobUrl,
    footerNote: "Stay ready with your latest notes, resume, and follow-up plan in JobPilot.",
  });

  return { subject, html, text };
}

export function buildDeadlineReminderEmail({ userName, jobTitle, company, deadlineLabel, nextAction, jobId }) {
  const jobUrl = dashboardJobUrl(jobId);
  const subject = `Deadline Reminder: ${jobTitle} at ${company}`;
  const content = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
      An application deadline is approaching and needs your attention.
    </p>
    <ul style="margin:0;padding-left:18px;font-size:15px;color:#0f172a;">
      ${renderList([
        `Job title: ${jobTitle}`,
        `Company: ${company}`,
        `Deadline: ${deadlineLabel}`,
        `Suggested next action: ${nextAction}`,
      ])}
    </ul>
  `;
  const html = buildLayout({
    preheader: `${jobTitle} at ${company} has an upcoming deadline.`,
    heading: "Deadline Reminder",
    intro: `Hi ${userName}, this opportunity has a deadline coming up.`,
    content,
    ctaLabel: "Open Deadline Details",
    ctaUrl: jobUrl,
    footerNote: "Use JobPilot to make sure every application is complete before the deadline.",
  }).html;
  const text = buildPlainText({
    greeting: `Hi ${userName},`,
    lines: [
      `Deadline reminder for ${jobTitle} at ${company}`,
      `Deadline: ${deadlineLabel}`,
      `Suggested next action: ${nextAction}`,
      "Open this application in JobPilot:",
    ],
    ctaUrl: jobUrl,
    footerNote: "Use JobPilot to make sure every application is complete before the deadline.",
  });

  return { subject, html, text };
}

export function buildWeeklySummaryEmail({ userName, weekLabel, metrics, highlights }) {
  const appUrl = dashboardUrl();
  const summaryItems = [
    `New jobs tracked: ${metrics.newJobs}`,
    `Interviews in progress: ${metrics.interviews}`,
    `Offers received: ${metrics.offers}`,
    `Follow-ups due next: ${metrics.followUpsDue}`,
  ];
  const content = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
      Here is your JobPilot weekly summary for ${escapeHtml(weekLabel)}.
    </p>
    <ul style="margin:0;padding-left:18px;font-size:15px;color:#0f172a;">
      ${renderList(summaryItems)}
    </ul>
    ${
      highlights.length
        ? `<div style="margin-top:24px;"><p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#0f172a;">Highlights</p><ul style="margin:0;padding-left:18px;font-size:15px;color:#0f172a;">${renderList(highlights)}</ul></div>`
        : ""
    }
  `;
  const html = buildLayout({
    preheader: `Your ${weekLabel} JobPilot summary is ready.`,
    heading: "Weekly Summary",
    intro: `Hi ${userName}, here is the latest snapshot of your job search.`,
    content,
    ctaLabel: "Open Dashboard",
    ctaUrl: appUrl,
    footerNote: "Weekly summaries are sent because they are enabled in your JobPilot notification settings.",
  }).html;
  const text = buildPlainText({
    greeting: `Hi ${userName},`,
    lines: [`Weekly summary for ${weekLabel}`, ...summaryItems, ...(highlights.length ? ["Highlights:", ...highlights] : [])],
    ctaUrl: appUrl,
    footerNote: "Weekly summaries are sent because they are enabled in your JobPilot notification settings.",
  });

  return {
    subject: `JobPilot Weekly Summary: ${weekLabel}`,
    html,
    text,
  };
}
