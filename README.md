# 🎫 NFT Event Ticketing Platform

A complete blockchain-based event ticketing platform using NFT technology on Polygon network.

## ✨ Features

- 🎟️ **NFT Tickets** - Event tickets as ERC-1155 tokens
- 🔐 **Secure** - Blockchain-verified ticket ownership
- 🎨 **Modern UI** - Beautiful Vue.js 3 interface
- 💳 **Crypto Payments** - Purchase tickets with MATIC
- 📱 **QR Codes** - Easy check-in with QR code scanning
- 🛡️ **Anti-Counterfeit** - Prevent fake tickets
- 📊 **Analytics** - Real-time event statistics
- 👨‍💼 **Organizer Dashboard** - Manage events and tickets

## 🏗️ Project Structure

```
nft-ticketing-platform/
├── blockchain/          # Smart contracts & deployment
├── backend/             # Express.js API server
├── frontend/            # Vue.js 3 application
└── docs/                # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.0
- MetaMask browser extension
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd nft-ticketing-platform
```

### 2. Setup Blockchain

```bash
cd blockchain
npm install
cp .env.example .env
# Edit .env with your keys
npm run compile
npm run deploy:mumbai
```

### 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with MongoDB URI, contract address, etc.
npm run dev
```

### 4. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API URL and contract address
npm run dev
```

## 📖 Documentation

- [Smart Contract Documentation](./docs/SMART_CONTRACT.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Architecture](./docs/ARCHITECTURE.md)

## 🛠️ Tech Stack

### Blockchain

- Solidity ^0.8.20
- Hardhat
- OpenZeppelin Contracts
- Polygon Mumbai/Mainnet

### Backend

- Node.js + Express
- MongoDB + Mongoose
- Ethers.js
- Pinata (IPFS)
- JWT Authentication

### Frontend

- Vue.js 3 (Composition API)
- Vite
- Pinia
- Naive UI
- Ethers.js
- Tailwind CSS

## 🌐 Networks

### Testnet (Mumbai)

- Chain ID: 80001
- RPC: https://rpc-mumbai.maticvigil.com
- Explorer: https://mumbai.polygonscan.com
- Faucet: https://faucet.polygon.technology

### Mainnet (Polygon)

- Chain ID: 137
- RPC: https://polygon-rpc.com
- Explorer: https://polygonscan.com

## 📝 Environment Variables

### Blockchain

```env
DEPLOYER_PRIVATE_KEY=your_private_key
ALCHEMY_API_KEY=your_alchemy_key
POLYGONSCAN_API_KEY=your_polygonscan_key
```

### Backend

```env
MONGODB_URI=mongodb://localhost:27017/nft-ticketing
JWT_SECRET=your_jwt_secret
CONTRACT_ADDRESS=deployed_contract_address
PINATA_API_KEY=your_pinata_key
```

### Frontend

```env
VITE_API_URL=http://localhost:5000/api
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_CHAIN_ID=80001
```

## 🧪 Testing

### Smart Contracts

```bash
cd blockchain
npm test
npm run coverage
```

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm run test
```

## 📦 Deployment

### Smart Contract

```bash
cd blockchain
npm run deploy:polygon
npm run verify:polygon
```

### Backend

Deploy to VPS, AWS, or DigitalOcean

### Frontend

Deploy to Vercel or Netlify

## 🔐 Security Features

- ✅ OpenZeppelin audited contracts
- ✅ Role-based access control
- ✅ Reentrancy protection
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ Input validation
- ✅ CORS protection

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see LICENSE file for details

## 👥 Authors

Your Name - [@yourhandle](https://twitter.com/yourhandle)

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contracts
- Polygon for scalable blockchain infrastructure
- Pinata for IPFS storage

## 📞 Support

For support, email support@example.com or join our Discord server.

---

**⭐ Star this repo if you find it helpful!**
