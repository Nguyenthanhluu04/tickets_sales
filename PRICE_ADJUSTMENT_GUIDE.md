# 💰 Hướng Dẫn Điều Chỉnh Giá Vé Phù Hợp Với Budget

## 📊 Tình Huống Của Bạn

**Số dư hiện tại:** 0.05589266 POL (Polygon Amoy Testnet)

**Vấn đề:** Giá vé hiện tại quá cao (0.15 - 0.6 POL)

**Giải pháp:** Tạo event mới với giá vé rẻ hơn

---

## ✅ OPTION 1: Tạo Event Mới Với Giá Rẻ (KHUYẾN NGHỊ)

### Bước 1: Kiểm tra giá vé hiện tại

```bash
cd blockchain
npx hardhat run scripts/check-ticket-prices.js --network amoy
```

### Bước 2: Tạo event mới với giá rẻ

```bash
npx hardhat run scripts/create-affordable-event.js --network amoy
```

Script này sẽ tạo:

- **Budget Ticket**: 0.001 POL (~$0.001)
- **Economy Ticket**: 0.005 POL (~$0.005)
- **Standard Ticket**: 0.01 POL (~$0.01)

### Bước 3: Đồng bộ vào database

```bash
cd ../backend
node scripts/sync-events-to-db.js
```

### Bước 4: Refresh frontend và mua vé!

---

## ⚠️ OPTION 2: Lấy Thêm Testnet Token (MIỄN PHÍ)

Nếu muốn giữ giá vé hiện tại, bạn có thể lấy thêm POL testnet MIỄN PHÍ:

### Polygon Amoy Faucet:

1. **Alchemy Faucet** (Khuyến nghị)

   - Link: https://www.alchemy.com/faucets/polygon-amoy
   - Lượng: 0.5 POL/ngày
   - Yêu cầu: Tài khoản Alchemy (free)

2. **QuickNode Faucet**

   - Link: https://faucet.quicknode.com/polygon/amoy
   - Lượng: 0.1 POL/ngày

3. **Polygon Faucet**

   - Link: https://faucet.polygon.technology/
   - Chọn: Polygon Amoy
   - Lượng: 0.1 POL/ngày

   địa chỉ ví của metamask trên mạng Amoy testnet. : 0xD72c9c58DD567d5ecDF0Db3FcfFF1648966d140A

### Cách nhận:

1. Vào một trong các faucet trên
2. Paste địa chỉ ví của bạn
3. Click "Send Me POL" hoặc "Request"
4. Đợi 1-2 phút
5. Kiểm tra ví MetaMask

---

## 📝 GIẢI THÍCH ẢNH HƯỞNG KHI HẠ GIÁ

### ✅ KHÔNG ẢNH HƯỞNG GÌ:

1. **Smart Contract hoạt động bình thường**

   - Giá vé chỉ là một số trong contract
   - Hạ giá không làm hỏng logic

2. **Database không bị ảnh hưởng**

   - Mỗi ticket type có giá riêng
   - Backend sẽ lưu đúng giá bạn set

3. **Frontend hiển thị đúng**

   - Tự động hiển thị giá mới
   - Không cần sửa code

4. **Blockchain ghi nhận chính xác**
   - Transaction vẫn được verify
   - Ownership vẫn đúng

### ⚠️ CẦN LƯU Ý:

1. **Không thể thay đổi giá vé đã tạo**

   - Smart contract không có hàm update price
   - Phải tạo ticket type MỚI với giá mới

2. **Gas fee vẫn phải trả**

   - Mua vé 0.001 POL
   - Gas fee ~0.001-0.002 POL
   - **Tổng: ~0.002-0.003 POL**

3. **Phải sync vào database**
   - Sau khi tạo event mới
   - Chạy script sync
   - Frontend mới hiển thị

---

## 🎯 KHUYẾN NGHỊ CHO BẠN

Với số dư **0.05589266 POL**, bạn nên:

### Plan A: Tạo vé giá rẻ (Khuyến nghị)

```bash
# Bước 1: Tạo event giá rẻ
cd blockchain
npx hardhat run scripts/create-affordable-event.js --network amoy

# Bước 2: Sync database
cd ../backend
node scripts/sync-events-to-db.js

# Bước 3: Mua vé trên frontend
# Chọn "Budget Ticket" - 0.001 POL
# Có thể mua tới 25 vé!
```

### Plan B: Lấy thêm testnet token

```
1. Vào https://www.alchemy.com/faucets/polygon-amoy
2. Đăng ký tài khoản (free)
3. Nhập địa chỉ ví
4. Nhận 0.5 POL miễn phí
5. Mua vé với giá hiện tại
```

---

## 💡 TẠI SAO NÊN DÙNG TESTNET TOKEN?

1. **Hoàn toàn miễn phí** - Không mất tiền thật
2. **Không giới hạn** - Có thể lấy mỗi ngày
3. **Giống mainnet** - Test đầy đủ chức năng
4. **An toàn** - Không rủi ro tài chính

---

## 📞 CẦN GIÚP?

Chạy script kiểm tra giá vé:

```bash
cd blockchain
npx hardhat run scripts/check-ticket-prices.js --network amoy
```

Xem balance của bạn trong contract:

```bash
npx hardhat console --network amoy
> const [signer] = await ethers.getSigners()
> const balance = await ethers.provider.getBalance(signer.address)
> ethers.formatEther(balance)
```

---

## ✨ KẾT LUẬN

**Hạ giá vé HOÀN TOÀN AN TOÀN và KHÔNG ẢNH HƯỞNG GÌ!**

Bạn chỉ cần:

1. Chạy script tạo event giá rẻ
2. Sync vào database
3. Mua vé trên frontend

Hoặc đơn giản hơn: Lấy thêm testnet token miễn phí! 🎉
