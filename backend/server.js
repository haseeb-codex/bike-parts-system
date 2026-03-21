const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');
const { config } = require('./src/config/environment');
const logger = require('./src/utils/logger');

(async () => {
  try {
    await connectDatabase();
    app.listen(config.port, () => {
      logger.info('Server listening on port %d', config.port);
    });
  } catch (error) {
    logger.error('Failed to start server: %s', error.message);
    process.exit(1);
  }
})();
