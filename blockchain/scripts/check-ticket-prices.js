const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("💰 KIỂM TRA GIÁ VÉ TRÊN BLOCKCHAIN\n");
  console.log("=".repeat(70));

  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  console.log("📍 Contract Address:", CONTRACT_ADDRESS);

  // Get contract
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const contract = TicketNFT.attach(CONTRACT_ADDRESS);

  console.log("✅ Đã kết nối với smart contract\n");

  // Events to check
  const eventsToCheck = [
    { id: 0, name: "Summer Music Festival 2025" },
    { id: 1, name: "Web3 Developer Conference 2025" }
  ];

  for (const eventInfo of eventsToCheck) {
    try {
      console.log("\n" + "=".repeat(70));
      console.log(`🎪 ${eventInfo.name.toUpperCase()}`);
      console.log("=".repeat(70));
      
      const event = await contract.getEvent(eventInfo.id);
      
      console.log("\n📊 Thông tin sự kiện:");
      console.log(`   Tên: ${event.name}`);
      console.log(`   Người tổ chức: ${event.organizer}`);
      console.log(`   Ngày bắt đầu: ${new Date(Number(event.startTime) * 1000).toLocaleString('vi-VN')}`);
      console.log(`   Tổng vé đã bán: ${event.totalTicketsSold.toString()}`);
      console.log(`   Doanh thu: ${ethers.formatEther(event.revenue)} POL`);

      // Get ticket types
      const ticketTypeIds = await contract.getEventTicketTypes(eventInfo.id);
      console.log(`\n🎫 CÁC LOẠI VÉ (${ticketTypeIds.length}):\n`);

      for (const tokenId of ticketTypeIds) {
        const ticketType = await contract.getTicketType(tokenId);
        const currentSupply = await contract.totalSupply(tokenId);
        const priceInWei = ticketType.price.toString();
        const priceInPOL = ethers.formatEther(ticketType.price);
        
        console.log(`   🔖 ${ticketType.name}`);
        console.log(`      Token ID: ${tokenId}`);
        console.log(`      💵 GIÁ:`);
        console.log(`         ${priceInPOL} POL`);
        console.log(`         ${priceInWei} Wei`);
        console.log(`      📦 Số lượng: ${currentSupply}/${ticketType.maxSupply} (đã bán/tổng)`);
        console.log(`      ⏰ Thời gian bán:`);
        console.log(`         Từ: ${new Date(Number(ticketType.startSaleTime) * 1000).toLocaleString('vi-VN')}`);
        console.log(`         Đến: ${new Date(Number(ticketType.endSaleTime) * 1000).toLocaleString('vi-VN')}`);
        console.log(`      ✅ Trạng thái: ${ticketType.isActive ? 'Active' : 'Inactive'}`);
        console.log("");
      }

    } catch (error) {
      console.error(`\n❌ Lỗi khi kiểm tra sự kiện ${eventInfo.name}:`);
      console.error(`   ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ HOÀN TẤT KIỂM TRA!\n");
  
  console.log("📝 LƯU Ý:");
  console.log("   - 1 POL (MATIC) = 1,000,000,000,000,000,000 Wei");
  console.log("   - Khi mua vé, blockchain sẽ trừ theo giá trên blockchain (POL/Wei)");
  console.log("   - Giá hiển thị trong ứng dụng phải khớp với giá trên blockchain");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ LỖI:", error);
    process.exit(1);
  });
