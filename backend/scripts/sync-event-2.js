const mongoose = require('mongoose');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');
const blockchainService = require('../src/services/blockchainService');
const blockchainConfig = require('../src/config/blockchain');
require('dotenv').config();

async function syncEvent2() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Initialize blockchain
    await blockchainConfig.initialize();
    await blockchainService.initialize();

    const eventId = 2;

    // Get event from blockchain
    console.log(`📝 Fetching Event ${eventId} from blockchain...`);
    const eventData = await blockchainService.getEventDetails(eventId);

    // Check if event already exists
    const existingEvent = await Event.findOne({ eventId });
    if (existingEvent) {
      console.log(`⚠️  Event ${eventId} already exists in database`);
    } else {
      // Create event in database
      const newEvent = await Event.create({
        eventId: eventData.eventId,
        name: eventData.name,
        description: eventData.description,
        startTime: new Date(eventData.startTime * 1000),
        endTime: new Date(eventData.endTime * 1000),
        organizer: eventData.organizer.toLowerCase(),
        isActive: eventData.isActive,
        category: 'Music',
        location: 'Community Center',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
      });
      console.log(`✅ Event ${eventId} created:`, newEvent._id);
    }

    // Get ticket types
    console.log(`\n🎫 Fetching ticket types for Event ${eventId}...`);
    const tokenIds = await blockchainService.getEventTicketTypes(eventId);

    for (const tokenId of tokenIds) {
      const existing = await TicketType.findOne({ tokenId });
      if (existing) {
        console.log(`  ⚠️  Token ${tokenId} already exists`);
        continue;
      }

      const ticketData = await blockchainService.getTicketType(tokenId);
      const currentSupply = await blockchainService.getCurrentSupply(tokenId);

      await TicketType.create({
        tokenId: ticketData.tokenId,
        eventId: ticketData.eventId,
        name: ticketData.name,
        price: ticketData.price,
        maxSupply: ticketData.maxSupply,
        currentSupply,
        startSaleTime: new Date(ticketData.startSaleTime * 1000),
        endSaleTime: new Date(ticketData.endSaleTime * 1000),
        isActive: ticketData.isActive,
        benefits: getTicketBenefits(ticketData.name),
      });

      console.log(`  ✓ ${ticketData.name} (Token ID: ${ticketData.tokenId})`);
    }

    console.log('\n✅ Event 2 synced successfully!\n');
    console.log('🌐 View at: http://localhost:5173');

    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');

  } catch (error) {
    console.error('❌ Error syncing event:', error);
    process.exit(1);
  }
}

function getTicketBenefits(ticketName) {
  const benefits = {
    'Budget Ticket': ['Entry access', 'Digital program'],
    'Economy Ticket': ['Entry access', 'Digital program', 'Souvenir'],
    'Standard Ticket': ['Entry access', 'Digital program', 'Souvenir', 'Priority seating'],
  };
  return benefits[ticketName] || [];
}

syncEvent2();
