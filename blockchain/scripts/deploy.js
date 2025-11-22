const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TicketNFT Contract...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Configuration
  const BASE_URI = "https://gateway.pinata.cloud/ipfs/";
  // Use deployer address if INITIAL_ADMIN_ADDRESS is not set or is placeholder
  let ADMIN_ADDRESS = process.env.INITIAL_ADMIN_ADDRESS;
  if (!ADMIN_ADDRESS || ADMIN_ADDRESS.includes('your_') || !ADMIN_ADDRESS.startsWith('0x')) {
    ADMIN_ADDRESS = deployer.address;
  }

  console.log("⚙️  Configuration:");
  console.log("   Base URI:", BASE_URI);
  console.log("   Admin Address:", ADMIN_ADDRESS);
  console.log("");

  // Deploy contract
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.deploy(BASE_URI, ADMIN_ADDRESS);

  await ticketNFT.waitForDeployment();

  const contractAddress = await ticketNFT.getAddress();

  console.log("✅ TicketNFT deployed to:", contractAddress);
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    admin: ADMIN_ADDRESS,
    baseURI: BASE_URI,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  console.log("📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("");

  // Wait for block confirmations before verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting for 5 block confirmations...");
    await ticketNFT.deploymentTransaction().wait(5);
    console.log("✅ Confirmations received\n");

    // Verify contract
    console.log("🔍 Verifying contract on PolygonScan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [BASE_URI, ADMIN_ADDRESS],
      });
      console.log("✅ Contract verified successfully");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment Complete!");
  console.log("\n📋 Next Steps:");
  console.log("1. Save the contract address:", contractAddress);
  console.log("2. Update your .env file with CONTRACT_ADDRESS");
  console.log("3. Run setup-events.js to create test events");
  console.log("4. Update frontend with contract address and ABI");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
