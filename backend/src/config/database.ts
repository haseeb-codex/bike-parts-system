const mongoose = require('mongoose');
const { config } = require('@/config/environment');
const logger = require('@/utils/logger');

const RETRY_DELAY_MS = 3000;
const MAX_RETRIES = 5;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectDatabase() {
  mongoose.set('strictQuery', true);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await mongoose.connect(config.mongoUri);
      logger.info('MongoDB connected successfully');
      return mongoose.connection;
    } catch (error) {
      logger.error('MongoDB connection attempt %d failed: %s', attempt, error.message);
      if (attempt === MAX_RETRIES) {
        throw error;
      }
      await wait(RETRY_DELAY_MS);
    }
  }

  return null;
}

module.exports = { connectDatabase };
