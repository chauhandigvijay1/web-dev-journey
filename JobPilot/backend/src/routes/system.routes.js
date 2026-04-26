import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protectSystemRoute } from "../middleware/system.middleware.js";
import { readMailOutbox, runAutoHunterNow, runRemindersNow } from "../controllers/system.controller.js";

export const systemRouter = Router();

systemRouter.post("/reminders/sweep", protectSystemRoute, asyncHandler(runRemindersNow));
systemRouter.post("/auto-hunter/sweep", protectSystemRoute, asyncHandler(runAutoHunterNow));
systemRouter.get("/mail/outbox", protectSystemRoute, asyncHandler(readMailOutbox));
