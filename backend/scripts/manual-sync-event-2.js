const mongoose = require('mongoose');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');
require('dotenv').config();

async function manualSyncEvent2() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Manual data for Event 2 (from blockchain)
    const eventId = 2;
    const now = Math.floor(Date.now() / 1000);
    const eventStartTime = now + 7 * 24 * 60 * 60; // 7 days from now
    const eventEndTime = eventStartTime + 1 * 24 * 60 * 60; // 1 day duration

    // Check if event exists
    const existingEvent = await Event.findOne({ eventId });
    if (!existingEvent) {
      const newEvent = await Event.create({
        eventId: 2,
        name: 'Community Music Night',
        description: 'Affordable local music event - Support local artists!',
        startTime: new Date(eventStartTime * 1000),
        endTime: new Date(eventEndTime * 1000),
        organizer: '0xD72c9c58DD567d5ecDF0Db3FcfFF1648966d140A'.toLowerCase(),
        isActive: true,
        category: 'music',
        location: 'Community Center',
        bannerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
        totalTicketsSold: 0,
        revenue: '0',
      });
      console.log(`✅ Event ${eventId} created:`, newEvent._id);
    } else {
      console.log(`⚠️  Event ${eventId} already exists`);
    }

    // Create ticket types
    const ticketTypes = [
      {
        tokenId: 5, // Next token ID after 0,1,2,3,4
        name: 'Budget Ticket',
        price: '1000000000000000', // 0.001 POL in wei
        maxSupply: 100,
        benefits: ['Entry access', 'Digital program'],
      },
      {
        tokenId: 6,
        name: 'Economy Ticket',
        price: '5000000000000000', // 0.005 POL in wei
        maxSupply: 200,
        benefits: ['Entry access', 'Digital program', 'Souvenir'],
      },
      {
        tokenId: 7,
        name: 'Standard Ticket',
        price: '10000000000000000', // 0.01 POL in wei
        maxSupply: 150,
        benefits: ['Entry access', 'Digital program', 'Souvenir', 'Priority seating'],
      },
    ];

    console.log('\n🎫 Creating ticket types...');
    for (const ticketData of ticketTypes) {
      const existing = await TicketType.findOne({ tokenId: ticketData.tokenId });
      if (existing) {
        console.log(`  ⚠️  ${ticketData.name} (Token ${ticketData.tokenId}) already exists`);
        continue;
      }

      await TicketType.create({
        tokenId: ticketData.tokenId,
        eventId: 2,
        name: ticketData.name,
        price: ticketData.price,
        maxSupply: ticketData.maxSupply,
        currentSupply: 0,
        startSaleTime: new Date(now * 1000),
        endSaleTime: new Date((eventStartTime - 24 * 60 * 60) * 1000),
        isActive: true,
        benefits: ticketData.benefits,
      });

      console.log(`  ✓ ${ticketData.name} (Token ID: ${ticketData.tokenId}) - ${ticketData.price} wei`);
    }

    console.log('\n✅ Event 2 synced successfully!\n');
    console.log('📊 Ticket Prices:');
    console.log('   Budget Ticket: 0.001 POL');
    console.log('   Economy Ticket: 0.005 POL');
    console.log('   Standard Ticket: 0.01 POL');
    console.log('\n🌐 View at: http://localhost:5173');

    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

manualSyncEvent2();
