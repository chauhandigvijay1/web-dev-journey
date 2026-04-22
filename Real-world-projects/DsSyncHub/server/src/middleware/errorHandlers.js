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

const errorHandler = (err, _req, res, _next) => {
  const statusCode = getErrorStatusCode(err)
  const isProduction = process.env.NODE_ENV === 'production'
  const message =
    err?.name === 'MulterError'
      ? 'File upload failed. Please check the file size and type.'
      : statusCode === 500 && isProduction
        ? 'Internal server error'
        : err.message || 'Internal server error'

  if (!isProduction) {
    console.error(err)
  }

  return res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = {
  notFoundHandler,
  errorHandler,
}
