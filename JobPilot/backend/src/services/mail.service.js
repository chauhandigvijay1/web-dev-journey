import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const outbox = [];
let missingConfigLogged = false;

function hasMailConfig() {
  return Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass && env.emailFrom);
}

function createTransporter() {
  if (env.isTest) {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  if (!hasMailConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure || env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

export function getMailTransporter() {
  return createTransporter();
}

export function getMailOutbox() {
  return [...outbox];
}

export function clearMailOutbox() {
  outbox.length = 0;
}

export async function sendMail(message, meta = {}) {
  const activeTransporter = getMailTransporter();
  if (!activeTransporter) {
    if (!missingConfigLogged) {
      logger.warn("[mail] SMTP config is missing. Email delivery is disabled until SMTP credentials are configured.");
      missingConfigLogged = true;
    }
    throw new Error("SMTP is not configured");
  }

  const finalMessage = {
    from: env.emailFrom || env.smtpUser || "no-reply@jobpilot.local",
    ...message,
  };
  const info = await activeTransporter.sendMail(finalMessage);

  outbox.push({
    ...finalMessage,
    meta,
    messageId: info.messageId || finalMessage.messageId || "",
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  logger.info("[mail] Message queued", {
    to: finalMessage.to,
    subject: finalMessage.subject,
    previewUrl: previewUrl || null,
    ...meta,
  });

  return info;
}
