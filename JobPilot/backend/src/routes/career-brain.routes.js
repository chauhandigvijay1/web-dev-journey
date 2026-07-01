import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { uploadResumeMemory } from "../middleware/upload.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getCareerBrain,
  uploadResumeToCareerBrain,
  updateCareerBrain,
  downloadResume,
  deleteResume,
} from "../controllers/career-brain.controller.js";

export const careerBrainRouter = Router();

careerBrainRouter.use(protect);

careerBrainRouter.get("/", asyncHandler(getCareerBrain));
careerBrainRouter.get("/resume/download", asyncHandler(downloadResume));
careerBrainRouter.post("/resume", uploadResumeMemory, asyncHandler(uploadResumeToCareerBrain));
careerBrainRouter.delete("/resume", asyncHandler(deleteResume));
careerBrainRouter.patch("/", asyncHandler(updateCareerBrain));
