import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env } from "./config/env.js";
import { apiRateLimiter, sanitizeRequest } from "./middleware/security.middleware.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = new Set(env.corsOrigins);

function isLoopbackOrigin(origin) {
  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin?.replace(/\/+$/, "");
      if (
        !origin ||
        normalizedOrigin?.startsWith("chrome-extension://") ||
        isLoopbackOrigin(normalizedOrigin) ||
        allowedOrigins.has(normalizedOrigin)
      ) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(apiRateLimiter);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeRequest);

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Not found",
  });
});

app.use((err, req, res, _next) => {
  console.error(err);

  const status = err?.statusCode || (err.message === "Not allowed by CORS" ? 403 : 500);
  res.status(status).json({
    success: false,
    message: err?.message || "Internal server error",
  });
});
