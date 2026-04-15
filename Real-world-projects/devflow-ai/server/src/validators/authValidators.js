const { body } = require("express-validator");
// At least 8 characters, one lowercase, one uppercase, one digit 0–9
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
// Letters and numbers only (no spaces or special characters)
const usernameRegex = /^[a-zA-Z0-9]{3,40}$/;

const registerValidator = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password")
    .matches(strongPasswordRegex)
    .withMessage(
      "Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one digit (0–9)"
    ),
];

const signupValidator = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .matches(usernameRegex)
    .withMessage(
      "Username must be 3–40 characters and use only letters and numbers (no special characters)"
    ),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password")
    .matches(strongPasswordRegex)
    .withMessage(
      "Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one digit (0–9)"
    ),
];

const loginValidator = [
  body("identifier")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Username or email is required"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  body().custom((value) => {
    if (!value?.identifier && !value?.email) {
      throw new Error("Username or email is required");
    }
    return true;
  }),
];

const forgotPasswordValidator = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
];

const resetPasswordValidator = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .matches(strongPasswordRegex)
    .withMessage(
      "Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one digit (0–9)"
    ),
];

const updateProfileValidator = [
  body("name").optional().trim().isLength({ min: 2, max: 60 }).withMessage("Name must be between 2 and 60 characters"),
  body("username")
    .optional()
    .trim()
    .isLength({ max: 40 })
    .withMessage("Username cannot exceed 40 characters")
    .matches(usernameRegex)
    .withMessage(
      "Username must be 3–40 characters and use only letters and numbers (no special characters)"
    ),
  body("contact").optional().trim().isLength({ max: 25 }).withMessage("Contact cannot exceed 25 characters"),
  body("phone").optional().trim().isLength({ max: 25 }).withMessage("Phone cannot exceed 25 characters"),
  body("avatar").optional().isString().withMessage("Avatar must be a valid string"),
  body("profileImage").optional().isString().withMessage("Profile image must be a valid string"),
];

module.exports = {
  registerValidator,
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
};
