require('dotenv').config();
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');
const Ticket = require('../src/models/Ticket');
const Transaction = require('../src/models/Transaction');
const User = require('../src/models/User');

async function syncFromBlockchain() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    const contractArtifact = require('../src/config/contractABI.json');
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractArtifact.abi,
      provider
    );

    console.log('✅ Connected to blockchain');
    console.log(`📄 Contract: ${process.env.CONTRACT_ADDRESS}\n`);

    // Query last 100000 blocks to catch all events
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 100000);

    console.log(`📦 Syncing from block ${fromBlock} to ${currentBlock}\n`);

    // Sync TicketPurchased events
    const purchaseFilter = contract.filters.TicketPurchased();
    const purchaseEvents = await contract.queryFilter(purchaseFilter, fromBlock);

    console.log(`🎫 Found ${purchaseEvents.length} purchase events\n`);

    for (const event of purchaseEvents) {
      const { tokenId, buyer, amount } = event.args;
      const txHash = event.transactionHash;
      const blockNumber = event.blockNumber;

      console.log(`Processing purchase: Token ${tokenId}, Amount ${amount}, Buyer ${buyer.slice(0,8)}...`);

      // Tìm ticket type
      const ticketType = await TicketType.findOne({ tokenId: Number(tokenId) });
      if (!ticketType) {
        console.log(`   ⚠️  Ticket type ${tokenId} not found in database, skipping`);
        continue;
      }

      // Tìm hoặc tạo user
      let user = await User.findOne({ walletAddress: buyer.toLowerCase() });
      if (!user) {
        user = new User({
          walletAddress: buyer.toLowerCase(),
          email: `${buyer.toLowerCase()}@wallet.user`,
          name: `User ${buyer.slice(0, 8)}`,
          role: 'user'
        });
        await user.save();
        console.log(`   👤 Created user for ${buyer.slice(0, 8)}...`);
      }

      // Tạo hoặc update transaction
      let transaction = await Transaction.findOne({ transactionHash: txHash });
      if (!transaction) {
        transaction = new Transaction({
          transactionHash: txHash,
          from: buyer.toLowerCase(),
          eventId: ticketType.eventId,
          ticketTypeId: Number(tokenId),
          amount: amount.toString(),
          quantity: Number(amount),
          type: 'purchase',
          status: 'confirmed',
          blockNumber: blockNumber
        });
        await transaction.save();
        console.log(`   💳 Created transaction ${txHash.slice(0, 10)}...`);
      }

      // Tạo tickets riêng lẻ
      const existingTickets = await Ticket.countDocuments({
        ticketType: ticketType._id,
        owner: user.walletAddress,
        transactionHash: txHash
      });

      if (existingTickets === 0) {
        const timestamp = Date.now();
        for (let i = 0; i < Number(amount); i++) {
          const ticket = new Ticket({
            tokenId: `${tokenId}-${buyer}-${timestamp}-${i}`,
            eventId: ticketType.eventId,
            ticketTypeId: Number(tokenId),
            owner: user.walletAddress,
            ticketTypeName: ticketType.name,
            price: ticketType.price,
            transactionHash: txHash
          });
          await ticket.save();
        }
        console.log(`   🎫 Created ${amount} tickets`);
      } else {
        console.log(`   ✓  Tickets already exist`);
      }

      // Update currentSupply
      const totalSold = await Ticket.countDocuments({ ticketTypeId: Number(tokenId) });
      ticketType.currentSupply = totalSold;
      await ticketType.save();
      console.log(`   📈 Updated supply: ${totalSold}/${ticketType.maxSupply}\n`);
    }

    console.log('✅ Sync completed!');

  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

syncFromBlockchain();
