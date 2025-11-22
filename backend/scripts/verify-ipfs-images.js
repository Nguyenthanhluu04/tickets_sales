require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../src/models/Event');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`${colors.green}✅ Connected to MongoDB${colors.reset}\n`);

    const events = await Event.find().sort({ eventId: 1 });

    console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║           IPFS IMAGES STATUS - ALL EVENTS                      ║${colors.reset}`);
    console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════════╗${colors.reset}\n`);

    for (const event of events) {
      console.log(`${colors.yellow}📅 Event ${event.eventId}: ${event.name}${colors.reset}`);
      console.log(`${colors.blue}   Category: ${event.category}${colors.reset}`);
      
      if (event.bannerImage) {
        console.log(`${colors.green}   ✅ Banner URL: ${event.bannerImage.substring(0, 70)}...${colors.reset}`);
      } else {
        console.log(`${colors.red}   ❌ No banner URL${colors.reset}`);
      }

      if (event.bannerImageIPFS) {
        console.log(`${colors.green}   ✅ IPFS Hash: ${event.bannerImageIPFS}${colors.reset}`);
        console.log(`${colors.cyan}   🔗 Pinata: https://gateway.pinata.cloud/ipfs/${event.bannerImageIPFS}${colors.reset}`);
        console.log(`${colors.cyan}   🔗 IPFS.io: https://ipfs.io/ipfs/${event.bannerImageIPFS}${colors.reset}`);
      } else {
        console.log(`${colors.red}   ❌ No IPFS hash${colors.reset}`);
      }
      console.log('');
    }

    const withIPFS = events.filter(e => e.bannerImageIPFS).length;
    const total = events.length;

    console.log(`${colors.cyan}════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}📊 Summary: ${withIPFS}/${total} events have IPFS images${colors.reset}\n`);

    if (withIPFS === total) {
      console.log(`${colors.green}🎉 TẤT CẢ EVENTS ĐÃ CÓ ẢNH TRÊN IPFS!${colors.reset}\n`);
      
      console.log(`${colors.yellow}💡 Bạn có thể xem tất cả files tại:${colors.reset}`);
      console.log(`   https://app.pinata.cloud/pinmanager\n`);
    } else {
      console.log(`${colors.yellow}⚠️  ${total - withIPFS} events chưa có ảnh IPFS${colors.reset}\n`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error);
    process.exit(1);
  }
}

main();
