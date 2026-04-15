const { body, param } = require("express-validator");

const createChatValidator = [
  body("title").optional().isString().isLength({ min: 1, max: 120 }),
  body("message").optional().isString().isLength({ min: 1 }),
];

const chatIdValidator = [param("id").isMongoId().withMessage("Invalid chat id")];

module.exports = { createChatValidator, chatIdValidator };
