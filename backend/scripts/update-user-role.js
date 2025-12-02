require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

// Get wallet address and role from command line
const walletAddress = process.argv[2];
const newRole = process.argv[3];

if (!walletAddress || !newRole) {
  console.error('Usage: node update-user-role.js <walletAddress> <role>');
  console.error('Example: node update-user-role.js 0x1234...5678 organizer');
  console.error('Roles: user, organizer, admin');
  process.exit(1);
}

if (!['user', 'organizer', 'admin'].includes(newRole)) {
  console.error('Invalid role. Must be: user, organizer, or admin');
  process.exit(1);
}

async function updateUserRole() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      console.error(`❌ User not found: ${walletAddress}`);
      console.log('\nTry logging in first to create the user account.');
      process.exit(1);
    }

    console.log('\nCurrent user:');
    console.log('  Wallet:', user.walletAddress);
    console.log('  Name:', user.name || 'N/A');
    console.log('  Email:', user.email || 'N/A');
    console.log('  Current Role:', user.role);

    // Update role
    user.role = newRole;
    await user.save();

    console.log('\n✅ Role updated successfully!');
    console.log('  New Role:', user.role);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateUserRole();
