const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const usernameRegex = /^(?=.{3,30}$)[a-zA-Z0-9]+(?:[._-]?[a-zA-Z0-9]+)*$/
const phoneRegex = /^\+?[1-9]\d{7,14}$/

const isValidEmail = (value) => emailRegex.test(value)
const isValidUsername = (value) => usernameRegex.test(value)
const isValidPhone = (value) => phoneRegex.test(value)

const getPasswordStrength = (password) => {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

const isStrongPassword = (password) => getPasswordStrength(password) >= 4

module.exports = {
  isValidEmail,
  isValidUsername,
  isValidPhone,
  isStrongPassword,
}
