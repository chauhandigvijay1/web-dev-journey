const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  cancelBilling,
  checkoutBilling,
  getBillingHistory,
  getCurrentBilling,
  resumeBilling,
  verifyBillingPayment,
} = require('../controllers/billingController')

const router = express.Router()

router.use(authMiddleware)
router.get('/current', getCurrentBilling)
router.get('/history', getBillingHistory)
router.post('/checkout', checkoutBilling)
router.post('/verify-payment', verifyBillingPayment)
router.patch('/cancel', cancelBilling)
router.patch('/resume', resumeBilling)

module.exports = router
