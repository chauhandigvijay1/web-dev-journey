import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateFollowUpEmail, summarizeJob } from "../controllers/ai.controller.js";

export const aiRouter = Router();

aiRouter.use(protect);

aiRouter.post("/follow-up", asyncHandler(generateFollowUpEmail));
aiRouter.post("/summarize", asyncHandler(summarizeJob));
