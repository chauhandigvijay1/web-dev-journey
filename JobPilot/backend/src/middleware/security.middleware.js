import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object" && value.constructor === Object) {
    return Object.entries(value).reduce((accumulator, [key, nestedValue]) => {
      if (
        key.startsWith("$") ||
        key.includes(".") ||
        key === "__proto__" ||
        key === "constructor" ||
        key === "prototype"
      ) {
        return accumulator;
      }

      accumulator[key] = sanitizeValue(nestedValue);
      return accumulator;
    }, {});
  }

  if (typeof value === "string") {
    return value.replace(/\u0000/g, "");
  }

  return value;
}

function overwriteObject(target, sanitized) {
  if (!target || typeof target !== "object") return;
  for (const key of Object.keys(target)) {
    delete target[key];
  }
  Object.assign(target, sanitized);
}

function createRateLimiter(limit, windowMinutes, message) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });
}

export const apiRateLimiter = createRateLimiter(
  env.apiRateLimitMax,
  env.apiRateLimitWindowMinutes,
  "Too many requests. Please try again later."
);

export const healthRateLimiter = createRateLimiter(60, 1, "Too many health check requests.");

export const authRateLimiter = createRateLimiter(
  env.authRateLimitMax,
  env.authRateLimitWindowMinutes,
  "Too many authentication attempts. Please wait and try again."
);

export function sanitizeRequest(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === "object") {
    overwriteObject(req.query, sanitizeValue(req.query));
  }
  next();
}
