# Installation Guide

This guide will walk you through setting up the complete NFT Ticketing Platform.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **MongoDB** >= 6.0 ([Download](https://www.mongodb.com/try/download/community))
- **MetaMask** browser extension ([Install](https://metamask.io/))
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Ticket_Sales_BlockChain
```

### 2. Blockchain Setup

```bash
cd blockchain
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DEPLOYER_PRIVATE_KEY=your_metamask_private_key
ALCHEMY_API_KEY=your_alchemy_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY
```

**Get Required Keys:**

1. **Private Key**: Export from MetaMask (⚠️ Never share this!)
2. **Alchemy API Key**: Sign up at [alchemy.com](https://www.alchemy.com/)
3. **PolygonScan API Key**: Get from [polygonscan.com](https://polygonscan.com/)

Compile and deploy:

```bash
npm run compile
npm run test
npm run deploy:mumbai
```

**Save the contract address!** You'll need it for backend and frontend.

### 3. Backend Setup

```bash
cd ../backend
npm install
```

Create `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/nft-ticketing

# JWT
JWT_SECRET=your_super_secret_key_min_32_characters_long
JWT_EXPIRE=7d

# Blockchain
CONTRACT_ADDRESS=your_deployed_contract_address_from_step_2
ALCHEMY_API_KEY=your_alchemy_api_key
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY
CHAIN_ID=80001

# IPFS/Pinata
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Get Pinata Keys:**

1. Sign up at [pinata.cloud](https://www.pinata.cloud/)
2. Go to API Keys and create new key
3. Copy API Key, Secret, and JWT

**Copy Contract ABI:**
After deploying the contract, copy the ABI:

```bash
# From blockchain folder
cp artifacts/contracts/TicketNFT.sol/TicketNFT.json ../backend/src/config/contractABI.json
```

Start MongoDB:

```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

Start backend:

```bash
npm run dev
```

Backend should be running on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_APP_NAME=NFT Ticketing Platform
VITE_API_URL=http://localhost:5000/api
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_CHAIN_ID=80001
VITE_RPC_URL=https://rpc-mumbai.maticvigil.com
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

**Copy Contract ABI:**

```bash
# From blockchain folder
cp artifacts/contracts/TicketNFT.sol/TicketNFT.json ../frontend/src/utils/contractABI.json
```

Start frontend:

```bash
npm run dev
```

Frontend should be running on `http://localhost:5173`

### 5. Setup MetaMask

1. Install MetaMask extension
2. Create or import wallet
3. Add Mumbai Testnet:

   - Network Name: `Polygon Mumbai`
   - RPC URL: `https://rpc-mumbai.maticvigil.com`
   - Chain ID: `80001`
   - Currency Symbol: `MATIC`
   - Block Explorer: `https://mumbai.polygonscan.com`

4. Get test MATIC from faucet:
   - Visit [faucet.polygon.technology](https://faucet.polygon.technology/)
   - Paste your wallet address
   - Request test MATIC

### 6. Test the Application

1. Open `http://localhost:5173`
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Browse events
5. Try purchasing a ticket

## Common Issues

### "Cannot connect to MongoDB"

- Ensure MongoDB is running
- Check connection string in `.env`

### "Insufficient funds"

- Get test MATIC from faucet
- Make sure you're on Mumbai testnet

### "Contract not found"

- Verify contract address in `.env` files
- Ensure contract is deployed

### "IPFS upload failed"

- Check Pinata API keys
- Verify internet connection

## Next Steps

1. Create test events using admin panel
2. Test ticket purchase flow
3. Test QR code check-in
4. Deploy to production when ready

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

## Support

If you encounter issues:

1. Check the logs in terminal
2. Verify all environment variables
3. Ensure all services are running
4. Check MongoDB connection

## Useful Commands

```bash
# Blockchain
cd blockchain
npm run compile      # Compile contracts
npm test            # Run tests
npm run deploy:mumbai  # Deploy to testnet

# Backend
cd backend
npm run dev         # Start development server
npm test            # Run tests

# Frontend
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
```
