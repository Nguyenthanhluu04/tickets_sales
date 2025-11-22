require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');

const mockEvents = [
  {
    name: "Summer Music Festival 2025",
    description: "The biggest music festival of the summer featuring top international artists across multiple stages. Experience three days of non-stop music, food, and entertainment.",
    location: "Sunset Beach, Miami",
    venue: "Miami Beach Convention Center",
    startTime: new Date("2025-07-15T18:00:00Z"),
    endTime: new Date("2025-07-17T23:00:00Z"),
    category: "music",
    bannerImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
    organizer: "0xd72c9c58dd567d5ecdf0db3fcfff1648966d140a",
    eventId: 0,
    ticketTypes: [
      {
        name: "VIP Pass",
        description: "Premium access with backstage meet & greet, VIP lounge, and exclusive merchandise",
        price: "0.05",
        maxSupply: 100,
        currentSupply: 0,
        startSaleTime: new Date("2025-06-01T00:00:00Z"),
        endSaleTime: new Date("2025-07-15T18:00:00Z"),
        tokenId: 0,
        eventId: 0,
        benefits: ["Backstage access", "VIP lounge", "Free drinks", "Exclusive merchandise"]
      },
      {
        name: "Regular Pass",
        description: "Standard festival access to all stages and performances",
        price: "0.02",
        maxSupply: 500,
        currentSupply: 0,
        startSaleTime: new Date("2025-06-01T00:00:00Z"),
        endSaleTime: new Date("2025-07-15T18:00:00Z"),
        tokenId: 1,
        eventId: 0,
        benefits: ["Access to all stages", "Festival map", "Water refill stations"]
      },
      {
        name: "Early Bird",
        description: "Discounted early bird tickets with same access as Regular Pass",
        price: "0.015",
        maxSupply: 200,
        currentSupply: 0,
        startSaleTime: new Date("2025-05-01T00:00:00Z"),
        endSaleTime: new Date("2025-05-31T23:59:59Z"),
        tokenId: 2,
        eventId: 0,
        benefits: ["Same as Regular Pass", "Discounted price", "Early entry privilege"]
      }
    ]
  },
  {
    name: "Web3 Developer Conference 2025",
    description: "Join industry leaders and blockchain developers for two days of workshops, keynotes, and networking. Learn about the latest in Web3, DeFi, NFTs, and smart contract development.",
    location: "San Francisco, CA",
    venue: "Moscone Center",
    startTime: new Date("2025-08-20T09:00:00Z"),
    endTime: new Date("2025-08-21T18:00:00Z"),
    category: "conference",
    bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    organizer: "0xd72c9c58dd567d5ecdf0db3fcfff1648966d140a",
    eventId: 1,
    ticketTypes: [
      {
        name: "Standard Ticket",
        description: "Access to all conference sessions, expo hall, and networking events",
        price: "0.03",
        maxSupply: 300,
        currentSupply: 0,
        startSaleTime: new Date("2025-06-15T00:00:00Z"),
        endSaleTime: new Date("2025-08-20T09:00:00Z"),
        tokenId: 3,
        eventId: 1,
        benefits: ["All sessions access", "Expo hall", "Networking events", "Conference swag"]
      },
      {
        name: "Premium Ticket",
        description: "Standard access plus exclusive workshops, premium seating, and VIP dinner",
        price: "0.08",
        maxSupply: 50,
        currentSupply: 0,
        startSaleTime: new Date("2025-06-15T00:00:00Z"),
        endSaleTime: new Date("2025-08-20T09:00:00Z"),
        tokenId: 4,
        eventId: 1,
        benefits: ["All Standard benefits", "Exclusive workshops", "Premium seating", "VIP dinner", "Speaker meet & greet"]
      }
    ]
  }
];

async function insertMockData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nft-ticketing');
    console.log('✅ Connected to MongoDB\n');

    console.log('🗑️  Clearing existing mock data...');
    // Xóa tất cả events và ticket types cũ
    await Event.deleteMany({});
    await TicketType.deleteMany({});
    console.log('✅ Cleared old data\n');

    console.log('📝 Inserting mock events...\n');

    for (const mockEvent of mockEvents) {
      // Tách ticket types ra khỏi event object
      const { ticketTypes, ...eventData } = mockEvent;

      // Tạo event
      const event = await Event.create(eventData);
      console.log(`✅ Created event: ${event.name} (ID: ${event._id})`);

      // Tạo ticket types cho event
      for (const ticketTypeData of ticketTypes) {
        const ticketType = await TicketType.create({
          ...ticketTypeData,
          event: event._id
        });
        console.log(`   🎫 Created ticket type: ${ticketType.name} (Token ID: ${ticketType.tokenId})`);
      }
      console.log('');
    }

    console.log('🎉 Mock data inserted successfully!\n');
    
    // Hiển thị thống kê
    const totalEvents = await Event.countDocuments();
    const totalTicketTypes = await TicketType.countDocuments();
    console.log('📊 Summary:');
    console.log(`   Events: ${totalEvents}`);
    console.log(`   Ticket Types: ${totalTicketTypes}`);
    console.log('\n💡 TIP: Khi có đủ MATIC và tạo events thật, chạy lại script này để xóa mock data\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

insertMockData();
