import crypto from "crypto";
import { env, assertSupportedTimezone } from "../config/env.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshCookieOptions,
  hashToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { ensureUniqueUsername, normalizeUsername } from "../utils/auth.js";

const DEFAULT_SETTINGS = {
  jobPreferences: {
    preferredJobType: "",
    preferredLocation: "",
    expectedSalaryRange: "",
  },
  productivity: {
    defaultFollowUpDays: 5,
    autoMarkGhostedDays: 21,
  },
  notifications: {
    timezone: env.defaultTimezone,
    reminderHour: env.defaultReminderHour,
    weeklySummaryEnabled: false,
  },
};

function parseBoundedInteger(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    return fallback;
  }
  return number;
}

export function normalizeSettings(settings) {
  if (!settings || typeof settings !== "object") settings = {};
  const rawTimezone = settings.notifications?.timezone;
  const timezone =
    typeof rawTimezone === "string" && assertSupportedTimezone(rawTimezone.trim())
      ? rawTimezone.trim()
      : DEFAULT_SETTINGS.notifications.timezone;

  return {
    jobPreferences: {
      preferredJobType: settings.jobPreferences?.preferredJobType || "",
      preferredLocation: settings.jobPreferences?.preferredLocation || "",
      expectedSalaryRange: settings.jobPreferences?.expectedSalaryRange || "",
    },
    productivity: {
      defaultFollowUpDays: parseBoundedInteger(
        settings.productivity?.defaultFollowUpDays,
        DEFAULT_SETTINGS.productivity.defaultFollowUpDays,
        0,
        30
      ),
      autoMarkGhostedDays: parseBoundedInteger(
        settings.productivity?.autoMarkGhostedDays,
        DEFAULT_SETTINGS.productivity.autoMarkGhostedDays,
        0,
        365
      ),
    },
    notifications: {
      timezone,
      reminderHour: parseBoundedInteger(
        settings.notifications?.reminderHour,
        DEFAULT_SETTINGS.notifications.reminderHour,
        0,
        23
      ),
      weeklySummaryEnabled:
        typeof settings.notifications?.weeklySummaryEnabled === "boolean"
          ? settings.notifications.weeklySummaryEnabled
          : DEFAULT_SETTINGS.notifications.weeklySummaryEnabled,
    },
  };
}

export function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username || "",
    email: user.email,
    profilePic: user.profilePic || "",
    phone: user.phone || "",
    bio: user.bio || "",
    emailNotifications: user.emailNotifications,
    authProviders: {
      password: user.hasPassword !== false,
      google: Boolean(user.googleId),
    },
    settings: normalizeSettings(user.settings),
    createdAt: user.createdAt,
  };
}

export function setRefreshCookie(res, refreshToken) {
  res.cookie(env.authCookieName, refreshToken, getRefreshCookieOptions());
}

export function clearRefreshCookie(res) {
  res.clearCookie(env.authCookieName, getRefreshCookieOptions());
}

export async function ensureSessionUsername(user) {
  if (normalizeUsername(user?.username)) {
    return false;
  }

  user.username = await ensureUniqueUsername({
    name: user?.name,
    email: user?.email,
    excludeUserId: user?._id,
  });

  return true;
}

export async function createAuthSession(user) {
  const sessionId = crypto.randomUUID();
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id, sessionId);
  const decodedRefresh = verifyRefreshToken(refreshToken);

  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshSessionId = sessionId;
  user.refreshTokenExpiresAt = new Date(decodedRefresh.exp * 1000);
  await user.save();

  return {
    accessToken,
    refreshToken,
    publicUser: publicUser(user),
  };
}

export async function sendAuthSuccess(res, user, status = 200) {
  if (await ensureSessionUsername(user)) {
    await user.save();
  }

  const session = await createAuthSession(user);
  setRefreshCookie(res, session.refreshToken);

  return res.status(status).json({
    success: true,
    data: {
      token: session.accessToken,
      user: session.publicUser,
    },
  });
}

export function readRefreshToken(req) {
  return req.cookies?.[env.authCookieName] || "";
}

export async function clearUserSession(user) {
  user.refreshTokenHash = "";
  user.refreshSessionId = "";
  user.refreshTokenExpiresAt = null;
  await user.save();
}

export async function refreshUserSession(req, user) {
  const providedToken = readRefreshToken(req);
  if (!providedToken || !user.refreshTokenHash) {
    return null;
  }

  if (hashToken(providedToken) !== user.refreshTokenHash) {
    return null;
  }

  const decoded = verifyRefreshToken(providedToken);
  if (decoded.sessionId !== user.refreshSessionId) {
    return null;
  }

  return createAuthSession(user);
}
