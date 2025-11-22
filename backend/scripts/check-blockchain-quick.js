require('dotenv').config();
const { ethers } = require('ethers');

async function checkBlockchainQuick() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    const contractArtifact = require('../src/config/contractABI.json');
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractArtifact.abi,
      provider
    );

    console.log('✅ Connected to blockchain');
    console.log(`📄 Contract: ${process.env.CONTRACT_ADDRESS}`);
    console.log(`🌐 Network: ${(await provider.getNetwork()).name}\n`);

    // Lấy events từ 50000 blocks gần nhất
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 50000);

    console.log(`📦 Checking blocks ${fromBlock} to ${currentBlock} (last 50000 blocks)\n`);

    // Kiểm tra events
    const eventCreatedFilter = contract.filters.EventCreated();
    const ticketPurchasedFilter = contract.filters.TicketPurchased();

    const eventCreated = await contract.queryFilter(eventCreatedFilter, fromBlock);
    const ticketPurchased = await contract.queryFilter(ticketPurchasedFilter, fromBlock);

    console.log('📊 BLOCKCHAIN EVENTS:');
    console.log(`   EventCreated: ${eventCreated.length}`);
    console.log(`   TicketPurchased: ${ticketPurchased.length}`);

    if (ticketPurchased.length > 0) {
      console.log('\n🎫 PURCHASES:');
      for (const event of ticketPurchased) {
        console.log(`   - Token ID ${event.args.tokenId}: ${event.args.amount} tickets by ${event.args.buyer.slice(0, 8)}...`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBlockchainQuick();
