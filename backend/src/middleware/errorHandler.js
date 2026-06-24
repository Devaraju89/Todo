// ============================================================================
// Error Handler Middleware — Centralised error response formatting
// ============================================================================
// Catches any error thrown or passed via next(error) from controllers and
// returns a consistent JSON error shape.
// ============================================================================

const errorHandler = (err, req, res, _next) => {
  console.error('❌ Error:', err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
