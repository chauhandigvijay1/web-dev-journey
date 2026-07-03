const logger = require('../services/logger')

const notFoundHandler = (req, res, _next) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

const getErrorStatusCode = (err) => {
  if (err?.statusCode) return err.statusCode
  if (err?.name === 'ValidationError') return 400
  if (err?.name === 'CastError') return 400
  if (err?.code === 11000) return 409
  if (err?.name === 'MulterError') return 400
  return 500
}

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: 'File is too large. Maximum allowed size is 50 MB.',
  LIMIT_FILE_COUNT: 'Too many files uploaded at once.',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field name.',
  LIMIT_FIELD_KEY: 'Field name too long.',
  LIMIT_FIELD_VALUE: 'Field value too long.',
  LIMIT_FIELD_COUNT: 'Too many fields.',
  LIMIT_PART_COUNT: 'Too many parts.',
}

const getMulterMessage = (err) => {
  if (err?.code && MULTER_MESSAGES[err.code]) return MULTER_MESSAGES[err.code]
  return 'File upload failed. Please check the file size and type.'
}

const errorHandler = (err, _req, res, _next) => {
  const statusCode = getErrorStatusCode(err)
  const isProduction = process.env.NODE_ENV === 'production'
  const message =
    err?.name === 'MulterError'
      ? getMulterMessage(err)
      : statusCode === 500 && isProduction
        ? 'Internal server error'
        : err.message || 'Internal server error'

  logger.error({ err, statusCode }, `Error: ${err.message || err}`)

  return res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = {
  notFoundHandler,
  errorHandler,
}
