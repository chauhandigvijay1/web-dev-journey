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


// =========================
// BASIC SETTINGS
// =========================
app.disable("x-powered-by");
app.set("trust proxy", 1);


// =========================
// CORS FIX (FINAL)
// =========================
const allowedOrigins = [
  "https://devflow-ai-client.netlify.app", // Netlify
  "http://localhost:3000", // Local
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow tools like Postman / curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ CORS blocked:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ VERY IMPORTANT (preflight fix)
app.options("*", cors());


// =========================
// SECURITY & MIDDLEWARES
// =========================
app.use(helmet());

app.use(
  morgan("dev", {
    skip: (req) => req.url === "/api/health",
  })
);

app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));


// =========================
// HEALTH CHECK
// =========================
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "DevFlow AI API running 🚀",
  });
});


// =========================
// ROUTES
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/uploads", uploadRoutes);


// ERROR HANDLING
app.use(notFound);
app.use(errorHandler);


// EXPORT
module.exports = app;