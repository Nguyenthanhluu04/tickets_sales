const hre = require("hardhat");

async function main() {
  console.log("🎪 Creating affordable test event for limited budget...\n");

  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  
  if (!CONTRACT_ADDRESS) {
    console.error("❌ Please set CONTRACT_ADDRESS in .env file");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Using account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Current balance:", hre.ethers.formatEther(balance), "POL");

  // Get contract instance
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  const ticketNFT = TicketNFT.attach(CONTRACT_ADDRESS);

  console.log("📄 Contract:", await ticketNFT.getAddress());
  console.log("");

  // Create budget-friendly event
  console.log("🎉 Creating Event: Budget-Friendly Concert...");
  
  const now = Math.floor(Date.now() / 1000);
  const eventStartTime = now + 7 * 24 * 60 * 60; // 7 days from now
  const eventEndTime = eventStartTime + 1 * 24 * 60 * 60; // 1 day duration

  const tx1 = await ticketNFT.createEvent(
    "Community Music Night",
    "Affordable local music event - Support local artists!",
    eventStartTime,
    eventEndTime
  );
  const receipt1 = await tx1.wait();
  console.log("✅ Event created! Transaction:", receipt1.hash);

  // Get the event ID (should be the next number)
  const eventId = 2; // Assuming events 0 and 1 exist

  // Create affordable ticket types
  console.log("\n🎫 Creating affordable ticket types...");

  // Super Budget Ticket - Very cheap for testing
  console.log("\n💵 Creating Super Budget Ticket...");
  const budgetTx = await ticketNFT.createTicketType(
    eventId,
    "Budget Ticket",
    hre.ethers.parseEther("0.001"), // Only 0.001 POL (~$0.001)
    100,
    now, // sale starts now
    eventStartTime - 1 * 24 * 60 * 60 // sale ends 1 day before event
  );
  await budgetTx.wait();
  console.log("✅ Budget Ticket created - Price: 0.001 POL");

  // Economy Ticket
  console.log("\n💵 Creating Economy Ticket...");
  const economyTx = await ticketNFT.createTicketType(
    eventId,
    "Economy Ticket",
    hre.ethers.parseEther("0.005"), // 0.005 POL (~$0.005)
    200,
    now,
    eventStartTime - 1 * 24 * 60 * 60
  );
  await economyTx.wait();
  console.log("✅ Economy Ticket created - Price: 0.005 POL");

  // Standard Ticket
  console.log("\n💵 Creating Standard Ticket...");
  const standardTx = await ticketNFT.createTicketType(
    eventId,
    "Standard Ticket",
    hre.ethers.parseEther("0.01"), // 0.01 POL (~$0.01)
    150,
    now,
    eventStartTime - 1 * 24 * 60 * 60
  );
  await standardTx.wait();
  console.log("✅ Standard Ticket created - Price: 0.01 POL");

  console.log("\n🎉 Setup complete!");
  console.log("\n📊 Ticket Price Summary:");
  console.log("   Budget Ticket:   0.001 POL + gas (~0.002 POL total)");
  console.log("   Economy Ticket:  0.005 POL + gas (~0.006 POL total)");
  console.log("   Standard Ticket: 0.01 POL + gas (~0.011 POL total)");
  console.log("");
  console.log("💡 With your balance of 0.05589266 POL, you can buy:");
  console.log("   - Up to 25 Budget tickets");
  console.log("   - Up to 9 Economy tickets");
  console.log("   - Up to 5 Standard tickets");
  console.log("");
  console.log("🌐 View on PolygonScan:");
  console.log(`   https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
