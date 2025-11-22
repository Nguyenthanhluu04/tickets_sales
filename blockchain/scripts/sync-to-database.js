const hre = require("hardhat");
const axios = require("axios");

async function main() {
  console.log("🔄 Syncing events from blockchain to database...\n");

  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xA83e898669B3BE5dc47cD860dC61dF2B67f724ea";
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

  const [signer] = await hre.ethers.getSigners();
  console.log("📝 Using account:", signer.address);

  // Get contract instance
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  const ticketNFT = TicketNFT.attach(CONTRACT_ADDRESS);

  console.log("📄 Contract:", await ticketNFT.getAddress());
  console.log("🌐 Backend:", BACKEND_URL);
  console.log("");

  try {
    // Try to fetch events until we get an error (no more events)
    let eventCount = 0;
    let maxEvents = 100; // Safety limit
    
    // Find how many events exist
    for (let i = 0; i < maxEvents; i++) {
      try {
        await ticketNFT.getEvent(i);
        eventCount++;
      } catch {
        break; // No more events
      }
    }
    
    console.log(`📊 Total events on blockchain: ${eventCount}`);

    if (eventCount === 0) {
      console.log("\n⚠️  No events found on blockchain.");
      console.log("💡 Run 'node scripts/setup-events.js' first to create test events.");
      return;
    }

    // Fetch all events from blockchain
    for (let i = 0; i < eventCount; i++) {
      console.log(`\n📥 Fetching Event ${i}...`);
      
      const event = await ticketNFT.getEvent(i);
      
      const eventData = {
        eventId: i,
        name: event.name,
        description: event.description,
        startTime: new Date(Number(event.startTime) * 1000).toISOString(),
        endTime: new Date(Number(event.endTime) * 1000).toISOString(),
        organizer: event.organizer,
        isActive: event.isActive,
        totalTicketsSold: Number(event.totalTicketsSold),
        revenue: event.revenue.toString(),
      };

      console.log("   Name:", eventData.name);
      console.log("   Organizer:", eventData.organizer);
      console.log("   Start:", eventData.startTime);
      console.log("   Active:", eventData.isActive);

      // Save to database (you'll need to create this endpoint)
      try {
        // First, check if event already exists
        const checkResponse = await axios.get(`${BACKEND_URL}/events/${i}`).catch(() => null);
        
        if (checkResponse && checkResponse.data.success) {
          console.log("   ⚠️  Event already exists in database, updating...");
          // Update event
          await axios.put(`${BACKEND_URL}/events/${i}`, eventData).catch((err) => {
            console.log("   ⚠️  Update endpoint not implemented yet");
          });
        } else {
          console.log("   ✅ Saving to database...");
          // Create event - need to implement this endpoint
          await axios.post(`${BACKEND_URL}/events/sync`, eventData).catch((err) => {
            console.log("   ⚠️  Sync endpoint not implemented yet");
            console.log("   💡 You can manually add events to MongoDB");
          });
        }

        // Fetch ticket types for this event
        console.log(`\n   🎫 Fetching ticket types for Event ${i}...`);
        
        // Get ticket type IDs for this event
        const ticketTypeIds = await ticketNFT.getEventTicketTypes(i);
        
        for (let j = 0; j < ticketTypeIds.length; j++) {
          try {
            const tokenId = Number(ticketTypeIds[j]);
            const ticketType = await ticketNFT.getTicketType(tokenId);
            
            const ticketData = {
              tokenId,
              eventId: i,
              name: ticketType.name,
              price: ticketType.price.toString(),
              maxSupply: Number(ticketType.maxSupply),
              currentSupply: Number(await ticketNFT.totalSupply(tokenId)),
              saleStartTime: new Date(Number(ticketType.startSaleTime) * 1000).toISOString(),
              saleEndTime: new Date(Number(ticketType.endSaleTime) * 1000).toISOString(),
              isActive: ticketType.isActive,
            };

            console.log(`      - ${ticketData.name} (${ticketData.price} wei)`);
            console.log(`        Supply: ${ticketData.currentSupply}/${ticketData.maxSupply}`);

            // Save ticket type to database
            await axios.post(`${BACKEND_URL}/events/${i}/ticket-types/sync`, ticketData).catch((err) => {
              console.log("        ⚠️  Ticket type sync endpoint not implemented yet");
            });
          } catch (err) {
            // Ticket type might not exist
            console.log(`        ⚠️  Error fetching ticket type ${j}:`, err.message);
          }
        }

      } catch (error) {
        console.error("   ❌ Error saving to database:", error.message);
      }
    }

    console.log("\n✅ Sync complete!");
    console.log("\n📝 Note: If sync endpoints are not implemented, you need to:");
    console.log("   1. Add POST /api/events/sync endpoint in backend");
    console.log("   2. Add POST /api/events/:id/ticket-types/sync endpoint");
    console.log("   3. Or manually insert data to MongoDB");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
