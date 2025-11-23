require('dotenv').config();
const mongoose = require('mongoose');
const ethers = require('ethers');

// Import models
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');

// Import contract ABI
const CONTRACT_ABI = require('../src/config/contractABI.json');

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear old data
    console.log('🗑️  Clearing old data...');
    await Event.deleteMany({});
    await TicketType.deleteMany({});
    console.log('✅ Old data cleared\n');

    // Setup blockchain connection
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      CONTRACT_ABI.abi,
      provider
    );

    console.log('📄 Contract:', process.env.CONTRACT_ADDRESS);
    console.log('');

    // Sync events (0, 1, 2)
    for (let eventId = 0; eventId < 3; eventId++) {
      try {
        const eventData = await contract['getEvent(uint256)'](eventId);
        
        console.log(`📅 Syncing Event ${eventId}: ${eventData.name}`);
        
        // Create event in database
        await Event.create({
          eventId: Number(eventData.eventId),
          name: eventData.name,
          description: eventData.description,
          startTime: new Date(Number(eventData.startTime) * 1000),
          endTime: new Date(Number(eventData.endTime) * 1000),
          organizer: eventData.organizer.toLowerCase(),
          isActive: eventData.isActive,
          totalTicketsSold: 0,
          revenue: '0',
          category: eventId === 0 ? 'music' : eventId === 1 ? 'conference' : 'music',
          location: eventId === 0 ? 'Miami Beach, Florida' : 
                   eventId === 1 ? 'San Francisco Convention Center' : 
                   'Community Center',
          bannerImage: eventId === 0 ? 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800' :
                      eventId === 1 ? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' :
                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
          bannerImageIPFS: eventId === 0 ? 'bafkreif4pcxj2orjzvelcdseupswqzfqwsuae5dxdu4yvkgyyi7wbqhjue' :
                          eventId === 1 ? 'bafkreibwu6u7rmjftymgi7bhwj65lxxpfd54q5x6ru7zfz5o5isuzlxg3q' :
                          'bafybeie5i6ygapyd2d6itaulwvqzysrudvgpfzj3ypg3jsfqs3lk4t72mm'
        });
        
        console.log(`  ✅ Event ${eventId} synced`);

        // Get ticket types for this event
        const ticketTypeIds = await contract.getEventTicketTypes(eventId);
        console.log(`  🎫 Found ${ticketTypeIds.length} ticket types`);

        // Sync each ticket type
        for (const tokenId of ticketTypeIds) {
          const ticketData = await contract.getTicketType(Number(tokenId));
          const supply = await contract['totalSupply(uint256)'](Number(tokenId));
          
          await TicketType.create({
            tokenId: Number(tokenId),
            eventId: Number(ticketData.eventId),
            name: ticketData.name,
            price: ticketData.price.toString(),
            maxSupply: Number(ticketData.maxSupply),
            currentSupply: Number(supply),
            startSaleTime: new Date(Number(ticketData.startSaleTime) * 1000),
            endSaleTime: new Date(Number(ticketData.endSaleTime) * 1000),
            isActive: ticketData.isActive
          });

          console.log(`     ✅ ${ticketData.name} - ${(Number(ticketData.price) / 1e18).toFixed(4)} MATIC`);
        }
        
        console.log('');
      } catch (error) {
        console.error(`  ❌ Error syncing event ${eventId}:`, error.message);
        console.error(error);
      }
    }

    console.log('🎉 Sync completed!\n');

    // Show summary
    const eventCount = await Event.countDocuments();
    const ticketTypeCount = await TicketType.countDocuments();
    console.log('📊 Database Summary:');
    console.log(`   Events: ${eventCount}`);
    console.log(`   Ticket Types: ${ticketTypeCount}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

main();
