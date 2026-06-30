import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protectSystemRoute } from "../middleware/system.middleware.js";
import { readMailOutbox, runRemindersNow } from "../controllers/system.controller.js";

export const systemRouter = Router();

systemRouter.post("/reminders/sweep", protectSystemRoute, asyncHandler(runRemindersNow));
systemRouter.get("/mail/outbox", protectSystemRoute, asyncHandler(readMailOutbox));
