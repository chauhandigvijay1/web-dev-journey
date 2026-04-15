const env = require("../config/env");

const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

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
