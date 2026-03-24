import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { uploadImageMemory, uploadResumeMemory } from "../middleware/upload.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadProfileImage, uploadResume } from "../controllers/upload.controller.js";

export const uploadRouter = Router();

uploadRouter.use(protect);

uploadRouter.post("/resume", uploadResumeMemory, asyncHandler(uploadResume));
uploadRouter.post("/profile-image", uploadImageMemory, asyncHandler(uploadProfileImage));
