import "dotenv/config";
import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { startReminderScheduler } from "./services/reminder.service.js";
import { backfillMissingUsernames } from "./utils/auth.js";
import { logger } from "./utils/logger.js";

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection — shutting down", {
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception — shutting down", { message: err.message, stack: err.stack });
  process.exit(1);
});

async function connectDatabase(retries = 3, delay = 2000) {
  const uri = env.mongoUri;
  if (!uri) {
    logger.warn("MONGO_URI is not set; skipping MongoDB connection.");
    return false;
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        bufferCommands: false,
      });
      logger.info("MongoDB connected");
      return true;
    } catch (err) {
      logger.warn(`MongoDB connection attempt ${attempt}/${retries} failed`, {
        message: err.message,
      });
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delay * attempt));
      }
    }
  }
  logger.error("MongoDB connection failed after all retries — exiting");
  process.exit(1);
}

const dbConnected = await connectDatabase();
if (dbConnected) {
  try {
    await backfillMissingUsernames(logger);
  } catch (err) {
    logger.warn("Username backfill skipped", { message: err.message });
  }
}
startReminderScheduler(logger);

const server = app.listen(env.port, () => {
  logger.info("Server listening", { port: env.port });
});

server.on("error", (err) => {
  logger.error("Server failed to start", { message: err.message, stack: err.stack });
  process.exit(1);
});

function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    mongoose.disconnect().catch(() => {}).finally(() => {
      logger.info("Graceful shutdown complete");
      process.exit(0);
    });
  });
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exitCode = 1;
  }, 15000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
