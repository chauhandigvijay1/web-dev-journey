import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const outbox = [];
const OUTBOX_MAX = 1000;
let missingConfigLogged = false;
let cachedTransporter = null;
let cachedTransporterHash = "";

function hasMailConfig() {
  return Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass && env.emailFrom);
}

function configHash() {
  return `${env.smtpHost}:${env.smtpPort}:${env.smtpSecure}:${env.smtpUser}:${env.smtpPass}`;
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
  const hash = configHash();
  if (cachedTransporter && cachedTransporterHash === hash) {
    return cachedTransporter;
  }
  cachedTransporter = createTransporter();
  cachedTransporterHash = hash;
  return cachedTransporter;
}

export function getMailOutbox() {
  const copy = [...outbox];
  outbox.length = 0;
  return copy;
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

  if (outbox.length < OUTBOX_MAX) {
    outbox.push({
      ...finalMessage,
      meta,
      messageId: info.messageId || finalMessage.messageId || "",
    });
  } else {
    logger.warn("[mail] Outbox at capacity, skipping push");
  }

  const previewUrl = nodemailer.getTestMessageUrl(info);
  logger.info("[mail] Message queued", {
    to: finalMessage.to,
    subject: finalMessage.subject,
    previewUrl: previewUrl || null,
    ...meta,
  });

  return info;
}
