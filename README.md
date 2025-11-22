# 🎫 NFT Event Ticketing Platform

Nền tảng bán vé sự kiện dựa trên công nghệ NFT và Blockchain trên mạng Polygon.

## ✨ Tính Năng

- 🎟️ **NFT Tickets** - Vé sự kiện dưới dạng ERC-1155 tokens
- 🔐 **Bảo Mật** - Xác minh quyền sở hữu vé qua blockchain
- 🎨 **Giao Diện Hiện Đại** - Vue.js 3 với Naive UI
- 💳 **Thanh Toán Crypto** - Mua vé bằng MATIC
- 📱 **QR Codes** - Check-in dễ dàng với mã QR
- 🛡️ **Chống Giả Mạo** - Ngăn chặn vé giả
- 📊 **Thống Kê** - Số liệu sự kiện real-time
- 👨‍💼 **Dashboard Tổ Chức** - Quản lý sự kiện và vé

## 🏗️ Cấu Trúc Dự Án

```
Ticket_Sales_BlockChain/
├── blockchain/          # Smart contracts (Hardhat)
│   ├── contracts/      # Solidity contracts
│   ├── scripts/        # Deploy & verify scripts
│   └── test/           # Contract tests
├── backend/            # Express.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── scripts/        # Maintenance scripts
├── frontend/           # Vue.js 3 application
│   └── src/
│       ├── components/
│       ├── views/
│       ├── stores/
│       └── router/
└── docs/               # Documentation
```

## 🚀 Cài Đặt Nhanh

### Yêu Cầu

- Node.js >= 18.x
- MongoDB >= 6.0
- MetaMask browser extension

### 1. Clone & Install

### 1. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd Ticket_Sales_BlockChain

# Install tất cả dependencies
npm run install:all
```

### 2. Cấu Hình Environment

```bash
# Blockchain
cd blockchain
cp .env.example .env
# Điền DEPLOYER_PRIVATE_KEY và POLYGONSCAN_API_KEY

# Backend
cd ../backend
cp .env.example .env
# Điền MONGODB_URI, CONTRACT_ADDRESS, PINATA keys

# Frontend
cd ../frontend
cp .env.example .env
# Điền CONTRACT_ADDRESS
```

### 3. Deploy Smart Contract (Amoy Testnet)

```bash
cd blockchain
npm run compile
npm run deploy:amoy
# Copy CONTRACT_ADDRESS vào backend/.env và frontend/.env
```

### 4. Khởi Động Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Truy cập: http://localhost:5173

## 🌐 Mạng Blockchain

### Polygon Amoy Testnet (Khuyên Dùng)

- **Chain ID:** 80002
- **RPC:** https://rpc-amoy.polygon.technology
- **Explorer:** https://amoy.polygonscan.com
- **Faucet:** https://faucet.polygon.technology

### Polygon Mainnet

- **Chain ID:** 137
- **RPC:** https://polygon-rpc.com
- **Explorer:** https://polygonscan.com

## 🛠️ Tech Stack

### Blockchain

- **Solidity** 0.8.20
- **Hardhat** - Development framework
- **OpenZeppelin Contracts** - Secure smart contracts
- **Polygon Amoy** - Testnet
- **ERC-1155** - Multi-token standard

### Backend

- **Node.js** + Express.js
- **MongoDB** + Mongoose
- **Ethers.js** v6 - Blockchain interaction
- **Pinata** - IPFS storage
- **JWT** - Authentication
- **QRCode** - QR code generation

### Frontend

- **Vue.js 3** (Composition API)
- **Vite** - Build tool
- **Pinia** - State management
- **Naive UI** - Component library
- **Ethers.js** - Web3 integration
- **Tailwind CSS** - Styling
- **Font Awesome** - Icons

## 📝 Scripts Hữu Ích

### Root Level

```bash
npm run install:all      # Install tất cả dependencies
npm run dev:backend      # Chạy backend
npm run dev:frontend     # Chạy frontend
npm run deploy:amoy      # Deploy contract lên Amoy
```

### Backend Scripts

```bash
node scripts/sync-blockchain-full.js      # Đồng bộ blockchain → database
node scripts/sync-total-tickets-sold.js   # Cập nhật số vé đã bán
node scripts/check-events.js              # Kiểm tra events
node scripts/upload-local-images.js       # Upload ảnh lên IPFS
```

Xem thêm: [backend/scripts/README.md](./backend/scripts/README.md)

## 🔧 Cấu Hình Environment

### blockchain/.env

```env
DEPLOYER_PRIVATE_KEY=your_64_char_private_key_without_0x
POLYGONSCAN_API_KEY=your_polygonscan_api_key
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
CONTRACT_ADDRESS=deployed_contract_address
```

### backend/.env

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nft-ticketing
JWT_SECRET=your_secret_min_32_chars
CONTRACT_ADDRESS=deployed_contract_address
CHAIN_ID=80002
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PINATA_JWT=your_pinata_jwt
FRONTEND_URL=http://localhost:5173
```

### frontend/.env

```env
VITE_API_URL=http://localhost:5000/api
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_CHAIN_ID=80002
VITE_RPC_URL=https://rpc-amoy.polygon.technology
```

## 🧪 Testing

```bash
# Smart contracts
cd blockchain
npm test

# Backend (nếu có tests)
cd backend
npm test
```

## 🔐 Bảo Mật

- ✅ OpenZeppelin audited contracts
- ✅ Role-based access control (ADMIN_ROLE)
- ✅ Reentrancy protection
- ✅ Rate limiting (API)
- ✅ JWT authentication
- ✅ Input validation
- ✅ CORS protection
- ✅ QR code signature verification

## 📚 Documentation

Xem thêm chi tiết trong folder `docs/`:

- [Installation Guide](./docs/INSTALLATION.md)
- [Startup Guide](./STARTUP_GUIDE.md)

## 🤝 Contributing

Contributions are welcome! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - xem file [LICENSE](./LICENSE)

## ⚠️ Lưu Ý Quan Trọng

1. **KHÔNG commit** `.env` files vào Git
2. **Backup** private keys và mnemonics
3. **Test kỹ** trên testnet trước khi deploy mainnet
4. **Audit** smart contracts trước khi production
5. **Rotate** API keys định kỳ
6. **Monitor** blockchain events và database sync

## 🐛 Troubleshooting

### Vé không hiển thị đủ?

```bash
cd backend
node scripts/sync-blockchain-full.js
```

### totalTicketsSold không đúng?

```bash
cd backend
node scripts/sync-total-tickets-sold.js
```

### QR Code không hiển thị?

- Kiểm tra backend logs
- Verify JWT_SECRET trong .env
- Restart backend server

### Không kết nối được MetaMask?

- Kiểm tra CHAIN_ID (80002 cho Amoy)
- Switch network trong MetaMask
- Có đủ MATIC trong ví

---

**⭐ Star repo này nếu hữu ích!**

**📧 Contact:** nguyenthanhluu2611@gmail.com
