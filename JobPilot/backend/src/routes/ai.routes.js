import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import {
  generateFollowUpEmail,
  generateInterviewQuestions,
  summarizeJob,
  generateCoverLetter,
  generateResumeTailor,
  scoreAtsForJob,
  getJobRecommendations,
  analyzeSkillGap,
} from "../controllers/ai.controller.js";

const aiRateLimiter = rateLimit({
  windowMs: env.aiRateLimitWindowMinutes * 60 * 1000,
  max: env.aiRateLimitMax,
  message: { success: false, message: "Too many AI requests. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiRouter = Router();

aiRouter.use(protect);
aiRouter.use(aiRateLimiter);

aiRouter.post("/follow-up", asyncHandler(generateFollowUpEmail));
aiRouter.post("/interview-questions", asyncHandler(generateInterviewQuestions));
aiRouter.post("/summarize", asyncHandler(summarizeJob));
aiRouter.post("/cover-letter", asyncHandler(generateCoverLetter));
aiRouter.post("/tailor-resume", asyncHandler(generateResumeTailor));
aiRouter.post("/ats-score", asyncHandler(scoreAtsForJob));
aiRouter.post("/recommendations", asyncHandler(getJobRecommendations));
aiRouter.post("/skill-gap", asyncHandler(analyzeSkillGap));
