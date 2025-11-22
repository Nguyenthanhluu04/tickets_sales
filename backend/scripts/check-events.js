require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');

async function checkEvents() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nft-ticketing');
    console.log('✅ Connected\n');
    
    const events = await Event.find({});
    const ticketTypes = await TicketType.find({});
    
    console.log('📊 Database Status:');
    console.log(`   Events: ${events.length}`);
    console.log(`   Ticket Types: ${ticketTypes.length}\n`);
    
    if (events.length === 0) {
      console.log('ℹ️  No events in database yet.');
      console.log('💡 After claiming MATIC, run: npx hardhat run scripts/setup-events.js --network amoy\n');
    } else {
      console.log('📋 Events:\n');
      for (const event of events) {
        console.log(`✅ ${event.name}`);
        console.log(`   Event ID: ${event.eventId}`);
        console.log(`   Organizer: ${event.organizer}`);
        console.log(`   Date: ${event.startTime.toLocaleDateString()}`);
        console.log(`   Location: ${event.location || 'TBA'}`);
        
        const eventTickets = await TicketType.find({ eventId: event.eventId });
        if (eventTickets.length > 0) {
          console.log('   Ticket Types:');
          eventTickets.forEach(tt => {
            console.log(`     🎫 ${tt.name} - ${tt.price} MATIC (${tt.currentSupply}/${tt.maxSupply} sold)`);
          });
        }
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

checkEvents();
