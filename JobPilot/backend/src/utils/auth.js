import { User } from "../models/User.js";

const USERNAME_PATTERN = /^(?=.{3,30}$)[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;

export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function normalizeEmail(value) {
  return isNonEmptyString(value) ? value.trim().toLowerCase() : "";
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function normalizeUsername(value) {
  if (!isNonEmptyString(value)) return "";

  let normalized = value.trim().toLowerCase();
  normalized = normalized.replace(/\s+/g, "-");
  normalized = normalized.replace(/[^a-z0-9._-]/g, "");
  normalized = normalized.replace(/^[._-]+|[._-]+$/g, "");
  normalized = normalized.replace(/[._-]{2,}/g, "-");

  return normalized.slice(0, 30);
}

export function isValidUsername(value) {
  return USERNAME_PATTERN.test(normalizeUsername(value));
}

export function getPasswordValidationError(password) {
  if (!isNonEmptyString(password)) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter";
  }
  if (!/\d/.test(password)) {
    return "Password must include at least one number";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character";
  }
  return null;
}

function addCandidate(candidates, value) {
  const normalized = normalizeUsername(value);
  if (normalized.length >= 3 && !candidates.includes(normalized)) {
    candidates.push(normalized);
  }
}

function createUsernameCandidates({ desiredUsername, name, email }) {
  const candidates = [];

  addCandidate(candidates, desiredUsername);

  if (isNonEmptyString(name)) {
    const parts = name
      .trim()
      .split(/\s+/)
      .map((part) => normalizeUsername(part))
      .filter(Boolean);

    if (parts.length > 0) {
      addCandidate(candidates, parts.join(""));
      addCandidate(candidates, parts.join("."));
      if (parts.length > 1) {
        addCandidate(candidates, `${parts[0]}.${parts[parts.length - 1]}`);
      }
    }
  }

  const emailValue = normalizeEmail(email);
  if (emailValue) {
    const [localPart] = emailValue.split("@");
    addCandidate(candidates, localPart);
  }

  addCandidate(candidates, "jobpilot-user");

  return candidates;
}

async function isUsernameAvailable(username, excludeUserId) {
  const existing = await User.findOne({ username }).select("_id").lean();
  if (!existing) return true;
  if (!excludeUserId) return false;
  return String(existing._id) === String(excludeUserId);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function ensureUniqueUsername({
  desiredUsername,
  name,
  email,
  excludeUserId = null,
}) {
  const candidates = createUsernameCandidates({ desiredUsername, name, email });

  for (const candidate of candidates) {
    if (await isUsernameAvailable(candidate, excludeUserId)) {
      return candidate;
    }
  }

  const base = candidates[0] || "jobpilot-user";

  const escapedBase = escapeRegex(base.slice(0, 27));
  const existing = await User.find({ username: { $regex: `^${escapedBase}\\d+$` } }).select("username").lean();
  const taken = new Set(existing.map((u) => u.username));

  for (let counter = 1; counter <= 9999; counter += 1) {
    const suffix = String(counter);
    const candidate = `${base}${suffix}`.slice(0, 30);
    if (!taken.has(candidate) && await isUsernameAvailable(candidate, excludeUserId)) {
      return candidate;
    }
    taken.add(candidate);
  }

  const fallback = `jp${Date.now().toString(36)}`.slice(0, 30);
  return fallback.length >= 3 ? fallback : "jobpilot-user";
}

export async function ensureUserHasUsername(user) {
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

export async function backfillMissingUsernames(logger = console) {
  const users = await User.find({
    $or: [{ username: { $exists: false } }, { username: null }, { username: "" }],
  }).lean();

  if (users.length === 0) {
    return 0;
  }

  const updates = await Promise.all(
    users.map(async (user) => {
      const username = await ensureUniqueUsername({
        name: user.name,
        email: user.email,
        excludeUserId: user._id,
      });
      return {
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { username } },
        },
      };
    })
  );

  await User.bulkWrite(updates);

  logger.info(`[auth] Backfilled usernames for ${users.length} user(s)`);
  return users.length;
}

export function getGoogleClientId() {
  return (
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    ""
  );
}
