require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');

async function checkSaleTimes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const now = new Date();
    console.log(`⏰ Thời gian hiện tại: ${now.toLocaleString('vi-VN')}\n`);
    console.log('='.repeat(70));

    // Get all events
    const events = await Event.find().sort({ eventId: 1 });

    for (const event of events) {
      console.log(`\n📅 EVENT ${event.eventId}: ${event.name}`);
      console.log('-'.repeat(70));

      const ticketTypes = await TicketType.find({ eventId: event.eventId }).sort({ tokenId: 1 });

      for (const tt of ticketTypes) {
        const saleStart = new Date(tt.startSaleTime);
        const saleEnd = new Date(tt.endSaleTime);
        const saleStarted = now >= saleStart;
        const saleEnded = now >= saleEnd;

        console.log(`\n🎫 ${tt.name} (Token ID: ${tt.tokenId})`);
        console.log(`   💰 Giá: ${tt.price} wei (${(Number(tt.price) / 1e18).toFixed(4)} POL)`);
        console.log(`   📦 Supply: ${tt.currentSupply}/${tt.maxSupply}`);
        console.log(`   ⏰ Bán từ: ${saleStart.toLocaleString('vi-VN')}`);
        console.log(`   ⏰ Đến:    ${saleEnd.toLocaleString('vi-VN')}`);
        console.log(`   📊 Trạng thái:`);
        
        if (!saleStarted) {
          const timeUntilStart = Math.floor((saleStart - now) / 1000 / 60 / 60 / 24);
          console.log(`      ❌ CHƯA MỞ BÁN (còn ${timeUntilStart} ngày)`);
        } else if (saleEnded) {
          console.log(`      ❌ ĐÃ ĐÓNG BÁN`);
        } else {
          console.log(`      ✅ ĐANG BÁN`);
        }
      }

      console.log('\n' + '='.repeat(70));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSaleTimes();
