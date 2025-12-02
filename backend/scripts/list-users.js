require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function listUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find().sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log('No users found.');
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s):\n`);
    console.log('═'.repeat(80));

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Wallet: ${user.walletAddress}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
    });

    console.log('\n' + '═'.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listUsers();
