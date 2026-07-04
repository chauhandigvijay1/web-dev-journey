import { Router } from "express";
import { getHealth } from "../controllers/health.controller.js";
import { healthRateLimiter } from "../middleware/security.middleware.js";

export const healthRouter = Router();

healthRouter.get("/", healthRateLimiter, getHealth);
