require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nft-ticketing';

async function syncEvents() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing events (optional - comment out if you want to keep old data)
    // await Event.deleteMany({});
    // await TicketType.deleteMany({});
    // console.log('🗑️  Cleared existing events\n');

    const now = Date.now();

    // Event 1: Summer Music Festival 2025
    console.log('📝 Creating Event 1: Summer Music Festival 2025...');
    
    const event1 = await Event.findOneAndUpdate(
      { eventId: 0 },
      {
        eventId: 0,
        name: 'Summer Music Festival 2025',
        description: 'The biggest music festival of the year featuring top international artists',
        location: 'Miami Beach, Florida',
        imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
        startTime: new Date(now + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        endTime: new Date(now + 33 * 24 * 60 * 60 * 1000), // 33 days from now (3 days duration)
        organizer: '0xD72c9c58DD567d5ecDF0Db3FcfFF1648966d140A',
        organizerName: 'MusicFest Productions',
        isActive: true,
        totalTicketsSold: 0,
        revenue: '0',
        category: 'Music',
        tags: ['festival', 'music', 'outdoor', 'summer'],
      },
      { upsert: true, new: true }
    );
    console.log('✅ Event 1 created:', event1._id);

    // Ticket types for Event 1
    console.log('\n🎫 Creating ticket types for Event 1...');
    
    const vipPass = await TicketType.findOneAndUpdate(
      { tokenId: 0 },
      {
        tokenId: 0,
        eventId: 0, // blockchain event ID
        name: 'VIP Pass',
        description: 'VIP access with exclusive backstage privileges',
        price: '500000000000000000', // 0.5 MATIC in wei
        maxSupply: 100,
        currentSupply: 0,
        startSaleTime: new Date(now + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        endSaleTime: new Date(now + 29 * 24 * 60 * 60 * 1000), // 29 days from now
        isActive: true,
        benefits: ['Backstage access', 'VIP lounge', 'Premium seating', 'Meet & greet'],
      },
      { upsert: true, new: true }
    );
    console.log('  ✓ VIP Pass (Token ID: 0)');

    const regularPass = await TicketType.findOneAndUpdate(
      { tokenId: 1 },
      {
        tokenId: 1,
        eventId: 0, // blockchain event ID
        name: 'Regular Pass',
        description: 'Standard access to all main stages',
        price: '200000000000000000', // 0.2 MATIC in wei
        maxSupply: 500,
        currentSupply: 0,
        startSaleTime: new Date(now + 1 * 24 * 60 * 60 * 1000),
        endSaleTime: new Date(now + 29 * 24 * 60 * 60 * 1000),
        isActive: true,
        benefits: ['Access to all stages', 'Festival merchandise discount'],
      },
      { upsert: true, new: true }
    );
    console.log('  ✓ Regular Pass (Token ID: 1)');

    const earlyBird = await TicketType.findOneAndUpdate(
      { tokenId: 2 },
      {
        tokenId: 2,
        eventId: 0, // blockchain event ID
        name: 'Early Bird',
        description: 'Special early bird pricing - Limited time offer!',
        price: '150000000000000000', // 0.15 MATIC in wei
        maxSupply: 200,
        currentSupply: 0,
        startSaleTime: new Date(now + 1 * 24 * 60 * 60 * 1000),
        endSaleTime: new Date(now + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true,
        benefits: ['Discounted price', 'Early entry', 'Free parking'],
      },
      { upsert: true, new: true }
    );
    console.log('  ✓ Early Bird (Token ID: 2)');

    // Event 2: Web3 Developer Conference 2025
    console.log('\n📝 Creating Event 2: Web3 Developer Conference 2025...');
    
    const event2 = await Event.findOneAndUpdate(
      { eventId: 1 },
      {
        eventId: 1,
        name: 'Web3 Developer Conference 2025',
        description: 'Learn about the latest trends in blockchain and Web3 development',
        location: 'San Francisco Convention Center',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        startTime: new Date(now + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        endTime: new Date(now + 62 * 24 * 60 * 60 * 1000), // 62 days from now (2 days duration)
        organizer: '0xD72c9c58DD567d5ecDF0Db3FcfFF1648966d140A',
        organizerName: 'Web3 Foundation',
        isActive: true,
        totalTicketsSold: 0,
        revenue: '0',
        category: 'Technology',
        tags: ['blockchain', 'web3', 'developer', 'conference', 'technology'],
      },
      { upsert: true, new: true }
    );
    console.log('✅ Event 2 created:', event2._id);

    // Ticket types for Event 2
    console.log('\n🎫 Creating ticket types for Event 2...');
    
    const standardAccess = await TicketType.findOneAndUpdate(
      { tokenId: 3 },
      {
        tokenId: 3,
        eventId: 1, // blockchain event ID
        name: 'Standard Access',
        description: 'Access to all conference sessions and expo',
        price: '300000000000000000', // 0.3 MATIC in wei
        maxSupply: 300,
        currentSupply: 0,
        startSaleTime: new Date(now + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        endSaleTime: new Date(now + 58 * 24 * 60 * 60 * 1000), // 58 days from now
        isActive: true,
        benefits: ['All conference sessions', 'Expo access', 'Networking events'],
      },
      { upsert: true, new: true }
    );
    console.log('  ✓ Standard Access (Token ID: 3)');

    const premiumAccess = await TicketType.findOneAndUpdate(
      { tokenId: 4 },
      {
        tokenId: 4,
        eventId: 1, // blockchain event ID
        name: 'Premium Access',
        description: 'Premium access with workshops and exclusive sessions',
        price: '600000000000000000', // 0.6 MATIC in wei
        maxSupply: 50,
        currentSupply: 0,
        startSaleTime: new Date(now + 2 * 24 * 60 * 60 * 1000),
        endSaleTime: new Date(now + 58 * 24 * 60 * 60 * 1000),
        isActive: true,
        benefits: ['All standard benefits', 'Workshop access', 'VIP dinner', 'Speaker meetups'],
      },
      { upsert: true, new: true }
    );
    console.log('  ✓ Premium Access (Token ID: 4)');

    console.log('\n✅ Sync completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   Events created: 2');
    console.log('   Ticket types created: 5');
    console.log('   Total max capacity: 1,150 tickets');
    
    console.log('\n🌐 You can now view events at:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   API: http://localhost:5000/api/events');

  } catch (error) {
    console.error('❌ Error syncing events:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

syncEvents();
