const logger = require('../utils/logger');
const { config } = require('../config/environment');

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  logger.error('Request failed: %s %s %d %s', req.method, req.originalUrl, status, err.message);

  const response = {
    success: false,
    message: err.message || 'Internal server error',
  };

  if (config.nodeEnv !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = { errorHandler };
