const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking events on blockchain...\n");

  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  
  const [signer] = await hre.ethers.getSigners();
  console.log("📝 Using account:", signer.address);

  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  const ticketNFT = TicketNFT.attach(CONTRACT_ADDRESS);

  console.log("📄 Contract:", await ticketNFT.getAddress());
  console.log("");

  // Try to get events
  try {
    console.log("Trying to get Event 0...");
    const event0 = await ticketNFT.getEvent(0);
    console.log("✅ Event 0 found:", event0.name);
    console.log("   Description:", event0.description);
    console.log("   Organizer:", event0.organizer);
    console.log("   Active:", event0.isActive);
    
    console.log("\nTrying to get Event 1...");
    const event1 = await ticketNFT.getEvent(1);
    console.log("✅ Event 1 found:", event1.name);
    console.log("   Description:", event1.description);
    console.log("   Organizer:", event1.organizer);
    console.log("   Active:", event1.isActive);
    
    // Get ticket types
    console.log("\n🎫 Checking ticket types...");
    const ticketTypes0 = await ticketNFT.getEventTicketTypes(0);
    console.log("Event 0 ticket types:", ticketTypes0.map(t => t.toString()));
    
    const ticketTypes1 = await ticketNFT.getEventTicketTypes(1);
    console.log("Event 1 ticket types:", ticketTypes1.map(t => t.toString()));
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
