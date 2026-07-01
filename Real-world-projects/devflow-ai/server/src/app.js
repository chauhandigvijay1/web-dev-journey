const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const aiRoutes = require("./routes/aiRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = origin?.replace(/\/+$/, "");

    if (!origin || env.clientUrls.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    const error = new Error(`CORS blocked origin: ${origin}`);
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// This handles OPTIONS preflight globally without Express 5 wildcard routes.
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

// Global rate limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

// Stricter rate limiters for sensitive endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30 });

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/ai/prompt", aiLimiter);
app.use("/api/ai/explain", aiLimiter);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "DevFlow AI API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
