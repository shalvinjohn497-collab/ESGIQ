// Wraps async handlers — errors go to errorHandler automatically
export function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
}

// Global error handler — registered last in app.js
export function errorHandler(err, req, res, _next) {
  // Mongoose validation
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }))
    return res.status(400).json({ success: false, error: 'Validation failed', details })
  }

  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({ success: false, error: `${field} is already registered` })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' })
  }

  const status  = err.status || 500
  const message = err.message || 'Internal server error'

  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message)

  res.status(status).json({
    success: false,
    error:   message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}