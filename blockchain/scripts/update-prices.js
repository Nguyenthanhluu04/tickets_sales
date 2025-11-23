const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  console.log("💰 Updating ticket prices on blockchain...\n");

  // Get deployer/admin account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Using account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Get contract address from env or use default
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("❌ CONTRACT_ADDRESS not found in .env file");
    process.exit(1);
  }

  console.log("📄 Contract address:", contractAddress);

  // Get contract
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  const contract = TicketNFT.attach(contractAddress);

  console.log("\n🔄 Updating prices...\n");

  // Define price updates
  const priceUpdates = [
    // Summer Music Festival (Event ID: 0)
    { tokenId: 0, name: "VIP Pass", oldPrice: "0.5", newPrice: "0.01" },
    { tokenId: 1, name: "Regular Pass", oldPrice: "0.2", newPrice: "0.005" },
    { tokenId: 2, name: "Early Bird", oldPrice: "0.15", newPrice: "0.003" },
    
    // Web3 Developer Conference (Event ID: 1)
    { tokenId: 3, name: "Standard Access", oldPrice: "0.3", newPrice: "0.008" },
    { tokenId: 4, name: "Premium Access", oldPrice: "0.6", newPrice: "0.012" },
  ];

  // Update each ticket type
  for (const update of priceUpdates) {
    try {
      console.log(`🎫 Updating ${update.name} (Token ID: ${update.tokenId})`);
      console.log(`   ${update.oldPrice} → ${update.newPrice} MATIC`);

      const newPriceWei = hre.ethers.parseEther(update.newPrice);
      
      // Call updateTicketPrice function
      const tx = await contract.updateTicketPrice(update.tokenId, newPriceWei);
      console.log(`   Transaction hash: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`   ✅ Confirmed in block ${receipt.blockNumber}\n`);
      
    } catch (error) {
      console.error(`   ❌ Error updating token ${update.tokenId}:`, error.message);
      console.error(`   This might happen if:`);
      console.error(`   - You're not the organizer or admin`);
      console.error(`   - The ticket type is not active`);
      console.error(`   - The updateTicketPrice function doesn't exist (contract not upgraded)`);
      console.error();
    }
  }

  // Update sale times for Web3 Developer Conference
  console.log("⏰ Updating sale times for Web3 Developer Conference...\n");
  
  const now = Math.floor(Date.now() / 1000);
  const futureDate = now + (30 * 24 * 60 * 60); // +30 days

  const saleTimeUpdates = [
    { tokenId: 3, name: "Standard Access" },
    { tokenId: 4, name: "Premium Access" },
  ];

  for (const update of saleTimeUpdates) {
    try {
      console.log(`🎫 Updating ${update.name} (Token ID: ${update.tokenId})`);
      console.log(`   Start: Now`);
      console.log(`   End: ${new Date(futureDate * 1000).toISOString()}`);

      // Call updateTicketSaleTimes function
      const tx = await contract.updateTicketSaleTimes(update.tokenId, now, futureDate);
      console.log(`   Transaction hash: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`   ✅ Confirmed in block ${receipt.blockNumber}\n`);
      
    } catch (error) {
      console.error(`   ❌ Error updating token ${update.tokenId}:`, error.message);
      console.error();
    }
  }

  console.log("✅ Price and time updates completed!");
  console.log("\n📋 Next Steps:");
  console.log("1. Verify the new prices on the blockchain");
  console.log("2. Sync the blockchain data to the backend database");
  console.log("3. Test purchasing tickets with new prices");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
