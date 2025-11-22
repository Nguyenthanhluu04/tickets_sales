require('dotenv').config();
const mongoose = require('mongoose');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Kiểm tra transactions
    const Transaction = require('../src/models/Transaction');
    const totalTxs = await Transaction.countDocuments();
    const purchaseTxs = await Transaction.countDocuments({ type: 'purchase' });
    const confirmedPurchaseTxs = await Transaction.countDocuments({ 
      type: 'purchase', 
      status: 'confirmed' 
    });

    console.log('📊 TRANSACTIONS:');
    console.log(`   Total: ${totalTxs}`);
    console.log(`   Purchase: ${purchaseTxs}`);
    console.log(`   Confirmed purchase: ${confirmedPurchaseTxs}`);

    if (purchaseTxs > 0) {
      const sampleTx = await Transaction.findOne({ type: 'purchase' });
      console.log('\n   Sample transaction:');
      console.log('   ', JSON.stringify(sampleTx, null, 2));
    }

    // Kiểm tra tickets
    const Ticket = require('../src/models/Ticket');
    const totalTickets = await Ticket.countDocuments();
    
    console.log('\n🎫 TICKETS:');
    console.log(`   Total: ${totalTickets}`);

    if (totalTickets > 0) {
      const sampleTicket = await Ticket.findOne();
      console.log('\n   Sample ticket:');
      console.log('   ', JSON.stringify(sampleTicket, null, 2));
    }

    // Kiểm tra events
    const Event = require('../src/models/Event');
    const totalEvents = await Event.countDocuments();
    
    console.log('\n📅 EVENTS:');
    console.log(`   Total: ${totalEvents}`);

    // Kiểm tra ticket types
    const TicketType = require('../src/models/TicketType');
    const totalTicketTypes = await TicketType.countDocuments();
    
    console.log('\n🏷️  TICKET TYPES:');
    console.log(`   Total: ${totalTicketTypes}`);

    const ticketTypes = await TicketType.find().select('tokenId name currentSupply maxSupply');
    for (const tt of ticketTypes) {
      console.log(`   - ${tt.tokenId}: ${tt.name} (${tt.currentSupply || 0}/${tt.maxSupply})`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

checkData();
