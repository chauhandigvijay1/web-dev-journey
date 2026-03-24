import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { authRouter } from "./auth.routes.js";
import { jobRouter } from "./job.routes.js";
import { uploadRouter } from "./upload.routes.js";
import { aiRouter } from "./ai.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/jobs", jobRouter);
apiRouter.use("/upload", uploadRouter);
apiRouter.use("/ai", aiRouter);
