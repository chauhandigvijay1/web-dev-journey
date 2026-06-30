import "dotenv/config";
import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { startReminderScheduler } from "./services/reminder.service.js";
import { backfillMissingUsernames } from "./utils/auth.js";
import { logger } from "./utils/logger.js";

// Never let an unhandled async rejection take the process down — transient network
// blips to MongoDB/Atlas can surface as unhandled rejections from the driver and
// would otherwise crash the API. Log and continue; route handlers already respond
// with errors when the DB is unreachable.
process.on("unhandledRejection", (reason) => {
  logger.warn("Unhandled promise rejection", {
    message: reason instanceof Error ? reason.message : String(reason),
    name: reason?.name || "Unknown",
  });
});

async function connectDatabase() {
  const uri = env.mongoUri;
  if (!uri) {
    logger.warn("MONGO_URI is not set; skipping MongoDB connection.");
    return;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.warn("MongoDB connection failed", { message: err.message });
  }
}

await connectDatabase();
if (mongoose.connection.readyState === 1) {
  try {
    await backfillMissingUsernames(logger);
  } catch (err) {
    logger.warn("Username backfill skipped", { message: err.message });
  }
}
startReminderScheduler(logger);

app.listen(env.port, () => {
  logger.info("Server listening", { port: env.port });
});
