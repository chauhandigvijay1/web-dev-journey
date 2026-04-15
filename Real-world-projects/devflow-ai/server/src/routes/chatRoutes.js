const express = require("express");
const { createChat, getChatById, getChats, deleteChat } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { createChatValidator, chatIdValidator } = require("../validators/chatValidators");

const router = express.Router();

router.use(protect);
router.post("/", createChatValidator, validateRequest, createChat);
router.get("/", getChats);
router.get("/:id", chatIdValidator, validateRequest, getChatById);
router.delete("/:id", chatIdValidator, validateRequest, deleteChat);

module.exports = router;
