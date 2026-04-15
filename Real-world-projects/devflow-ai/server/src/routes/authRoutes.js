const express = require("express");
const {
  login,
  me,
  register,
  signup,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  registerValidator,
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", registerValidator, validateRequest, register);
router.post("/signup", signupValidator, validateRequest, signup);
router.post("/login", loginValidator, validateRequest, login);
router.post("/forgot-password", forgotPasswordValidator, validateRequest, forgotPassword);
router.post("/reset-password", resetPasswordValidator, validateRequest, resetPassword);
router.get("/me", protect, me);
router.put("/update", protect, updateProfileValidator, validateRequest, updateProfile);

module.exports = router;
