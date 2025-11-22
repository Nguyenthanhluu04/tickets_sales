require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Event = require('../src/models/Event');

const PINATA_JWT = process.env.PINATA_JWT;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

/**
 * Upload file lên Pinata IPFS
 */
async function uploadFileToPinata(filePath, eventId, eventName, category) {
  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);
    
    formData.append('file', fileStream);

    // Metadata
    const metadata = {
      name: fileName,
      keyvalues: {
        project: 'nft-ticketing',
        type: 'event-banner',
        eventId: eventId.toString(),
        eventName: eventName,
        category: category || 'event',
        uploadedAt: new Date().toISOString()
      }
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    // Options
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders()
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp
    };

  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════╗
║     UPLOAD LOCAL IMAGES TO PINATA IPFS                   ║
╚══════════════════════════════════════════════════════════╝
  ${colors.reset}\n`);

  // Kiểm tra JWT
  if (!PINATA_JWT) {
    console.error(`${colors.red}❌ THIẾU PINATA_JWT trong file .env!${colors.reset}\n`);
    console.log(`${colors.yellow}📖 Xem hướng dẫn tại: backend/UPLOAD_IMAGES_GUIDE.md${colors.reset}\n`);
    process.exit(1);
  }

  try {
    // Kiểm tra thư mục images
    const imagesDir = path.join(__dirname, '../public/images/events');
    
    if (!fs.existsSync(imagesDir)) {
      console.error(`${colors.red}❌ Thư mục không tồn tại: ${imagesDir}${colors.reset}\n`);
      console.log(`${colors.yellow}💡 Chạy trước: node scripts/download-event-images.js${colors.reset}\n`);
      process.exit(1);
    }

    // Kết nối MongoDB
    console.log(`${colors.blue}🔌 Connecting to MongoDB...${colors.reset}`);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`${colors.green}✅ Connected${colors.reset}\n`);

    // Lấy events
    const events = await Event.find().sort({ eventId: 1 });
    console.log(`${colors.blue}📊 Events: ${events.length}${colors.reset}`);
    
    // Kiểm tra files
    const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    console.log(`${colors.blue}📁 Image files: ${files.length}${colors.reset}\n`);

    let uploadCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Upload từng file
    for (const event of events) {
      console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
      console.log(`${colors.yellow}📅 Event ${event.eventId}: ${event.name}${colors.reset}`);
      console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

      // Kiểm tra đã có IPFS hash chưa
      if (event.bannerImageIPFS) {
        console.log(`${colors.green}✅ Đã có IPFS hash${colors.reset}`);
        console.log(`   CID: ${event.bannerImageIPFS}`);
        console.log(`   🔗 https://gateway.pinata.cloud/ipfs/${event.bannerImageIPFS}\n`);
        skipCount++;
        continue;
      }

      // Tìm file tương ứng
      const imageFile = files.find(f => f.startsWith(`event-${event.eventId}-`));
      
      if (!imageFile) {
        console.log(`${colors.yellow}⚠️  Không tìm thấy file ảnh${colors.reset}\n`);
        errorCount++;
        continue;
      }

      const filePath = path.join(imagesDir, imageFile);
      const fileSize = fs.statSync(filePath).size;

      console.log(`${colors.blue}📄 File: ${imageFile}${colors.reset}`);
      console.log(`   Size: ${(fileSize / 1024).toFixed(2)} KB\n`);

      // Upload
      console.log(`${colors.blue}📤 Uploading to Pinata...${colors.reset}`);
      
      const result = await uploadFileToPinata(
        filePath,
        event.eventId,
        event.name,
        event.category
      );

      if (result.success) {
        console.log(`${colors.green}✅ Upload thành công!${colors.reset}`);
        console.log(`   CID: ${result.ipfsHash}`);
        console.log(`   Size on IPFS: ${(result.pinSize / 1024).toFixed(2)} KB\n`);

        // Update database
        console.log(`${colors.blue}💾 Updating database...${colors.reset}`);
        event.bannerImageIPFS = result.ipfsHash;
        
        // Fix category mapping
        const categoryMapping = {
          'music': 'music',
          'technology': 'conference',
          'sports': 'sports',
          'conference': 'conference',
          'theater': 'theater',
          'festival': 'festival',
          'workshop': 'workshop',
          'other': 'other'
        };
        
        if (event.category) {
          const lowerCategory = event.category.toLowerCase();
          event.category = categoryMapping[lowerCategory] || 'other';
        }
        
        await event.save();
        console.log(`${colors.green}✅ Saved to database${colors.reset}\n`);

        // URLs
        console.log(`${colors.green}🔗 Access URLs:${colors.reset}`);
        console.log(`   Pinata:      https://gateway.pinata.cloud/ipfs/${result.ipfsHash}`);
        console.log(`   IPFS.io:     https://ipfs.io/ipfs/${result.ipfsHash}`);
        console.log(`   Cloudflare:  https://cloudflare-ipfs.com/ipfs/${result.ipfsHash}`);
        console.log(`   IPFS URI:    ipfs://${result.ipfsHash}\n`);

        uploadCount++;

      } else {
        console.error(`${colors.red}❌ Upload thất bại!${colors.reset}`);
        console.error(`   Error:`, result.error);
        console.log('');
        
        // Kiểm tra lỗi permission
        if (result.error?.error?.reason === 'NO_SCOPES_FOUND') {
          console.log(`${colors.red}⚠️  API KEY KHÔNG CÓ QUYỀN UPLOAD!${colors.reset}\n`);
          console.log(`${colors.yellow}📖 Làm theo hướng dẫn:${colors.reset}`);
          console.log(`   1. Mở: ${path.join(__dirname, '../UPLOAD_IMAGES_GUIDE.md')}`);
          console.log(`   2. Tạo API Key mới với quyền "pinFileToIPFS"`);
          console.log(`   3. Cập nhật PINATA_JWT trong .env`);
          console.log(`   4. Chạy lại script này\n`);
          break;
        }
        
        errorCount++;
      }
    }

    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.green}✨ KẾT THÚC!${colors.reset}\n`);

    // Summary
    console.log(`${colors.blue}📊 Tổng kết:${colors.reset}`);
    console.log(`   ✅ Upload thành công: ${uploadCount}`);
    console.log(`   ⏭️  Đã có sẵn (bỏ qua): ${skipCount}`);
    console.log(`   ❌ Lỗi: ${errorCount}`);
    console.log(`   📁 Total: ${events.length} events\n`);

    if (uploadCount > 0) {
      console.log(`${colors.yellow}💡 Xem tất cả files trên Pinata:${colors.reset}`);
      console.log(`   https://app.pinata.cloud/pinmanager\n`);
      
      console.log(`${colors.yellow}💡 Kiểm tra files đã upload:${colors.reset}`);
      console.log(`   node scripts/check-pinata-files.js\n`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Fatal error:${colors.reset}`, error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log(`${colors.blue}🔌 Đã đóng kết nối database${colors.reset}`);
    }
  }
}

main().catch(console.error);
