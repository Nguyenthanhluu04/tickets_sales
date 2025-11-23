const mongoose = require('mongoose');
const { ethers } = require('ethers');
require('dotenv').config();

// Import models
const TicketType = require('../src/models/TicketType');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const updatePricesAndTimes = async () => {
  try {
    await connectDB();

    // Current time
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

    console.log('\n🔄 Updating ticket prices and sale times...\n');

    // Update Summer Music Festival (Event ID: 0)
    console.log('📅 Summer Music Festival 2025 (Event ID: 0)');
    
    // VIP Pass (tokenId: 0) - từ 0.5 xuống 0.01
    await TicketType.updateOne(
      { tokenId: 0 },
      { 
        price: ethers.parseEther('0.01').toString(),
        startSaleTime: now,
        endSaleTime: futureDate
      }
    );
    console.log('   ✅ VIP Pass: 0.5 → 0.01 MATIC');

    // Regular Pass (tokenId: 1) - từ 0.2 xuống 0.005
    await TicketType.updateOne(
      { tokenId: 1 },
      { 
        price: ethers.parseEther('0.005').toString(),
        startSaleTime: now,
        endSaleTime: futureDate
      }
    );
    console.log('   ✅ Regular Pass: 0.2 → 0.005 MATIC');

    // Early Bird (tokenId: 2) - từ 0.15 xuống 0.003
    await TicketType.updateOne(
      { tokenId: 2 },
      { 
        price: ethers.parseEther('0.003').toString(),
        startSaleTime: now,
        endSaleTime: futureDate
      }
    );
    console.log('   ✅ Early Bird: 0.15 → 0.003 MATIC');

    // Update Web3 Developer Conference (Event ID: 1)
    console.log('\n📅 Web3 Developer Conference 2025 (Event ID: 1)');
    
    // Standard Access (tokenId: 3) - từ 0.3 xuống 0.008
    await TicketType.updateOne(
      { tokenId: 3 },
      { 
        price: ethers.parseEther('0.008').toString(),
        startSaleTime: now,
        endSaleTime: futureDate
      }
    );
    console.log('   ✅ Standard Access: 0.3 → 0.008 MATIC');

    // Premium Access (tokenId: 4) - từ 0.6 xuống 0.012
    await TicketType.updateOne(
      { tokenId: 4 },
      { 
        price: ethers.parseEther('0.012').toString(),
        startSaleTime: now,
        endSaleTime: futureDate
      }
    );
    console.log('   ✅ Premium Access: 0.6 → 0.012 MATIC');

    console.log('\n✅ All prices and times updated successfully!');
    console.log('\n⚠️  LƯU Ý: Bạn cần cập nhật giá trên blockchain bằng cách:');
    console.log('   1. Mở frontend và kết nối ví với tài khoản organizer');
    console.log('   2. Gọi hàm updateTicketPrice() trên smart contract cho từng tokenId');
    console.log('   3. Hoặc chạy script blockchain để cập nhật giá tự động\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

updatePricesAndTimes();
