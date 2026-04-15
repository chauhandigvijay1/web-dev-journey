const Groq = require("groq-sdk");
const Chat = require("../models/Chat");
const User = require("../models/User");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const client = new Groq({
  apiKey: env.groqApiKey,
});

const isSameUtcDate = (firstDate, secondDate) => {
  if (!firstDate || !secondDate) return false;
  return (
    firstDate.getUTCFullYear() === secondDate.getUTCFullYear() &&
    firstDate.getUTCMonth() === secondDate.getUTCMonth() &&
    firstDate.getUTCDate() === secondDate.getUTCDate()
  );
};

// Stream assistant tokens to the client over SSE.
const sendPrompt = asyncHandler(async (req, res) => {
  const { chatId, prompt } = req.body;

  if (!prompt) throw new AppError("Prompt required", 400);

  const chat = await Chat.findOne({
    _id: chatId,
    userId: req.user._id,
  });

  if (!chat) throw new AppError("Chat not found", 404);

  const user = await User.findById(req.user._id);
  if (!user) throw new AppError("User not found", 401);

  if (!user.subscription || typeof user.subscription === "string") {
    const legacyPlan = typeof user.subscription === "string" ? user.subscription : "free";
    user.subscription = {
      plan: legacyPlan === "pro" ? "pro" : "free",
      status: legacyPlan === "pro" ? "active" : "inactive",
      expiresAt: legacyPlan === "pro" ? user.subscription?.expiresAt : undefined,
    };
  }

  if (!user.usage || typeof user.usage !== "object") {
    user.usage = { dailyCount: 0, lastReset: new Date() };
  }

  const now = new Date();
  const plan = user.subscription?.plan || "free";
  const expiresAt = user.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : null;
  const isProExpired = plan === "pro" && expiresAt && expiresAt <= now;
  if (isProExpired) {
    user.subscription.plan = "free";
    user.subscription.status = "inactive";
    user.subscription.expiresAt = undefined;
  }

  if (!isSameUtcDate(user.usage.lastReset, now)) {
    user.usage.dailyCount = 0;
    user.usage.lastReset = now;
  }

  const finalPlan = user.subscription?.plan || "free";
  const DAILY_LIMIT = 20;

  if (finalPlan === "free" && user.usage.dailyCount >= DAILY_LIMIT) {
    await user.save({ validateBeforeSave: false });
    throw new AppError("Daily limit reached. Upgrade to Pro.", 429);
  }

  // keep user prompt in chat history
  chat.messages.push({ role: "user", content: prompt });

  if (chat.title?.trim().toLowerCase() === "new chat") {
    chat.title = prompt.trim().slice(0, 60) || "New Chat";
  }

  // request streaming completion from Groq
  const stream = await client.chat.completions.create({
    model: env.aiModel,
    messages: chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    stream: true,
  });

  // SSE headers for incremental token delivery
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let finalText = "";
  try {
    for await (const chunk of stream) {
      const token = chunk?.choices?.[0]?.delta?.content || "";
      finalText += token;

      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }

    if (!finalText.trim()) {
      finalText = "⚠️ No response from AI";
      res.write(`data: ${JSON.stringify({ token: finalText })}\n\n`);
    }

    // persist full assistant reply once stream ends
    chat.messages.push({ role: "assistant", content: finalText });
    user.usage.dailyCount += 1;
    await chat.save();
    await user.save();

    if (!res.writableEnded) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } catch (error) {
    // When SSE has started, never throw to Express error middleware.
    if (res.headersSent) {
      if (!finalText.trim() && !res.writableEnded) {
        res.write(
          `data: ${JSON.stringify({
            token: "⚠️ Something went wrong while generating response. Please try again.",
          })}\n\n`
        );
      }
      if (!res.writableEnded) {
        res.write("data: [DONE]\n\n");
        res.end();
      }
      return;
    }
    throw error;
  }
});

// Single-request endpoint for code explanation.
const explainCode = asyncHandler(async (req, res) => {
  const { code, language } = req.body;

  if (!code) throw new AppError("Code is required", 400);

  const response = await client.chat.completions.create({
    model: env.aiModel,
    messages: [
      {
        role: "system",
        content: "You are a senior developer who explains code simply.",
      },
      {
        role: "user",
        content: `Explain this ${language || "code"}:\n\n${code}`,
      },
    ],
  });

  const explanation =
    response?.choices?.[0]?.message?.content || "No explanation";

  res.json({
    success: true,
    data: { explanation },
  });
});

module.exports = { sendPrompt, explainCode };