const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');
const { config } = require('./src/config/environment');

(async () => {
  try {
    await connectDatabase();
    app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
})();
