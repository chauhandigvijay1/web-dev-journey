import "dotenv/config";
import mongoose from "mongoose";
import { app } from "./app.js";
import { startReminderScheduler } from "./services/reminder.service.js";
import { backfillMissingUsernames } from "./utils/auth.js";

const PORT = Number(process.env.PORT) || 5000;

async function connectDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("MONGO_URI is not set; skipping MongoDB connection.");
    return;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.warn("MongoDB connection failed:", err.message);
  }
}

await connectDatabase();
if (mongoose.connection.readyState === 1) {
  await backfillMissingUsernames();
}
startReminderScheduler();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
