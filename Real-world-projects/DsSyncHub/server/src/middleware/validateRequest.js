const { isStrongPassword, isValidEmail, isValidPhone, isValidUsername } = require('../utils/validators')

const badRequest = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
  })
}

const validateSignup = (req, res, next) => {
  const { fullName, username, email, phone, password, confirmPassword } = req.body
  const errors = {}

  if (!fullName || fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.'
  }

  if (!username || !isValidUsername(username)) {
    errors.username = 'Username must be 3-30 chars and can include . _ -'
  }

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.'
  }

  if (phone && !isValidPhone(phone)) {
    errors.phone = 'Please provide a valid phone number.'
  }

  if (!password || !isStrongPassword(password)) {
    errors.password = 'Password must include upper, lower, number, and special characters.'
  }

  if (!confirmPassword || confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (Object.keys(errors).length > 0) {
    return badRequest(res, errors)
  }

  return next()
}

const validateLogin = (req, res, next) => {
  const { identifier, password } = req.body
  const errors = {}

  if (!identifier || typeof identifier !== 'string') {
    errors.identifier = 'Email, phone, or username is required.'
  }

  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required.'
  }

  if (Object.keys(errors).length > 0) {
    return badRequest(res, errors)
  }

  return next()
}

const validateForgotPassword = (req, res, next) => {
  const email = String(req.body.email || '').trim()
  if (!email || !isValidEmail(email)) {
    return badRequest(res, { email: 'Please provide a valid email address.' })
  }

  return next()
}

const validateResetPassword = (req, res, next) => {
  const { token, password, confirmPassword } = req.body
  const errors = {}

  if (!token || typeof token !== 'string') {
    errors.token = 'A valid reset token is required.'
  }

  if (!password || !isStrongPassword(password)) {
    errors.password = 'Password must include upper, lower, number, and special characters.'
  }

  if (!confirmPassword || confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (Object.keys(errors).length > 0) {
    return badRequest(res, errors)
  }

  return next()
}

module.exports = {
  validateForgotPassword,
  validateSignup,
  validateLogin,
  validateResetPassword,
}
