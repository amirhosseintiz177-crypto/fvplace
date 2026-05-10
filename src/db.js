const mongoose = require('mongoose');

async function connectDatabase(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is required. Add it to your environment variables.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
}

module.exports = { connectDatabase };
