const rawNodeEnv = process.env.NODE_ENV?.trim() || "development";
const defaultProductionFrontendUrl = "https://jobpilot-client-chi.vercel.app";

function readString(name, defaultValue = "") {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : defaultValue;
}

function readNumber(name, defaultValue, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = readString(name);
  if (!raw) return defaultValue;
  const value = Number(raw);
  if (!Number.isFinite(value)) return defaultValue;
  return Math.max(min, Math.min(max, value));
}

function readBoolean(name, defaultValue = false) {
  const raw = readString(name).toLowerCase();
  if (!raw) return defaultValue;
  if (["1", "true", "yes", "on"].includes(raw)) return true;
  if (["0", "false", "no", "off"].includes(raw)) return false;
  return defaultValue;
}

function readList(name, fallback = []) {
  const raw = readString(name);
  if (!raw) return [...fallback];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function requiredString(name) {
  const value = readString(name);
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

const defaultFrontendUrl =
  readString("FRONTEND_URL") ||
  readString("NEXT_PUBLIC_APP_URL") ||
  (rawNodeEnv === "production" ? defaultProductionFrontendUrl : "http://localhost:3000");

const defaultCorsOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://jobpilot-client-chi.vercel.app",
  defaultFrontendUrl,
].filter(Boolean);

export const env = {
  nodeEnv: rawNodeEnv,
  isProduction: rawNodeEnv === "production",
  isTest: rawNodeEnv === "test",
  port: readNumber("PORT", 5051, { min: 1, max: 65535 }),
  mongoUri: readString("MONGO_URI"),
  frontendUrl: defaultFrontendUrl.replace(/\/+$/, ""),
  corsOrigins: Array.from(new Set(readList("CORS_ORIGINS", defaultCorsOrigins).map((value) => value.replace(/\/+$/, "")))),
  jwtSecret: requiredString("JWT_SECRET"),
  jwtRefreshSecret: requiredString("JWT_REFRESH_SECRET"),
  jwtAccessTtl: readString("JWT_ACCESS_TTL") || "7d",
  jwtRefreshTtl: readString("JWT_REFRESH_TTL") || "30d",
  authCookieName: readString("AUTH_COOKIE_NAME") || "jobpilot_refresh",
  defaultTimezone: readString("DEFAULT_TIMEZONE") || "UTC",
  defaultReminderHour: readNumber("DEFAULT_REMINDER_HOUR", 9, { min: 0, max: 23 }),
  reminderCron: readString("REMINDER_CRON") || "*/10 * * * *",
  reminderLockMinutes: readNumber("REMINDER_LOCK_MINUTES", 20, { min: 1, max: 180 }),
  reminderBatchSize: readNumber("REMINDER_BATCH_SIZE", 25, { min: 1, max: 500 }),
  reminderRetryLimit: readNumber("REMINDER_RETRY_LIMIT", 3, { min: 1, max: 10 }),
  reminderRetryBaseMinutes: readNumber("REMINDER_RETRY_BASE_MINUTES", 10, { min: 1, max: 120 }),
  reminderSweepSecret: readString("REMINDER_SWEEP_SECRET"),
  apiRateLimitWindowMinutes: readNumber("API_RATE_LIMIT_WINDOW_MINUTES", 15, { min: 1, max: 120 }),
  apiRateLimitMax: readNumber("API_RATE_LIMIT_MAX", 250, { min: 20, max: 5000 }),
  authRateLimitWindowMinutes: readNumber("AUTH_RATE_LIMIT_WINDOW_MINUTES", 10, { min: 1, max: 60 }),
  authRateLimitMax: readNumber("AUTH_RATE_LIMIT_MAX", 12, { min: 3, max: 100 }),
  smtpHost: readString("SMTP_HOST"),
  smtpPort: readNumber("SMTP_PORT", 587, { min: 1, max: 65535 }),
  smtpSecure: readBoolean("SMTP_SECURE", false),
  smtpUser: readString("SMTP_USER"),
  smtpPass: readString("SMTP_PASS"),
  emailFrom: readString("EMAIL_FROM") || readString("SMTP_FROM") || readString("SMTP_USER"),
  tinyfishApiKey: readString("TINYFISH_API_KEY"),
};

export function assertSupportedTimezone(value) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

if (!assertSupportedTimezone(env.defaultTimezone)) {
  throw new Error(`DEFAULT_TIMEZONE is invalid: ${env.defaultTimezone}`);
}
