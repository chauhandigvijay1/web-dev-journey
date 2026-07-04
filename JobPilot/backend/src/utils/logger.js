import crypto from "node:crypto";

const isProduction = process.env.NODE_ENV?.trim() === "production";

export function requestId(req, _res, next) {
  req.id = crypto.randomUUID();
  next();
}

function write(level, message, meta) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  const output = isProduction ? JSON.stringify(entry) : `[${entry.timestamp}] [${level}]${meta?.reqId ? ` [${meta.reqId}]` : ""} ${message}`;
  if (level === "ERROR") {
    console.error(output);
  } else if (level === "WARN") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  info(message, meta) {
    write("INFO", message, meta);
  },
  warn(message, meta) {
    write("WARN", message, meta);
  },
  error(message, meta) {
    write("ERROR", message, meta);
  },
};
