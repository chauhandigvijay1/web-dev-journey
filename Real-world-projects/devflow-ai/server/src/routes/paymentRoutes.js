const express = require("express");
const {
  applyCoupon,
  createOrder,
  getBillingStatus,
  verifyPayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/apply-coupon", protect, applyCoupon);
router.get("/status", protect, getBillingStatus);

module.exports = router;
