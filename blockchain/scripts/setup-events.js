const hre = require("hardhat");

async function main() {
  console.log("🎪 Setting up test events...\n");

  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  
  if (!CONTRACT_ADDRESS) {
    console.error("❌ Please set CONTRACT_ADDRESS in .env file");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Using account:", deployer.address);

  // Get contract instance
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  const ticketNFT = TicketNFT.attach(CONTRACT_ADDRESS);

  console.log("📄 Contract:", await ticketNFT.getAddress());
  console.log("");

  // Event 1: Music Concert
  console.log("🎵 Creating Event 1: Summer Music Festival...");
  
  const now = Math.floor(Date.now() / 1000);
  const event1StartTime = now + 30 * 24 * 60 * 60; // 30 days from now
  const event1EndTime = event1StartTime + 3 * 24 * 60 * 60; // 3 days duration

  const tx1 = await ticketNFT.createEvent(
    "Summer Music Festival 2025",
    "The biggest music festival of the year featuring top international artists",
    event1StartTime,
    event1EndTime
  );
  const receipt1 = await tx1.wait();
  console.log("✅ Event created! Transaction:", receipt1.hash);

  // Create ticket types for Event 1
  console.log("\n🎫 Creating ticket types for Event 1...");

  // VIP Ticket
  const vipTx = await ticketNFT.createTicketType(
    0, // eventId
    "VIP Pass",
    hre.ethers.parseEther("0.5"), // 0.5 MATIC
    100, // max supply
    now + 1 * 24 * 60 * 60, // sale starts in 1 day
    event1StartTime - 1 * 24 * 60 * 60 // sale ends 1 day before event
  );
  await vipTx.wait();
  console.log("✅ VIP Pass created (Token ID: 0)");

  // Regular Ticket
  const regularTx = await ticketNFT.createTicketType(
    0,
    "Regular Pass",
    hre.ethers.parseEther("0.2"), // 0.2 MATIC
    500,
    now + 1 * 24 * 60 * 60,
    event1StartTime - 1 * 24 * 60 * 60
  );
  await regularTx.wait();
  console.log("✅ Regular Pass created (Token ID: 1)");

  // Early Bird
  const earlyBirdTx = await ticketNFT.createTicketType(
    0,
    "Early Bird",
    hre.ethers.parseEther("0.15"), // 0.15 MATIC
    200,
    now + 1 * 24 * 60 * 60,
    now + 7 * 24 * 60 * 60 // sale ends in 7 days
  );
  await earlyBirdTx.wait();
  console.log("✅ Early Bird created (Token ID: 2)");

  // Event 2: Tech Conference
  console.log("\n💻 Creating Event 2: Web3 Developer Conference...");
  
  const event2StartTime = now + 60 * 24 * 60 * 60; // 60 days from now
  const event2EndTime = event2StartTime + 2 * 24 * 60 * 60; // 2 days duration

  const tx2 = await ticketNFT.createEvent(
    "Web3 Developer Conference 2025",
    "Learn about the latest trends in blockchain and Web3 development",
    event2StartTime,
    event2EndTime
  );
  const receipt2 = await tx2.wait();
  console.log("✅ Event created! Transaction:", receipt2.hash);

  // Create ticket types for Event 2
  console.log("\n🎫 Creating ticket types for Event 2...");

  const standardTx = await ticketNFT.createTicketType(
    1, // eventId
    "Standard Access",
    hre.ethers.parseEther("0.3"),
    300,
    now + 2 * 24 * 60 * 60,
    event2StartTime - 2 * 24 * 60 * 60
  );
  await standardTx.wait();
  console.log("✅ Standard Access created (Token ID: 3)");

  const premiumTx = await ticketNFT.createTicketType(
    1,
    "Premium Access",
    hre.ethers.parseEther("0.6"),
    50,
    now + 2 * 24 * 60 * 60,
    event2StartTime - 2 * 24 * 60 * 60
  );
  await premiumTx.wait();
  console.log("✅ Premium Access created (Token ID: 4)");

  console.log("\n🎉 Setup complete!");
  console.log("\n📊 Summary:");
  console.log("   Events created: 2");
  console.log("   Ticket types created: 5");
  console.log("   Total max capacity: 1,150 tickets");
  console.log("");
  console.log("🌐 View on PolygonScan:");
  console.log(`   https://mumbai.polygonscan.com/address/${CONTRACT_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
