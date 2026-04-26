import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateAccessToken(userId) {
  return jwt.sign({ userId: String(userId), type: "access" }, env.jwtSecret, {
    expiresIn: env.jwtAccessTtl,
  });
}

export function generateRefreshToken(userId, sessionId) {
  return jwt.sign({ userId: String(userId), type: "refresh", sessionId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

export function hashToken(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}
