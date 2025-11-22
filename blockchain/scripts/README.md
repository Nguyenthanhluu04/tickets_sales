# Blockchain Scripts

## 📋 Các Scripts Hiện Tại

### 1. `deploy.js` - Deploy Smart Contract

```bash
npx hardhat run scripts/deploy.js --network amoy
```

**Chức năng:**

- Deploy TicketNFT contract lên blockchain
- Tự động verify contract trên PolygonScan
- Hiển thị contract address

**Khi nào dùng:**

- Deploy lần đầu
- Deploy version mới sau khi thay đổi contract
- Deploy lên network khác

**Output:**

- Contract address (lưu vào `.env`)
- Deployment transaction hash
- PolygonScan verification link

---

### 2. `verify.js` - Verify Contract trên PolygonScan

```bash
npx hardhat run scripts/verify.js --network amoy
```

**Chức năng:**

- Verify source code trên PolygonScan
- Cho phép users xem code và interact

**Khi nào dùng:**

- Sau khi deploy (nếu auto-verify fail)
- Re-verify nếu cần

**Yêu cầu:**

- Đã có `POLYGONSCAN_API_KEY` trong `.env`
- Contract đã được deploy

---

### 3. `check-events-detail.js` - Kiểm tra Events trên Blockchain

```bash
npx hardhat run scripts/check-events-detail.js --network amoy
```

**Chức năng:**

- Lấy thông tin events từ smart contract
- Hiển thị chi tiết: name, dates, organizer
- Kiểm tra ticket types và sale times
- Xác định trạng thái bán vé

**Khi nào dùng:**

- Debug vấn đề với events
- Verify data trên blockchain
- Kiểm tra sale windows
- Compare với database

**Output:**

```
EVENT 0: Summer Music Festival 2025
  Start: 11/21/2025
  Ticket Types:
    - VIP Pass: 0.5 POL (0/100) - ✅ Đang bán
    - Regular: 0.2 POL (0/500) - ❌ Chưa mở bán
```

---

## 🗑️ Scripts Đã Xóa

### Temporary/Testing Scripts (đã xóa)

- ❌ `check-events-blockchain.js` - Check events (duplicate)
- ❌ `check-ticket-prices.js` - Check prices only
- ❌ `create-affordable-event.js` - Tạo event giá rẻ (test)
- ❌ `setup-events.js` - Setup mock events
- ❌ `simple-check.js` - Simple check (duplicate)
- ❌ `sync-to-database.js` - Sync manual (backend tự động)

**Lý do xóa:**

- Events đã được tạo
- Có `check-events-detail.js` đầy đủ hơn
- Backend tự động sync, không cần manual

---

## 🔧 Workflows

### Deploy Contract Mới

1. **Compile:**

   ```bash
   npx hardhat compile
   ```

2. **Deploy:**

   ```bash
   npx hardhat run scripts/deploy.js --network amoy
   ```

3. **Copy contract address** → Cập nhật `.env`:

   ```env
   CONTRACT_ADDRESS=0x...
   ```

4. **Update ABI:**

   ```bash
   # Copy ABI từ artifacts/contracts/TicketNFT.sol/TicketNFT.json
   # Paste vào:
   # - backend/src/config/contractABI.json
   # - frontend/src/utils/contractABI.json
   ```

5. **Verify:**
   ```bash
   npx hardhat run scripts/verify.js --network amoy
   ```

---

### Kiểm tra Contract

```bash
# Xem events trên blockchain
npx hardhat run scripts/check-events-detail.js --network amoy

# Hoặc qua PolygonScan
https://amoy.polygonscan.com/address/CONTRACT_ADDRESS
```

---

## 📚 Hardhat Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Get accounts
npx hardhat accounts

# Run local node
npx hardhat node

# Deploy to local
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Amoy testnet
npx hardhat run scripts/deploy.js --network amoy

# Clean artifacts
npx hardhat clean
```

---

## 🔐 Environment Variables Cần Thiết

```env
# .env file trong blockchain/
DEPLOYER_PRIVATE_KEY=xxx  # Private key để deploy (64 chars, NO 0x)
POLYGONSCAN_API_KEY=xxx   # Để verify contract
CONTRACT_ADDRESS=0x...    # Sau khi deploy

# RPC URLs
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_RPC_URL=https://polygon-rpc.com
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Private Key:**

   - 64 characters (KHÔNG có `0x` prefix)
   - KHÔNG commit vào Git
   - Phải có MATIC để trả gas fees

2. **Contract Address:**

   - Sau deploy, cập nhật vào:
     - `blockchain/.env`
     - `backend/.env`
     - `frontend/.env`

3. **Network:**

   - Testnet: Amoy (chain ID: 80002)
   - Mainnet: Polygon (chain ID: 137)

4. **Gas Fees:**
   - Cần MATIC trong deployer wallet
   - Testnet: Lấy từ faucet
   - Mainnet: Phải mua

---

## 🐛 Troubleshooting

**❌ "Insufficient funds":**

- Get testnet MATIC: https://faucet.polygon.technology/

**❌ "Invalid private key":**

- Đảm bảo 64 chars, NO `0x` prefix
- Check trong `.env` file

**❌ "Contract verification failed":**

- Wait 1-2 phút sau deploy
- Re-run `verify.js`
- Check POLYGONSCAN_API_KEY

**❌ "key.format is not a function":**

- ethers.js version conflict
- Đảm bảo dùng ethers v6

---

Generated: November 22, 2025
