const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  applyCoupon,
  billingConfig,
  cancelBilling,
  checkoutBilling,
  getBillingHistory,
  getCurrentBilling,
  listCoupons,
  resumeBilling,
  seedCouponsEndpoint,
  verifyBillingPayment,
} = require('../controllers/billingController')

const router = express.Router()

router.use(authMiddleware)
router.get('/current', getCurrentBilling)
router.get('/history', getBillingHistory)
router.get('/config', billingConfig)
router.get('/coupons', listCoupons)
router.post('/checkout', checkoutBilling)
router.post('/verify-payment', verifyBillingPayment)
router.post('/apply-coupon', applyCoupon)
router.post('/seed-coupons', seedCouponsEndpoint)
router.patch('/cancel', cancelBilling)
router.patch('/resume', resumeBilling)

module.exports = router
