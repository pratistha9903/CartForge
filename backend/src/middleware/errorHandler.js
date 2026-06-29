export function errorHandler(err, req, res, _next) {
  console.error('Unhandled error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid input',
      errors: [err.message],
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry',
    });
  }

  if (err.kind === 'ObjectId') {
    return res.status(400).json({
      success: false,
      message: 'Invalid input',
      errors: ['Invalid userId'],
    });
  }

  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
}

export { apiLimiter, requestLogger } from './security.js';
