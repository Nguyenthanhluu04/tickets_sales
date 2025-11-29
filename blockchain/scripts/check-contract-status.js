const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n=== CHECKING CONTRACT STATUS ===\n");
  
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ CONTRACT_ADDRESS not found in .env file");
    console.log("\n💡 Please add CONTRACT_ADDRESS to your .env file");
    process.exit(1);
  }
  
  console.log("📍 Contract Address:", contractAddress);
  
  try {
    // Get contract instance
    const TicketNFT = await ethers.getContractFactory("TicketNFT");
    const contract = TicketNFT.attach(contractAddress);
    
    // Check basic contract info
    console.log("\n📋 Contract Info:");
    const name = await contract.name();
    const symbol = await contract.symbol();
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    
    // Check contract balance
    const balance = await contract.getBalance();
    console.log("  Balance:", ethers.formatEther(balance), "MATIC");
    
    // Get deployer/admin info
    const [deployer] = await ethers.getSigners();
    console.log("\n👤 Your Wallet:");
    console.log("  Address:", deployer.address);
    const walletBalance = await ethers.provider.getBalance(deployer.address);
    console.log("  Balance:", ethers.formatEther(walletBalance), "MATIC");
    
    // Check roles
    console.log("\n🔐 Roles Check:");
    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const ORGANIZER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORGANIZER_ROLE"));
    const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
    
    const hasDefaultAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasAdmin = await contract.hasRole(ADMIN_ROLE, deployer.address);
    const hasOrganizer = await contract.hasRole(ORGANIZER_ROLE, deployer.address);
    
    console.log("  DEFAULT_ADMIN_ROLE:", hasDefaultAdmin ? "✅ Yes" : "❌ No");
    console.log("  ADMIN_ROLE:", hasAdmin ? "✅ Yes" : "❌ No");
    console.log("  ORGANIZER_ROLE:", hasOrganizer ? "✅ Yes" : "❌ No");
    
    // Check if paused
    const isPaused = await contract.paused();
    console.log("\n⏸️  Paused:", isPaused ? "⚠️ YES (contract is paused!)" : "✅ No");
    
    // Test event creation (estimate gas only)
    console.log("\n🧪 Testing Event Creation (Gas Estimation):");
    try {
      const futureTime = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
      const endTime = futureTime + 3600; // 1 hour after start
      
      const estimatedGas = await contract.createEvent.estimateGas(
        "Test Event",
        "Test Description",
        futureTime,
        endTime
      );
      
      console.log("  ✅ Gas Estimate:", estimatedGas.toString());
      console.log("  💰 Estimated Cost:", ethers.formatEther(estimatedGas * 30n) + " MATIC (at 30 gwei)");
      
      // Check if wallet has enough balance
      const estimatedCost = estimatedGas * 30000000000n; // 30 gwei gas price
      if (walletBalance < estimatedCost) {
        console.log("  ⚠️  WARNING: Wallet balance might be insufficient!");
        console.log("     Need at least:", ethers.formatEther(estimatedCost), "MATIC");
      }
      
    } catch (error) {
      console.log("  ❌ Gas Estimation Failed:", error.message);
      
      if (error.message.includes("Start time must be in future")) {
        console.log("     Reason: Time validation issue (this is expected for past times)");
      } else if (error.message.includes("paused")) {
        console.log("     Reason: Contract is paused");
      } else {
        console.log("     Full error:", error);
      }
    }
    
    // Network info
    const network = await ethers.provider.getNetwork();
    console.log("\n🌐 Network Info:");
    console.log("  Chain ID:", network.chainId.toString());
    console.log("  Name:", network.name);
    
    // Gas price
    const feeData = await ethers.provider.getFeeData();
    console.log("\n⛽ Current Gas Price:");
    console.log("  Gas Price:", ethers.formatUnits(feeData.gasPrice || 0n, "gwei"), "gwei");
    if (feeData.maxFeePerGas) {
      console.log("  Max Fee:", ethers.formatUnits(feeData.maxFeePerGas, "gwei"), "gwei");
    }
    
    console.log("\n✅ Contract is accessible and functioning!\n");
    
    // Recommendations
    console.log("📝 Recommendations:");
    if (walletBalance < ethers.parseEther("0.05")) {
      console.log("  ⚠️  Low MATIC balance. Get more from faucet: https://faucet.polygon.technology/");
    }
    if (!hasOrganizer && !hasAdmin) {
      console.log("  ⚠️  You need ORGANIZER or ADMIN role to create events");
    }
    if (isPaused) {
      console.log("  ⚠️  Contract is paused. Contact admin to unpause it.");
    }
    
  } catch (error) {
    console.error("\n❌ Error checking contract:", error.message);
    
    if (error.message.includes("invalid address")) {
      console.log("\n💡 The CONTRACT_ADDRESS in .env appears to be invalid");
    } else if (error.message.includes("no code at address")) {
      console.log("\n💡 No contract found at this address. Possible reasons:");
      console.log("   1. Contract not deployed yet");
      console.log("   2. Wrong network (check you're on Polygon Amoy Testnet)");
      console.log("   3. Wrong CONTRACT_ADDRESS in .env");
    } else if (error.message.includes("network")) {
      console.log("\n💡 Network connection issue. Check your RPC URL");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
