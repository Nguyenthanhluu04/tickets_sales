const hre = require("hardhat");

/**
 * Script để xem giá của các vé hiện có
 * Chạy: npx hardhat run scripts/check-ticket-prices.js --network amoy
 */

async function main() {
  console.log("🔍 Checking current ticket prices...\n");

  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  
  if (!CONTRACT_ADDRESS) {
    console.error("❌ Please set CONTRACT_ADDRESS in .env file");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Using account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Your balance:", hre.ethers.formatEther(balance), "POL");
  console.log("");

  // Get contract instance
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  const ticketNFT = TicketNFT.attach(CONTRACT_ADDRESS);

  console.log("📄 Contract:", await ticketNFT.getAddress());
  console.log("");

  // Check tickets for events 0, 1, 2
  for (let eventId = 0; eventId <= 2; eventId++) {
    try {
      const event = await ticketNFT.getEvent(eventId);
      console.log(`\n🎪 Event ${eventId}: ${event.name}`);
      console.log(`   Active: ${event.isActive}`);
      
      // Get ticket types for this event
      const tokenIds = await ticketNFT.getEventTicketTypes(eventId);
      
      if (tokenIds.length === 0) {
        console.log("   No tickets created yet");
        continue;
      }

      console.log(`   Ticket types: ${tokenIds.length}\n`);

      for (const tokenId of tokenIds) {
        const ticket = await ticketNFT.getTicketType(tokenId);
        const currentSupply = await ticketNFT.totalSupply(tokenId);
        const priceInPOL = hre.ethers.formatEther(ticket.price);
        
        console.log(`   🎫 Token ${tokenId}: ${ticket.name}`);
        console.log(`      Price: ${priceInPOL} POL`);
        console.log(`      Supply: ${currentSupply}/${ticket.maxSupply}`);
        console.log(`      Active: ${ticket.isActive}`);
        console.log("");
      }
    } catch (error) {
      if (eventId === 0) {
        console.log(`❌ Event ${eventId} does not exist yet`);
      }
      break;
    }
  }

  console.log("\n💡 Recommendation with balance of", hre.ethers.formatEther(balance), "POL:");
  console.log("   - You need tickets priced at 0.05 POL or less");
  console.log("   - Recommended: 0.001 - 0.01 POL per ticket");
  console.log("   - This leaves room for gas fees (~0.001-0.002 POL per transaction)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
