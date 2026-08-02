const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/luxury_ecommerce', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Direct MongoDB connection failed (${error.message}).`);
    console.warn(`[MongoDB Warning] Operating with hybrid memory store fallback for standalone demonstration mode.`);
    return false;
  }
};

module.exports = connectDB;
