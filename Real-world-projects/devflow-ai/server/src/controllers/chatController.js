const Chat = require("../models/Chat");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");


// CREATE CHAT
const createChat = asyncHandler(async (req, res) => {
  const { title, message } = req.body;

  // Ensure the request is authenticated.
  if (!req.user || !req.user._id) {
    throw new AppError("Unauthorized", 401);
  }

  // CREATE CHAT
  const chat = await Chat.create({
    userId: req.user._id,
    title: title || "New Chat",
    messages: message
      ? [{ role: "user", content: message }]
      : [],
  });

  res.status(201).json({
    success: true,
    data: chat,
  });
});


// Get all chats for the current user.
const getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    userId: req.user._id,
  }).sort({ updatedAt: -1 });

  res.json({
    success: true,
    data: chats,
  });
});


// Get a single chat by id.
const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!chat) {
    throw new AppError("Chat not found", 404);
  }

  res.json({
    success: true,
    data: chat,
  });
});


// Delete a chat by id.
const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!chat) {
    throw new AppError("Chat not found", 404);
  }

  res.json({
    success: true,
    data: { _id: req.params.id },
  });
});


module.exports = {
  createChat,
  getChats,
  getChatById,
  deleteChat,
};