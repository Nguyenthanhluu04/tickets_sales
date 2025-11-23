require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');
const { ethers } = require('ethers');

async function comparePrices() {
  try {
    console.log('🔍 SO SÁNH GIÁ VÉ: DATABASE vs BLOCKCHAIN\n');
    console.log('='.repeat(80));
    
    // Connect to MongoDB
    console.log('🔌 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nft-ticketing');
    console.log('✅ Đã kết nối MongoDB\n');
    
    // Connect to blockchain
    console.log('🔌 Đang kết nối Blockchain...');
    const rpcUrl = process.env.AMOY_RPC_URL || process.env.RPC_URL || 'https://rpc-amoy.polygon.technology';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contractArtifact = require('../src/config/contractABI.json');
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractArtifact.abi, provider);
    console.log('✅ Đã kết nối Blockchain\n');
    console.log(`📍 RPC URL: ${rpcUrl}`);
    console.log(`📍 Contract: ${process.env.CONTRACT_ADDRESS}\n`);
    console.log('='.repeat(80));
    
    const eventsToCheck = [
      { name: 'Summer Music Festival 2025', eventId: 0 },
      { name: 'Web3 Developer Conference 2025', eventId: 1 }
    ];
    
    for (const eventInfo of eventsToCheck) {
      console.log(`\n🎪 ${eventInfo.name.toUpperCase()}`);
      console.log('='.repeat(80));
      
      // Get from database
      const dbEvent = await Event.findOne({ eventId: eventInfo.eventId });
      if (!dbEvent) {
        console.log('❌ Không tìm thấy sự kiện trong database');
        continue;
      }
      
      const dbTicketTypes = await TicketType.find({ eventId: eventInfo.eventId });
      
      // Get from blockchain
      const blockchainEvent = await contract['getEvent(uint256)'](eventInfo.eventId);
      const ticketTypeIds = await contract['getEventTicketTypes(uint256)'](eventInfo.eventId);
      
      console.log(`\n📊 Tổng quan:`);
      console.log(`   Database: ${dbTicketTypes.length} loại vé`);
      console.log(`   Blockchain: ${ticketTypeIds.length} loại vé`);
      const revenue = blockchainEvent.revenue || 0n;
      console.log(`   Doanh thu (Blockchain): ${ethers.formatEther(revenue)} POL`);
      console.log('');
      
      // Compare each ticket type
      for (const tokenId of ticketTypeIds) {
        const blockchainTicket = await contract['getTicketType(uint256)'](tokenId);
        const dbTicket = dbTicketTypes.find(t => t.tokenId === Number(tokenId));
        
        console.log(`🎫 ${blockchainTicket.name} (Token ID: ${tokenId})`);
        console.log('-'.repeat(80));
        
        // Blockchain price
        const blockchainPriceWei = blockchainTicket.price.toString();
        const blockchainPricePOL = ethers.formatEther(blockchainTicket.price);
        console.log(`\n📍 BLOCKCHAIN (Nguồn chính xác):`);
        console.log(`   Giá (POL):  ${blockchainPricePOL} POL`);
        console.log(`   Giá (Wei):  ${blockchainPriceWei} Wei`);
        
        // Database price
        if (dbTicket) {
          const dbPriceWei = dbTicket.price;
          const dbPricePOL = ethers.formatEther(dbPriceWei);
          console.log(`\n💾 DATABASE:`);
          console.log(`   Giá (POL):  ${dbPricePOL} POL`);
          console.log(`   Giá (Wei):  ${dbPriceWei} Wei`);
          
          // Compare
          console.log(`\n⚖️  SO SÁNH:`);
          if (blockchainPriceWei === dbPriceWei) {
            console.log(`   ✅ KHỚP - Giá trong database đúng với blockchain`);
          } else {
            console.log(`   ❌ KHÔNG KHỚP - Có sự khác biệt!`);
            console.log(`   📊 Chênh lệch: ${Math.abs(parseFloat(blockchainPricePOL) - parseFloat(dbPricePOL))} POL`);
            console.log(`   ⚠️  KHI MUA VÉ: Blockchain sẽ trừ ${blockchainPricePOL} POL (${blockchainPriceWei} Wei)`);
            console.log(`   ⚠️  HIỂN THỊ: Ứng dụng hiển thị ${dbPricePOL} POL (${dbPriceWei} Wei)`);
          }
          
          // Supply info
          const currentSupply = await contract['totalSupply(uint256)'](tokenId);
          console.log(`\n📦 SỐ LƯỢNG:`);
          console.log(`   Blockchain: ${currentSupply}/${blockchainTicket.maxSupply} đã bán`);
          console.log(`   Database:   ${dbTicket.currentSupply}/${dbTicket.maxSupply} đã bán`);
          
        } else {
          console.log(`\n💾 DATABASE: ❌ Không tìm thấy trong database`);
        }
        
        console.log('');
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📝 KẾT LUẬN VÀ GIẢI PHÁP:\n');
    console.log('1. 🎯 GIÁ THỰC TẾ KHI MUA VÉ:');
    console.log('   - Blockchain là nguồn chính xác duy nhất');
    console.log('   - Khi mua vé, smart contract sẽ trừ tiền theo giá trên blockchain');
    console.log('   - Database chỉ là bản sao để hiển thị nhanh\n');
    
    console.log('2. 🔄 NẾU GIÁ KHÔNG KHỚP:');
    console.log('   - Chạy sync để cập nhật database từ blockchain:');
    console.log('     cd backend && node scripts/sync-events-from-blockchain.js\n');
    
    console.log('3. 📱 CÁCH XEM GIÁ VÉ TRÊN BLOCKCHAIN:');
    console.log('   - Dùng script này: node backend/scripts/compare-prices.js');
    console.log('   - Hoặc: cd blockchain && npx hardhat run scripts/check-ticket-prices.js --network amoy');
    console.log('   - Hoặc xem trên Polygonscan: https://amoy.polygonscan.com/address/' + process.env.CONTRACT_ADDRESS + '\n');
    
    console.log('4. 💡 LÝ DO BỊ TRỪ NHIỀU TIỀN:');
    console.log('   - Nếu database hiển thị 0.003 POL nhưng blockchain là 0.01 POL');
    console.log('   - Khi mua vé, bạn sẽ bị trừ 0.01 POL (theo blockchain)');
    console.log('   - Giải pháp: Sync database hoặc cập nhật giá trên blockchain\n');
    
    console.log('5. 🔧 CÁCH CẬP NHẬT GIÁ VÉ:');
    console.log('   - Cập nhật trên blockchain (nguồn chính):');
    console.log('     cd blockchain && npx hardhat run scripts/update-prices.js --network amoy');
    console.log('   - Sau đó sync về database:');
    console.log('     cd backend && node scripts/sync-events-from-blockchain.js\n');
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Đã đóng kết nối database');
    process.exit(0);
  }
}

comparePrices();
