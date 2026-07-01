const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new AppError("Token expired. Please log in again.", 401);
    }
    throw new AppError("Invalid token. Please log in again.", 401);
  }

  const user = await User.findById(decoded.id);

  if (!user || user.isDeleted) {
    throw new AppError("User not found", 401);
  }

  req.user = user;
  next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError("Forbidden", 403));
  }

  return next();
};

module.exports = { protect, authorize };
