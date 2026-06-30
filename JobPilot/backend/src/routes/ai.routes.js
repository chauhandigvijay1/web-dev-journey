import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateFollowUpEmail,
  generateInterviewQuestions,
  summarizeJob,
  generateCoverLetter,
  generateResumeTailor,
} from "../controllers/ai.controller.js";

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
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
