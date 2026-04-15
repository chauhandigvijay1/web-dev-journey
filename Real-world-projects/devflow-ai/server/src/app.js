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


// ✅ CORS FIX (IMPORTANT)
const allowedOrigins = [
  env.clientUrl, // Netlify URL
  "http://localhost:3000", // local dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


// ✅ Middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
  })
);

app.use(express.json({ limit: "1mb" }));


// ✅ Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "DevFlow AI API running 🚀" });
});


// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/uploads", uploadRoutes);



/// app.use("/api/payment", paymentRoutes);
/// app.use("/api/upload", uploadRoutes);


// ✅ Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;