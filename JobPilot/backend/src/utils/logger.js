import crypto from "node:crypto";

export function requestId(req, _res, next) {
  req.id = crypto.randomUUID();
  next();
}

function serializeMeta(meta) {
  if (!meta) return "";
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return "";
  }
}

function write(level, message, meta) {
  const reqId = meta?.reqId || "";
  const line = `[${new Date().toISOString()}] [${level}]${reqId ? ` [${reqId}]` : ""} ${message}${serializeMeta(meta)}`;
  if (level === "ERROR") {
    console.error(line);
    return;
  }
  if (level === "WARN") {
    console.warn(line);
    return;
  }
  console.log(line);
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
