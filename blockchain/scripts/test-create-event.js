const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n=== TESTING CREATE EVENT TRANSACTION ===\n");
  
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const [signer] = await ethers.getSigners();
  
  console.log("Contract:", contractAddress);
  console.log("Signer:", signer.address);
  
  // Get contract
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const contract = TicketNFT.attach(contractAddress);
  
  // Test data (same as from error)
  const name = "Music Night with Famous Artist JACK";
  const description = "Đêm Nhạc Cùng Nghệ Sĩ Nổi Tiếng JACK là buổi trình diễn của nghệ sĩ nổi tiếng cùng các Fan VKUER";
  const startTime = 1764252240; // 11/27/2025, 9:04 PM
  const endTime = 1764518640;   // 11/30/2025, 11:04 PM
  
  console.log("\nEvent data:");
  console.log("  Name:", name);
  console.log("  Name length:", name.length, "chars");
  console.log("  Description:", description);
  console.log("  Desc length:", description.length, "chars");
  console.log("  Start:", new Date(startTime * 1000).toLocaleString());
  console.log("  End:", new Date(endTime * 1000).toLocaleString());
  
  // Check current time
  const now = Math.floor(Date.now() / 1000);
  console.log("\nTime validation:");
  console.log("  Current:", now, "(" + new Date().toLocaleString() + ")");
  console.log("  Start - Now:", (startTime - now), "seconds");
  console.log("  End - Start:", (endTime - startTime), "seconds");
  
  if (startTime <= now) {
    console.log("  ❌ Start time is in the past!");
    process.exit(1);
  }
  
  // Estimate gas
  console.log("\n📊 Estimating gas...");
  try {
    const estimatedGas = await contract.createEvent.estimateGas(
      name,
      description,
      startTime,
      endTime
    );
    console.log("  ✅ Gas estimate:", estimatedGas.toString());
    
    // Get gas price
    const feeData = await ethers.provider.getFeeData();
    console.log("  Gas price:", ethers.formatUnits(feeData.gasPrice || 0n, "gwei"), "gwei");
    
    const estimatedCost = estimatedGas * (feeData.gasPrice || 30000000000n);
    console.log("  Estimated cost:", ethers.formatEther(estimatedCost), "MATIC");
    
    // Check balance
    const balance = await ethers.provider.getBalance(signer.address);
    console.log("  Wallet balance:", ethers.formatEther(balance), "MATIC");
    
    if (balance < estimatedCost) {
      console.log("  ⚠️  WARNING: Insufficient balance!");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("  ❌ Gas estimation failed:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
  
  // Try to send transaction
  console.log("\n🚀 Sending transaction...");
  try {
    const tx = await contract.createEvent(
      name,
      description,
      startTime,
      endTime,
      {
        gasLimit: 500000 // Use fixed gas limit
      }
    );
    
    console.log("  ✅ Transaction sent:", tx.hash);
    console.log("  Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("  ✅ Transaction confirmed!");
    console.log("  Block:", receipt.blockNumber);
    console.log("  Gas used:", receipt.gasUsed.toString());
    
    // Get event ID
    const eventCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'EventCreated';
      } catch {
        return false;
      }
    });
    
    if (eventCreatedEvent) {
      const parsed = contract.interface.parseLog(eventCreatedEvent);
      console.log("  Event ID:", parsed.args.eventId.toString());
    }
    
  } catch (error) {
    console.error("  ❌ Transaction failed:", error.message);
    
    if (error.code === 'CALL_EXCEPTION') {
      console.error("\n💡 Contract reverted. Possible reasons:");
      console.error("   - Start time validation failed");
      console.error("   - End time validation failed");
      console.error("   - Contract is paused");
      console.error("   - Name is empty");
    }
    
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
