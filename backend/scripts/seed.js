const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { initialProducts } = require('../utils/seedData');

dotenv.config();

const seedDatabase = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      console.log('MongoDB not connected. Seed script skipped (hybrid in-memory mode active).');
      process.exit(0);
    }

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();

    console.log('Seeding admin & staff users...');
    const adminUser = await User.create({
      name: 'Executive Director',
      email: 'admin@luxury.com',
      password: 'password123',
      role: 'admin',
      phone: '+2348012345678',
    });

    const staffUser = await User.create({
      name: 'Inventory Manager',
      email: 'staff@luxury.com',
      password: 'password123',
      role: 'staff',
      phone: '+2348087654321',
    });

    console.log('Seeding product catalog...');
    const createdProducts = await Product.insertMany(
      initialProducts.map((p) => {
        const { _id, ...rest } = p;
        return rest;
      })
    );

    console.log(`Successfully seeded database with ${createdProducts.length} luxury products!`);
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
