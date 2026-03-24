import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  getMe,
  updateMe,
  changePassword,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(registerUser));
authRouter.post("/login", asyncHandler(loginUser));
authRouter.post("/google", asyncHandler(loginWithGoogle));
authRouter.get("/me", protect, asyncHandler(getMe));
authRouter.patch("/me", protect, asyncHandler(updateMe));
authRouter.post("/change-password", protect, asyncHandler(changePassword));
