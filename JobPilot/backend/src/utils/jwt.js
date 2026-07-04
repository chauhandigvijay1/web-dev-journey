import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateAccessToken(userId, tokenVersion = 0) {
  return jwt.sign({ userId: String(userId), type: "access", tokenVersion }, env.jwtSecret, {
    expiresIn: env.jwtAccessTtl,
  });
}

export function generateRefreshToken(userId, sessionId, tokenVersion = 0) {
  return jwt.sign({ userId: String(userId), type: "refresh", sessionId, tokenVersion }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret, { algorithms: ["HS256"] });
}

export function hashToken(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function parseTtlMs(ttl) {
  const match = String(ttl).match(/^(\d+)([smhd])$/);
  if (!match) return 30 * 24 * 60 * 60 * 1000;
  const num = parseInt(match[1], 10);
  switch (match[2]) {
    case "s": return num * 1000;
    case "m": return num * 60 * 1000;
    case "h": return num * 3600 * 1000;
    case "d": return num * 86400 * 1000;
    default: return 30 * 24 * 60 * 60 * 1000;
  }
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: env.isProduction,
    path: "/",
    maxAge: Math.floor(parseTtlMs(env.jwtRefreshTtl) / 1000),
  };
}
