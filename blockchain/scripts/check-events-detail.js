const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking events on blockchain...\n");

  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  console.log("Contract Address:", CONTRACT_ADDRESS);

  // Get contract
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const contract = TicketNFT.attach(CONTRACT_ADDRESS);

  console.log("✅ Connected to contract\n");

  // Check multiple events
  for (let eventId = 0; eventId <= 2; eventId++) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📅 EVENT ${eventId}`);
      console.log('='.repeat(60));
      
      const event = await contract.getEvent(eventId);
      
      console.log("Name:", event.name);
      console.log("Description:", event.description);
      console.log("Organizer:", event.organizer);
      console.log("Start Time:", new Date(Number(event.startTime) * 1000).toLocaleString('vi-VN'));
      console.log("End Time:", new Date(Number(event.endTime) * 1000).toLocaleString('vi-VN'));
      console.log("Active:", event.isActive);
      console.log("Total Sold:", event.totalTicketsSold.toString());
      console.log("Revenue:", ethers.formatEther(event.revenue), "POL");

      // Get ticket types
      const ticketTypeIds = await contract.getEventTicketTypes(eventId);
      console.log(`\n🎫 Ticket Types (${ticketTypeIds.length}):`);

      for (const tokenId of ticketTypeIds) {
        const ticketType = await contract.getTicketType(tokenId);
        const currentSupply = await contract.totalSupply(tokenId);
        const now = Math.floor(Date.now() / 1000);
        const saleStarted = now >= Number(ticketType.startSaleTime);
        const saleEnded = now >= Number(ticketType.endSaleTime);
        
        console.log(`\n  Token ID ${tokenId}: ${ticketType.name}`);
        console.log(`    Price: ${ethers.formatEther(ticketType.price)} POL`);
        console.log(`    Supply: ${currentSupply}/${ticketType.maxSupply}`);
        console.log(`    Sale Start: ${new Date(Number(ticketType.startSaleTime) * 1000).toLocaleString('vi-VN')}`);
        console.log(`    Sale End: ${new Date(Number(ticketType.endSaleTime) * 1000).toLocaleString('vi-VN')}`);
        console.log(`    Status: ${!saleStarted ? '⏰ Chưa mở bán' : saleEnded ? '❌ Đã đóng' : '✅ Đang bán'}`);
        console.log(`    Active: ${ticketType.isActive}`);
      }

    } catch (error) {
      if (error.message.includes("Event does not exist")) {
        console.log(`❌ Event ${eventId} không tồn tại trên blockchain`);
      } else {
        console.error(`❌ Error checking event ${eventId}:`, error.message);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Check complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
