const rawStringFields = new Set([
  'password',
  'confirmPassword',
  'currentPassword',
  'newPassword',
])

const sanitizeValue = (value, key = '') => {
  if (typeof value !== 'string') return value
  if (rawStringFields.has(key)) return value
  return value.replace(/[<>{}$]/g, '').trim()
}

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  const output = Array.isArray(obj) ? [] : {}

  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    if (value && typeof value === 'object') {
      output[key] = sanitizeObject(value)
    } else {
      output[key] = sanitizeValue(value, key)
    }
  })

  return output
}

const sanitizeInput = (req, _res, next) => {
  req.body = sanitizeObject(req.body)
  req.params = sanitizeObject(req.params)
  req.query = sanitizeObject(req.query)
  next()
}

module.exports = sanitizeInput
