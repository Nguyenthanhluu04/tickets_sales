const hre = require("hardhat");

async function main() {
  // Replace with your deployed contract address
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS";
  
  const BASE_URI = "https://gateway.pinata.cloud/ipfs/";
  const [deployer] = await hre.ethers.getSigners();
  const ADMIN_ADDRESS = process.env.INITIAL_ADMIN_ADDRESS || deployer.address;

  console.log("🔍 Verifying contract at:", CONTRACT_ADDRESS);
  console.log("   Base URI:", BASE_URI);
  console.log("   Admin Address:", ADMIN_ADDRESS);
  console.log("");

  try {
    await hre.run("verify:verify", {
      address: CONTRACT_ADDRESS,
      constructorArguments: [BASE_URI, ADMIN_ADDRESS],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
