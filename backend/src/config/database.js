const mongoose = require('mongoose');
const { config } = require('./environment');

async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
}

module.exports = { connectDatabase };
