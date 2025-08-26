const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@fixandfit.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@fixandfit.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1234567890',
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'AC',
        postalCode: '12345',
        country: 'USA'
      },
      isActive: true
    });

    console.log('Admin user created successfully:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`ID: ${adminUser._id}`);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdminUser();
