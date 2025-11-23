const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🎭 Setting up events with new lower prices...\n");

  // Get contract
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress || contractAddress.includes('your_')) {
    throw new Error('Please set CONTRACT_ADDRESS in .env file');
  }

  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "MATIC\n");

  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const contract = TicketNFT.attach(contractAddress);

  console.log("📄 Contract:", contractAddress);
  console.log("");

  // Helper function to add days to a date
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const now = new Date();
  const nowTimestamp = Math.floor(now.getTime() / 1000);

  // ========================================
  // Event 1: Summer Music Festival 2025
  // ========================================
  console.log("🎵 Creating Event 1: Summer Music Festival 2025");
  const event1StartTime = Math.floor(new Date('2025-12-21T18:00:00').getTime() / 1000);
  const event1EndTime = Math.floor(new Date('2025-12-21T23:00:00').getTime() / 1000);

  const tx1 = await contract.createEvent(
    "Summer Music Festival 2025",
    "The biggest summer music festival featuring top artists from around the world. Join us for an unforgettable night of music, food, and fun!",
    event1StartTime,
    event1EndTime
  );
  await tx1.wait();
  console.log("✅ Event 1 created\n");

  // Ticket types for Event 1 with NEW LOWER PRICES
  console.log("🎫 Creating ticket types for Event 1...");
  
  // VIP Pass - 0.01 MATIC (instead of 0.5)
  const vipTx = await contract.createTicketType(
    0, // eventId
    "VIP Pass",
    ethers.parseEther("0.01"), // NEW PRICE
    100, // maxSupply
    nowTimestamp, // sale starts now
    event1StartTime - 86400 // sale ends 1 day before event
  );
  await vipTx.wait();
  console.log("  ✅ VIP Pass - 0.01 MATIC");

  // Regular Pass - 0.005 MATIC (instead of 0.2)
  const regularTx = await contract.createTicketType(
    0,
    "Regular Pass",
    ethers.parseEther("0.005"), // NEW PRICE
    500,
    nowTimestamp,
    event1StartTime - 86400
  );
  await regularTx.wait();
  console.log("  ✅ Regular Pass - 0.005 MATIC");

  // Early Bird - 0.003 MATIC (instead of 0.15)
  const earlyTx = await contract.createTicketType(
    0,
    "Early Bird",
    ethers.parseEther("0.003"), // NEW PRICE
    200,
    nowTimestamp,
    nowTimestamp + (5 * 86400) // 5 days sale period
  );
  await earlyTx.wait();
  console.log("  ✅ Early Bird - 0.003 MATIC\n");

  // ========================================
  // Event 2: Web3 Developer Conference 2025
  // ========================================
  console.log("💻 Creating Event 2: Web3 Developer Conference 2025");
  const event2StartTime = Math.floor(new Date('2026-01-20T09:00:00').getTime() / 1000);
  const event2EndTime = Math.floor(new Date('2026-01-22T18:00:00').getTime() / 1000);

  const tx2 = await contract.createEvent(
    "Web3 Developer Conference 2025",
    "Join the leading Web3 developers, blockchain experts, and innovators. Learn about the latest trends in decentralized technologies, NFTs, DeFi, and more!",
    event2StartTime,
    event2EndTime
  );
  await tx2.wait();
  console.log("✅ Event 2 created\n");

  // Ticket types for Event 2 with NEW LOWER PRICES
  console.log("🎫 Creating ticket types for Event 2...");
  
  // Standard Access - 0.008 MATIC (instead of 0.3)
  const standardTx = await contract.createTicketType(
    1, // eventId
    "Standard Access",
    ethers.parseEther("0.008"), // NEW PRICE
    300,
    nowTimestamp,
    event2StartTime - 86400
  );
  await standardTx.wait();
  console.log("  ✅ Standard Access - 0.008 MATIC");

  // Premium Access - 0.012 MATIC (instead of 0.6)
  const premiumTx = await contract.createTicketType(
    1,
    "Premium Access",
    ethers.parseEther("0.012"), // NEW PRICE
    50,
    nowTimestamp,
    event2StartTime - 86400
  );
  await premiumTx.wait();
  console.log("  ✅ Premium Access - 0.012 MATIC\n");

  // ========================================
  // Event 3: Community Music Night
  // ========================================
  console.log("🎸 Creating Event 3: Community Music Night");
  const event3StartTime = Math.floor(new Date('2025-11-29T19:00:00').getTime() / 1000);
  const event3EndTime = Math.floor(new Date('2025-11-29T23:00:00').getTime() / 1000);

  const tx3 = await contract.createEvent(
    "Community Music Night",
    "A cozy evening of local music talent. Support your community artists and enjoy great music in an intimate setting!",
    event3StartTime,
    event3EndTime
  );
  await tx3.wait();
  console.log("✅ Event 3 created\n");

  // Ticket types for Event 3 - Keep same prices as before
  console.log("🎫 Creating ticket types for Event 3...");
  
  // Budget Ticket - 0.001 MATIC
  const budgetTx = await contract.createTicketType(
    2,
    "Budget Ticket",
    ethers.parseEther("0.001"),
    100,
    nowTimestamp,
    event3StartTime - 86400
  );
  await budgetTx.wait();
  console.log("  ✅ Budget Ticket - 0.001 MATIC");

  // Economy Ticket - 0.005 MATIC
  const economyTx = await contract.createTicketType(
    2,
    "Economy Ticket",
    ethers.parseEther("0.005"),
    200,
    nowTimestamp,
    event3StartTime - 86400
  );
  await economyTx.wait();
  console.log("  ✅ Economy Ticket - 0.005 MATIC");

  // Standard Ticket - 0.01 MATIC
  const standardEventTx = await contract.createTicketType(
    2,
    "Standard Ticket",
    ethers.parseEther("0.01"),
    150,
    nowTimestamp,
    event3StartTime - 86400
  );
  await standardEventTx.wait();
  console.log("  ✅ Standard Ticket - 0.01 MATIC\n");

  console.log("🎉 All events and ticket types created successfully!");
  console.log("\n📋 Summary:");
  console.log("  - 3 Events created");
  console.log("  - 8 Ticket types created");
  console.log("  - All sales are now OPEN");
  console.log("  - Prices are now MUCH LOWER for testing\n");
  
  console.log("📍 Next steps:");
  console.log("  1. Run: cd ../backend && node scripts/sync-blockchain-full.js");
  console.log("  2. Upload images: node scripts/upload-local-images.js");
  console.log("  3. Start backend: npm start");
  console.log("  4. Start frontend: cd ../frontend && npm run dev\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
