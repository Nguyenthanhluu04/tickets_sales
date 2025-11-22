const mongoose = require('mongoose');
const Event = require('../src/models/Event');
require('dotenv').config();

async function checkEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-sales-blockchain');
    console.log('✅ Connected to MongoDB\n');

    // Get all events
    const events = await Event.find({}).lean();
    
    console.log(`📊 Total events: ${events.length}\n`);

    if (events.length === 0) {
      console.log('⚠️  No events found in database');
      process.exit(0);
    }

    // Display event details
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. Event ID: ${event.eventId}`);
      console.log(`   Name: ${event.name}`);
      console.log(`   Category: ${event.category || 'N/A'}`);
      console.log(`   Banner Image: ${event.bannerImage || 'N/A'}`);
      console.log(`   Banner IPFS: ${event.bannerImageIPFS || 'N/A'}`);
      console.log(`   Image URL (Virtual): ${event.imageUrl || 'N/A'}`);
      console.log(`   Is Active: ${event.isActive}`);
      console.log(`   Organizer: ${event.organizer}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkEvents();
