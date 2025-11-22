const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  console.log("🔍 Simple blockchain check...\n");

  const RPC_URL = process.env.AMOY_RPC_URL;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  let PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
  
  // Ensure private key has 0x prefix
  if (PRIVATE_KEY && !PRIVATE_KEY.startsWith("0x")) {
    PRIVATE_KEY = "0x" + PRIVATE_KEY;
  }

  console.log("RPC URL:", RPC_URL);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("Private Key:", PRIVATE_KEY ? `${PRIVATE_KEY.substring(0, 8)}...` : "Not set");
  console.log("");

  // Connect to provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("Wallet address:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "MATIC");
  console.log("");

  // Load contract ABI
  const contractABI = require("../artifacts/contracts/TicketNFT.sol/TicketNFT.json").abi;
  
  // Connect to contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
  
  console.log("✅ Connected to contract");
  console.log("");

  try {
    // Try to get event 0
    console.log("Getting Event 0...");
    const event0 = await contract.getEvent(0);
    console.log("Event 0:", event0.name);
    console.log("  Description:", event0.description);
    console.log("  Start:", new Date(Number(event0.startTime) * 1000).toLocaleString());
    console.log("  End:", new Date(Number(event0.endTime) * 1000).toLocaleString());
    console.log("");

    // Get ticket types for event 0
    const ticketTypes = await contract.getEventTicketTypes(0);
    console.log("Ticket types for Event 0:", ticketTypes.length);
    
    for (let i = 0; i < ticketTypes.length; i++) {
      const tokenId = ticketTypes[i];
      const ticketType = await contract.getTicketType(tokenId);
      console.log(`  ${i + 1}. ${ticketType.name} - ${ethers.formatEther(ticketType.price)} MATIC`);
      console.log(`     Supply: ${await contract.totalSupply(tokenId)}/${ticketType.maxSupply}`);
    }
    console.log("");

    // Try to get event 1
    console.log("Getting Event 1...");
    const event1 = await contract.getEvent(1);
    console.log("Event 1:", event1.name);
    console.log("  Description:", event1.description);
    console.log("  Start:", new Date(Number(event1.startTime) * 1000).toLocaleString());
    console.log("  End:", new Date(Number(event1.endTime) * 1000).toLocaleString());
    console.log("");

    // Get ticket types for event 1
    const ticketTypes1 = await contract.getEventTicketTypes(1);
    console.log("Ticket types for Event 1:", ticketTypes1.length);
    
    for (let i = 0; i < ticketTypes1.length; i++) {
      const tokenId = ticketTypes1[i];
      const ticketType = await contract.getTicketType(tokenId);
      console.log(`  ${i + 1}. ${ticketType.name} - ${ethers.formatEther(ticketType.price)} MATIC`);
      console.log(`     Supply: ${await contract.totalSupply(tokenId)}/${ticketType.maxSupply}`);
    }

    console.log("\n✅ Success! Events are on blockchain.");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main();
