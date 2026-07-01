const env = require("../config/env");

const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const getMongooseStatusCode = (error) => {
  if (error.name === "CastError") return 400;
  if (error.name === "ValidationError") return 400;
  if (error.code === 11000) return 409;
  return null;
};

const getMongooseMessage = (error) => {
  if (error.name === "CastError") return `Invalid ${error.path}: "${error.value}"`;
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors || {}).map((e) => e.message);
    return messages.join(". ");
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {}).join(", ");
    return `${field} already exists`;
  }
  return null;
};

const errorHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  // Mongoose-specific errors → proper 4xx
  const mongooseCode = getMongooseStatusCode(error);
  const mongooseMsg = getMongooseMessage(error);
  if (mongooseCode !== null && mongooseMsg !== null) {
    statusCode = mongooseCode;
    message = mongooseMsg;
  }

  const rawMessage = String(error?.message || "");
  const isInfraConnectivityIssue =
    rawMessage.includes("ENOTFOUND") ||
    rawMessage.includes("ECONNREFUSED") ||
    rawMessage.includes("ETIMEDOUT") ||
    rawMessage.includes("MongoNetworkError") ||
    rawMessage.includes("MongooseServerSelectionError");

  if (isInfraConnectivityIssue) {
    statusCode = 503;
    message = "Service is temporarily unavailable. Please try again shortly.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv !== "production" && { stack: error.stack }),
  });
};

module.exports = { notFound, errorHandler };
