import "dotenv/config";
import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { startAutoHunterScheduler } from "./services/auto-hunter/scheduler.service.js";
import { startReminderScheduler } from "./services/reminder.service.js";
import { backfillMissingUsernames } from "./utils/auth.js";
import { logger } from "./utils/logger.js";

async function connectDatabase() {
  const uri = env.mongoUri;
  if (!uri) {
    logger.warn("MONGO_URI is not set; skipping MongoDB connection.");
    return;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.warn("MongoDB connection failed", { message: err.message });
  }
}

await connectDatabase();
if (mongoose.connection.readyState === 1) {
  await backfillMissingUsernames(logger);
}
startReminderScheduler(logger);
startAutoHunterScheduler(logger);

app.listen(env.port, () => {
  logger.info("Server listening", { port: env.port });
});
