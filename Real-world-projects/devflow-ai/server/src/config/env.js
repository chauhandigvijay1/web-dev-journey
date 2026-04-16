const dotenv = require("dotenv");

dotenv.config();

const parseCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim().replace(/\/+$/, ""))
    .filter(Boolean);

const clientUrls = Array.from(
  new Set([
    ...parseCsv(process.env.CLIENT_URL),
    ...parseCsv(process.env.CLIENT_URLS),
    "https://devflow-ai-client.netlify.app",
    "http://localhost:3000",
    "http://localhost:5173",
  ])
);

// Core required vars (server cannot boot without these)
const requiredVars = ["MONGO_URI", "JWT_SECRET", "GROQ_API_KEY"];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),

  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  clientUrl: clientUrls[0],
  clientUrls,

  // AI (Groq)
  groqApiKey: process.env.GROQ_API_KEY,
  aiModel: process.env.AI_MODEL || "llama3-8b-8192",

  // Cloudinary (profile image uploads)
  cloudinaryCloudName:
    process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY || "",
  cloudinaryApiSecret:
    process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET || "",

  // Razorpay (payments)
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
};
