require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');
const Ticket = require('../src/models/Ticket');
const Transaction = require('../src/models/Transaction');

async function clearMockData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nft-ticketing');
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Current database status:');
    const eventCount = await Event.countDocuments();
    const ticketTypeCount = await TicketType.countDocuments();
    const ticketCount = await Ticket.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    
    console.log(`   Events: ${eventCount}`);
    console.log(`   Ticket Types: ${ticketTypeCount}`);
    console.log(`   Tickets: ${ticketCount}`);
    console.log(`   Transactions: ${transactionCount}\n`);

    if (eventCount === 0 && ticketTypeCount === 0) {
      console.log('ℹ️  Database is already empty. Nothing to clear.\n');
      return;
    }

    console.log('🗑️  Clearing all data...');
    
    // Xóa tất cả dữ liệu
    await Event.deleteMany({});
    await TicketType.deleteMany({});
    await Ticket.deleteMany({});
    await Transaction.deleteMany({});
    
    console.log('✅ All data cleared successfully!\n');
    console.log('💡 TIP: Database is now ready for real blockchain events\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

clearMockData();
