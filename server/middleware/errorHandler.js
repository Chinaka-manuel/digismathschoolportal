export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}`, errors: [] })
}

export function errorHandler(error, req, res, next) {
  const status = error.statusCode || (error.name === 'MulterError' ? 422 : error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError' ? 401 : 500)
  res.status(status).json({
    success: false,
    message: status === 500 ? 'An unexpected server error occurred' : error.message,
    errors: error.errors || [],
  })
}
