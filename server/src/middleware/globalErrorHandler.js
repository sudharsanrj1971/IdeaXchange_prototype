const logger = require('../services/logger');

const globalErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    logger.warn(`CSRF validation failed: ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    return res.status(403).json({
      error: {
        message: 'Invalid or missing CSRF token'
      }
    });
  }

  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  const isProd = process.env.NODE_ENV === 'production';
  const status = err.status || err.statusCode || 500;
  
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(isProd ? {} : { stack: err.stack })
    }
  });
};

module.exports = globalErrorHandler;
