const User = require("../models/User");
const Subscription = require("../models/Subscription");
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/token");
const env = require("../config/env");

const mapUser = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username || "",
  email: user.email,
  role: user.role,
  subscription: {
    plan:
      typeof user.subscription === "string"
        ? user.subscription
        : user.subscription?.plan || "free",
    status:
      typeof user.subscription === "string"
        ? user.subscription === "pro"
          ? "active"
          : "inactive"
        : user.subscription?.status || "inactive",
    expiresAt: typeof user.subscription === "object" ? user.subscription?.expiresAt : null,
  },
  usage: {
    dailyCount: user.usage?.dailyCount || 0,
    lastReset: user.usage?.lastReset || null,
  },
  phone: user.contact || "",
  profileImage: user.avatar || "",
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });

  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    subscription: { plan: "free", status: "inactive" },
    usage: { dailyCount: 0, lastReset: new Date() },
  });
  await Subscription.create({ userId: user._id, plan: "free", status: "active" });

  const token = signToken({ id: user._id, role: user.role });

  res.status(201).json({
    success: true,
    data: {
      token,
      user: mapUser(user),
    },
  });
});

const signup = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();

  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    throw new AppError("Email already exists", 409);
  }

  const normalizedUsername = username.trim().toLowerCase();
  const existingUsername = await User.findOne({ username: normalizedUsername });
  if (existingUsername) {
    throw new AppError("Username already taken", 409);
  }

  const user = await User.create({
    name: name.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    subscription: { plan: "free", status: "inactive" },
    usage: { dailyCount: 0, lastReset: new Date() },
  });
  await Subscription.create({ userId: user._id, plan: "free", status: "active" });

  const token = signToken({ id: user._id, role: user.role });
  res.status(201).json({
    success: true,
    token,
    user: mapUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { identifier, email, password } = req.body;
  const loginValue = (identifier || email || "").trim().toLowerCase();
  if (!loginValue) {
    throw new AppError("Username or email is required", 400);
  }
  const user = await User.findOne({
    $or: [{ email: loginValue }, { username: loginValue }],
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signToken({ id: user._id, role: user.role });

  res.json({
    success: true,
    data: {
      token,
      user: mapUser(user),
    },
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: mapUser(req.user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "username", "contact", "avatar"];
  const updateData = {};
  const payload = {
    ...req.body,
    ...(typeof req.body.phone !== "undefined" ? { contact: req.body.phone } : {}),
    ...(typeof req.body.profileImage !== "undefined" ? { avatar: req.body.profileImage } : {}),
  };

  for (const field of allowedFields) {
    if (typeof payload[field] !== "undefined") {
      updateData[field] =
        field === "username" ? String(payload[field]).trim().toLowerCase() : payload[field];
    }
  }

  if (updateData.username) {
    const existingUsername = await User.findOne({
      username: updateData.username,
      _id: { $ne: req.user._id },
    });
    if (existingUsername) {
      throw new AppError("Username already taken", 409);
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: mapUser(user) });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    res.json({ success: true, message: "If account exists, reset instructions are generated." });
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "Password reset token generated.",
    data:
      env.nodeEnv === "production"
        ? { expiresInMinutes: 15 }
        : {
            token: rawToken,
            expiresInMinutes: 15,
          },
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token) {
    throw new AppError("Reset token is required", 400);
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+password +resetPasswordToken +resetPasswordExpires");

  if (!user) {
    throw new AppError("Reset token is invalid or expired", 400);
  }

  user.password = password;
  user.resetPasswordToken = "";
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful." });
});

module.exports = {
  register,
  signup,
  login,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
};
