import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/security.middleware.js";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  getMe,
  updateMe,
  changePassword,
  refreshAuthSession,
  logoutUser,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, asyncHandler(registerUser));
authRouter.post("/login", authRateLimiter, asyncHandler(loginUser));
authRouter.post("/google", authRateLimiter, asyncHandler(loginWithGoogle));
authRouter.post("/refresh", asyncHandler(refreshAuthSession));
authRouter.post("/logout", asyncHandler(logoutUser));
authRouter.get("/me", protect, asyncHandler(getMe));
authRouter.patch("/me", protect, asyncHandler(updateMe));
authRouter.post("/change-password", protect, asyncHandler(changePassword));
