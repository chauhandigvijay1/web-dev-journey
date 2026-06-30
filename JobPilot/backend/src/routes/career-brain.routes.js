import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { uploadResumeMemory } from "../middleware/upload.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getCareerBrain,
  uploadResumeToCareerBrain,
  updateCareerBrain,
} from "../controllers/career-brain.controller.js";

export const careerBrainRouter = Router();

careerBrainRouter.use(protect);

careerBrainRouter.get("/", asyncHandler(getCareerBrain));
careerBrainRouter.post("/resume", uploadResumeMemory, asyncHandler(uploadResumeToCareerBrain));
careerBrainRouter.patch("/", asyncHandler(updateCareerBrain));
