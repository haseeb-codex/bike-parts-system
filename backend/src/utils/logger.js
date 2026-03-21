const { createLogger, format, transports } = require('winston');
const { config } = require('../config/environment');

const logger = createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: config.nodeEnv === 'production'
        ? format.json()
        : format.combine(format.colorize(), format.simple()),
    }),
  ],
});

module.exports = logger;
