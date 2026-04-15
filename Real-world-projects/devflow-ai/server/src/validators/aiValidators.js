const { body } = require("express-validator");

const sendPromptValidator = [
  body("chatId").isMongoId().withMessage("Valid chat id is required"),
  body("prompt")
    .isString()
    .withMessage("Prompt must be a valid string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Prompt is required")
    .isLength({ max: 8000 })
    .withMessage("Prompt is too long"),
];

const explainCodeValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Code is required")
    .isLength({ max: 50000 })
    .withMessage("Code payload is too long"),
  body("language").optional().isString().isLength({ max: 50 }),
];

module.exports = { sendPromptValidator, explainCodeValidator };
