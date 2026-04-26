import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { autoHunterScanRateLimiter } from "../middleware/security.middleware.js";
import { uploadResumeMemory } from "../middleware/upload.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  dismissAutoHunterMatch,
  getAutoHunterHistory,
  getAutoHunterOverview,
  getAutoHunterSkillInsights,
  getJobHunterPreferences,
  getResumeProfile,
  listAutoHunterMatches,
  runManualAutoHunterScan,
  saveAutoHunterMatch,
  trackAutoHunterMatch,
  unsaveAutoHunterMatch,
  updateJobHunterPreferences,
  uploadResumeProfile,
} from "../controllers/auto-hunter.controller.js";

export const autoHunterRouter = Router();

autoHunterRouter.use(protect);

autoHunterRouter.get("/overview", asyncHandler(getAutoHunterOverview));
autoHunterRouter.get("/resume", asyncHandler(getResumeProfile));
autoHunterRouter.post("/resume", uploadResumeMemory, asyncHandler(uploadResumeProfile));
autoHunterRouter.get("/preferences", asyncHandler(getJobHunterPreferences));
autoHunterRouter.patch("/preferences", asyncHandler(updateJobHunterPreferences));
autoHunterRouter.post("/scan", autoHunterScanRateLimiter, asyncHandler(runManualAutoHunterScan));
autoHunterRouter.get("/matches", asyncHandler(listAutoHunterMatches));
autoHunterRouter.post("/matches/:id/save", asyncHandler(saveAutoHunterMatch));
autoHunterRouter.delete("/matches/:id/save", asyncHandler(unsaveAutoHunterMatch));
autoHunterRouter.post("/matches/:id/dismiss", asyncHandler(dismissAutoHunterMatch));
autoHunterRouter.post("/matches/:id/track", asyncHandler(trackAutoHunterMatch));
autoHunterRouter.get("/history", asyncHandler(getAutoHunterHistory));
autoHunterRouter.get("/skills", asyncHandler(getAutoHunterSkillInsights));
