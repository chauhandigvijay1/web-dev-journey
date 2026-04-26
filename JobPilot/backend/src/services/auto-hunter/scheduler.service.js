import cron from "node-cron";
import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { ResumeProfile } from "../../models/ResumeProfile.js";
import { User } from "../../models/User.js";
import { logger as defaultLogger } from "../../utils/logger.js";
import { hasTinyFishConfig } from "./tinyfish.service.js";
import { runAutoHunterForUser } from "./hunter.service.js";

let schedulerTask = null;
let runningSweep = null;

export async function runAutoHunterSweep({ logger = defaultLogger } = {}) {
  if (runningSweep) return runningSweep;

  runningSweep = (async () => {
    if (!env.autoHunterEnabled || !hasTinyFishConfig() || mongoose.connection.readyState !== 1) {
      return {
        processedUsers: 0,
        matchesStored: 0,
        alertsSent: 0,
        failures: 0,
      };
    }

    const now = new Date();
    const scanThreshold = new Date(
      now.getTime() - env.autoHunterMinScanIntervalMinutes * 60 * 1000
    );

    const profiles = await ResumeProfile.find({
      isActive: true,
      lastScanStatus: { $ne: "running" },
      $or: [{ lastScanAt: null }, { lastScanAt: { $lte: scanThreshold } }],
    })
      .sort({ lastScanAt: 1, updatedAt: -1 })
      .limit(env.autoHunterMaxUsersPerSweep);

    if (!profiles.length) {
      return {
        processedUsers: 0,
        matchesStored: 0,
        alertsSent: 0,
        failures: 0,
      };
    }

    const userIds = profiles
      .map((profile) => profile.user)
      .filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select(
      "name email emailNotifications settings"
    );
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    let processedUsers = 0;
    let matchesStored = 0;
    let alertsSent = 0;
    let failures = 0;

    for (const profile of profiles) {
      try {
        const user = userMap.get(profile.user?.toString?.() || "");
        if (!user) continue;

        const result = await runAutoHunterForUser(user, { logger });
        if (!result.scanned) continue;
        processedUsers += 1;
        matchesStored += result.matchesStored || 0;
        alertsSent += result.alertsSent || 0;
      } catch (error) {
        failures += 1;
        logger.error("[auto-hunter] Sweep failed for user", {
          userId: profile.user?.toString?.() || "",
          message: error.message,
        });
      }
    }

    logger.info("[auto-hunter] Sweep complete", {
      processedUsers,
      matchesStored,
      alertsSent,
      failures,
    });

    return {
      processedUsers,
      matchesStored,
      alertsSent,
      failures,
    };
  })().finally(() => {
    runningSweep = null;
  });

  return runningSweep;
}

export function startAutoHunterScheduler(logger = defaultLogger) {
  if (schedulerTask) return schedulerTask;
  if (!env.autoHunterEnabled) {
    logger.info("Auto hunter scheduler disabled");
    return null;
  }

  schedulerTask = cron.schedule(
    env.autoHunterCron,
    () => {
      void runAutoHunterSweep({ logger });
    },
    { scheduled: true }
  );

  logger.info("Auto hunter scheduler started");

  if (!hasTinyFishConfig()) {
    logger.warn("TinyFish is not configured; auto hunter scans are idle until TINYFISH_API_KEY is set.");
  }

  return schedulerTask;
}
