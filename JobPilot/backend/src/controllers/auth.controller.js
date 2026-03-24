import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";
import {
  ensureUniqueUsername,
  ensureUserHasUsername,
  getGoogleClientId,
  getPasswordValidationError,
  isNonEmptyString,
  isValidEmail,
  isValidUsername,
  normalizeEmail,
  normalizeUsername,
} from "../utils/auth.js";
import { generateToken } from "../utils/jwt.js";

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
};

const googleClients = new Map();

function normalizeSettings(settings = {}) {
  return {
    jobPreferences: {
      preferredJobType: settings.jobPreferences?.preferredJobType || "",
      preferredLocation: settings.jobPreferences?.preferredLocation || "",
      expectedSalaryRange: settings.jobPreferences?.expectedSalaryRange || "",
    },
    productivity: {
      defaultFollowUpDays:
        typeof settings.productivity?.defaultFollowUpDays === "number"
          ? settings.productivity.defaultFollowUpDays
          : DEFAULT_SETTINGS.productivity.defaultFollowUpDays,
      autoMarkGhostedDays:
        typeof settings.productivity?.autoMarkGhostedDays === "number"
          ? settings.productivity.autoMarkGhostedDays
          : DEFAULT_SETTINGS.productivity.autoMarkGhostedDays,
    },
  };
}

function publicUser(user) {
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

function getGoogleClient(clientId) {
  if (!googleClients.has(clientId)) {
    googleClients.set(clientId, new OAuth2Client(clientId));
  }
  return googleClients.get(clientId);
}

function duplicateFieldMessage(error) {
  if (error?.code !== 11000) return null;

  const fields = Object.keys(error.keyPattern || error.keyValue || {});
  const field = fields[0];

  if (field === "email") return "Email already registered";
  if (field === "username") return "Username is already taken";
  if (field === "googleId") return "Google account is already linked";

  return "Account already exists";
}

async function sendAuthSuccess(res, user, status = 200) {
  if (await ensureUserHasUsername(user)) {
    await user.save();
  }

  let token;
  try {
    token = generateToken(user._id);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }

  return res.status(status).json({
    success: true,
    data: { token, user: publicUser(user) },
  });
}

async function verifyGoogleCredential(credential) {
  const clientId = getGoogleClientId();
  if (!clientId) {
    const err = new Error("Google sign-in is not configured");
    err.statusCode = 503;
    throw err;
  }

  try {
    const client = getGoogleClient(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload?.email || payload.email_verified !== true) {
      const err = new Error("Google account could not be verified");
      err.statusCode = 401;
      throw err;
    }

    return payload;
  } catch (error) {
    const err = new Error(error.message || "Google sign-in failed");
    err.statusCode = error.statusCode || 401;
    throw err;
  }
}

function isValidProfileUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseBoundedInteger(value, min, max) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    return null;
  }
  return number;
}

export async function registerUser(req, res) {
  const { name, username, email, password, emailNotifications } = req.body ?? {};

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) {
    return res.status(400).json({ success: false, message: "Username is required" });
  }
  if (!isValidUsername(normalizedUsername)) {
    return res.status(400).json({
      success: false,
      message:
        "Username must be 3-30 characters and use only letters, numbers, dots, dashes, or underscores",
    });
  }
  if (!isNonEmptyString(email) || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Valid email is required" });
  }
  const passwordValidationError = getPasswordValidationError(password);
  if (passwordValidationError) {
    return res.status(400).json({ success: false, message: passwordValidationError });
  }

  const normalizedEmail = normalizeEmail(email);
  const existingEmail = await User.findOne({ email: normalizedEmail }).lean();
  if (existingEmail) {
    return res.status(409).json({ success: false, message: "Email already registered" });
  }
  const existingUsername = await User.findOne({ username: normalizedUsername }).lean();
  if (existingUsername) {
    return res.status(409).json({ success: false, message: "Username is already taken" });
  }

  let user;
  try {
    user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      hasPassword: true,
      emailNotifications:
        typeof emailNotifications === "boolean" ? emailNotifications : true,
    });
  } catch (err) {
    const duplicateMessage = duplicateFieldMessage(err);
    if (duplicateMessage) {
      return res.status(409).json({ success: false, message: duplicateMessage });
    }
    throw err;
  }

  return sendAuthSuccess(res, user, 201);
}

export async function loginUser(req, res) {
  const { identifier, email, username, password } = req.body ?? {};
  const loginIdentifier = identifier ?? email ?? username;

  if (!isNonEmptyString(loginIdentifier) || !isNonEmptyString(password)) {
    return res.status(400).json({
      success: false,
      message: "Email or username and password are required",
    });
  }

  const normalizedIdentifier = String(loginIdentifier).trim();
  const normalizedEmail = normalizeEmail(normalizedIdentifier);
  const normalizedUsername = normalizeUsername(normalizedIdentifier);
  const query = isValidEmail(normalizedIdentifier)
    ? { email: normalizedEmail }
    : { $or: [{ username: normalizedUsername }, { email: normalizedEmail }] };

  const user = await User.findOne(query).select("+password");
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  if (user.hasPassword === false || !user.password) {
    return res.status(400).json({
      success: false,
      message: "This account uses Google sign-in. Continue with Google to access it.",
    });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  return sendAuthSuccess(res, user);
}

export async function loginWithGoogle(req, res) {
  const credential = typeof req.body?.credential === "string" ? req.body.credential.trim() : "";
  if (!credential) {
    return res.status(400).json({ success: false, message: "Google credential is required" });
  }

  const payload = await verifyGoogleCredential(credential);
  const normalizedEmail = normalizeEmail(payload.email);
  const displayName = isNonEmptyString(payload.name)
    ? payload.name.trim()
    : normalizedEmail.split("@")[0];
  const picture = isNonEmptyString(payload.picture) ? payload.picture.trim() : "";

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: normalizedEmail }],
  });

  if (user) {
    if (user.googleId && user.googleId !== payload.sub) {
      return res.status(409).json({
        success: false,
        message: "This email is already linked to another Google account",
      });
    }

    if (!normalizeUsername(user.username)) {
      user.username = await ensureUniqueUsername({
        name: displayName,
        email: normalizedEmail,
        excludeUserId: user._id,
      });
    }

    user.googleId = payload.sub;
    user.email = normalizedEmail;
    user.name = isNonEmptyString(user.name) ? user.name.trim() : displayName;
    if (picture && !user.profilePic) {
      user.profilePic = picture;
    }
    await user.save();
  } else {
    const generatedUsername = await ensureUniqueUsername({
      name: displayName,
      email: normalizedEmail,
    });

    try {
      user = await User.create({
        name: displayName,
        username: generatedUsername,
        email: normalizedEmail,
        googleId: payload.sub,
        hasPassword: false,
        profilePic: picture,
      });
    } catch (err) {
      const duplicateMessage = duplicateFieldMessage(err);
      if (duplicateMessage) {
        return res.status(409).json({ success: false, message: duplicateMessage });
      }
      throw err;
    }
  }

  return sendAuthSuccess(res, user);
}

export async function getMe(req, res) {
  if (await ensureUserHasUsername(req.user)) {
    await req.user.save();
  }
  return res.json({ success: true, data: { user: publicUser(req.user) } });
}

export async function updateMe(req, res) {
  const body = req.body ?? {};

  if (!req.user.settings) {
    req.user.settings = normalizeSettings();
  }

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    if (!isNonEmptyString(body.name)) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    req.user.name = body.name.trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, "phone")) {
    if (body.phone == null || body.phone === "") {
      req.user.phone = "";
    } else if (typeof body.phone !== "string") {
      return res.status(400).json({ success: false, message: "Phone must be a string" });
    } else {
      const phone = body.phone.trim();
      if (phone.length > 32) {
        return res.status(400).json({ success: false, message: "Phone is too long" });
      }
      req.user.phone = phone;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "bio")) {
    if (body.bio == null || body.bio === "") {
      req.user.bio = "";
    } else if (typeof body.bio !== "string") {
      return res.status(400).json({ success: false, message: "Bio must be a string" });
    } else {
      const bio = body.bio.trim();
      if (bio.length > 280) {
        return res.status(400).json({ success: false, message: "Bio is too long" });
      }
      req.user.bio = bio;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "profilePic")) {
    if (body.profilePic == null || body.profilePic === "") {
      req.user.profilePic = "";
    } else if (!isValidProfileUrl(body.profilePic)) {
      return res.status(400).json({ success: false, message: "Profile image URL is invalid" });
    } else {
      req.user.profilePic = body.profilePic.trim();
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "emailNotifications")) {
    if (typeof body.emailNotifications !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "emailNotifications must be a boolean" });
    }
    req.user.emailNotifications = body.emailNotifications;
  }

  if (Object.prototype.hasOwnProperty.call(body, "settings")) {
    if (body.settings == null || typeof body.settings !== "object" || Array.isArray(body.settings)) {
      return res.status(400).json({ success: false, message: "Settings must be an object" });
    }
    const settings = body.settings;

    if (
      Object.prototype.hasOwnProperty.call(settings, "jobPreferences") &&
      (settings.jobPreferences == null ||
        typeof settings.jobPreferences !== "object" ||
        Array.isArray(settings.jobPreferences))
    ) {
      return res.status(400).json({ success: false, message: "jobPreferences must be an object" });
    }

    if (
      Object.prototype.hasOwnProperty.call(settings, "productivity") &&
      (settings.productivity == null ||
        typeof settings.productivity !== "object" ||
        Array.isArray(settings.productivity))
    ) {
      return res.status(400).json({ success: false, message: "productivity must be an object" });
    }

    const jobPreferences = settings.jobPreferences ?? {};
    const productivity = settings.productivity ?? {};

    if (Object.prototype.hasOwnProperty.call(jobPreferences, "preferredJobType")) {
      if (jobPreferences.preferredJobType == null || jobPreferences.preferredJobType === "") {
        req.user.settings.jobPreferences.preferredJobType = "";
      } else if (typeof jobPreferences.preferredJobType !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "preferredJobType must be a string" });
      } else {
        req.user.settings.jobPreferences.preferredJobType = jobPreferences.preferredJobType.trim();
      }
    }

    if (Object.prototype.hasOwnProperty.call(jobPreferences, "preferredLocation")) {
      if (jobPreferences.preferredLocation == null || jobPreferences.preferredLocation === "") {
        req.user.settings.jobPreferences.preferredLocation = "";
      } else if (typeof jobPreferences.preferredLocation !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "preferredLocation must be a string" });
      } else {
        req.user.settings.jobPreferences.preferredLocation = jobPreferences.preferredLocation.trim();
      }
    }

    if (Object.prototype.hasOwnProperty.call(jobPreferences, "expectedSalaryRange")) {
      if (jobPreferences.expectedSalaryRange == null || jobPreferences.expectedSalaryRange === "") {
        req.user.settings.jobPreferences.expectedSalaryRange = "";
      } else if (typeof jobPreferences.expectedSalaryRange !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "expectedSalaryRange must be a string" });
      } else {
        req.user.settings.jobPreferences.expectedSalaryRange =
          jobPreferences.expectedSalaryRange.trim();
      }
    }

    if (Object.prototype.hasOwnProperty.call(productivity, "defaultFollowUpDays")) {
      const value = parseBoundedInteger(productivity.defaultFollowUpDays, 0, 30);
      if (value == null) {
        return res
          .status(400)
          .json({ success: false, message: "defaultFollowUpDays must be between 0 and 30" });
      }
      req.user.settings.productivity.defaultFollowUpDays = value;
    }

    if (Object.prototype.hasOwnProperty.call(productivity, "autoMarkGhostedDays")) {
      const value = parseBoundedInteger(productivity.autoMarkGhostedDays, 0, 365);
      if (value == null) {
        return res
          .status(400)
          .json({ success: false, message: "autoMarkGhostedDays must be between 0 and 365" });
      }
      req.user.settings.productivity.autoMarkGhostedDays = value;
    }
  }

  if (!req.user.isModified()) {
    return res.status(400).json({ success: false, message: "No valid changes provided" });
  }

  await req.user.save();

  return res.json({ success: true, data: { user: publicUser(req.user) } });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body ?? {};

  if (req.user.hasPassword === false) {
    return res.status(400).json({
      success: false,
      message: "Password sign-in is not enabled for this account",
    });
  }

  if (!isNonEmptyString(currentPassword) || !isNonEmptyString(newPassword)) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required",
    });
  }

  const passwordValidationError = getPasswordValidationError(newPassword);
  if (passwordValidationError) {
    return res.status(400).json({
      success: false,
      message: passwordValidationError,
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from the current password",
    });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (!user.password) {
    return res.status(400).json({
      success: false,
      message: "Password sign-in is not enabled for this account",
    });
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    return res.status(401).json({ success: false, message: "Current password is incorrect" });
  }

  user.password = newPassword;
  user.hasPassword = true;
  await user.save();

  return res.json({ success: true, message: "Password updated successfully" });
}
