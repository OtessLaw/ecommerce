const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/luxury_ecommerce', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);

    // Drop stale unique index on orderNumber_1 if present on MongoDB Atlas
    mongoose.connection.once('open', async () => {
      try {
        await mongoose.connection.collections.orders?.dropIndex('orderNumber_1');
        console.log('[MongoDB Index Cleanup] Dropped stale orderNumber_1 index');
      } catch (err) {
        // Index already removed or not present
      }
    });

    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Direct MongoDB connection failed (${error.message}).`);
    console.warn(`[MongoDB Warning] Operating with hybrid memory store fallback for standalone demonstration mode.`);
    return false;
  }
};

module.exports = connectDB;
