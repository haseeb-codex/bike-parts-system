const app = require('@/app');
const { connectDatabase } = require('@/config/database');
const { config } = require('@/config/environment');
const logger = require('@/utils/logger');

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
