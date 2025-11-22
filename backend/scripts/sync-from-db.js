require('dotenv').config();
const mongoose = require('mongoose');
const TicketType = require('../src/models/TicketType');
const Transaction = require('../src/models/Transaction');
const Ticket = require('../src/models/Ticket');

async function syncFromDatabase() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy tất cả ticket types
    const ticketTypes = await TicketType.find();
    console.log(`📋 Found ${ticketTypes.length} ticket types to sync\n`);

    let synced = 0;
    let errors = 0;

    for (const ticketType of ticketTypes) {
      try {
        // Đếm số vé đã bán từ transactions
        const soldCount = await Transaction.countDocuments({
          ticketTypeId: ticketType.tokenId,
          type: 'purchase',
          status: 'confirmed'
        });

        // Đếm số tickets được tạo trong database
        const ticketCount = await Ticket.countDocuments({
          ticketType: ticketType._id
        });

        // Update currentSupply
        ticketType.currentSupply = Math.max(soldCount, ticketCount);
        await ticketType.save();

        console.log(`✅ Synced ticket type ${ticketType.tokenId}: ${ticketType.name}`);
        console.log(`   📊 Sold count (transactions): ${soldCount}`);
        console.log(`   🎫 Ticket records: ${ticketCount}`);
        console.log(`   📈 Updated supply: ${ticketType.currentSupply}/${ticketType.totalSupply}\n`);
        
        synced++;
      } catch (error) {
        console.error(`❌ Failed to sync ticket type ${ticketType.tokenId}:`, error.message);
        errors++;
      }
    }

    console.log('✅ Supply sync completed!');
    console.log(`   - Total ticket types: ${ticketTypes.length}`);
    console.log(`   - Synced: ${synced}`);
    console.log(`   - Errors: ${errors}`);

  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

syncFromDatabase();
