const express = require("express");
const { sendPrompt, explainCode } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { sendPromptValidator, explainCodeValidator } = require("../validators/aiValidators");

const router = express.Router();

router.post("/prompt", protect, sendPromptValidator, validateRequest, sendPrompt);
router.post("/explain", protect, explainCodeValidator, validateRequest, explainCode);

module.exports = router;