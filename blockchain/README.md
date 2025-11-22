# NFT Ticketing Platform - Smart Contracts

This directory contains the Solidity smart contracts and deployment scripts for the NFT Event Ticketing Platform.

## 📁 Structure

```
blockchain/
├── contracts/
│   └── TicketNFT.sol          # Main ERC-1155 contract
├── scripts/
│   ├── deploy.js              # Deployment script
│   ├── verify.js              # Contract verification
│   └── setup-events.js        # Create test events
├── test/
│   └── TicketNFT.test.js      # Contract tests
├── hardhat.config.js          # Hardhat configuration
└── package.json
```

## 🚀 Installation

```bash
cd blockchain
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in your environment variables:

```env
DEPLOYER_PRIVATE_KEY=your_private_key_here
ALCHEMY_API_KEY=your_alchemy_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY
```

## 🧪 Testing

Run all tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests with gas reporting:

```bash
npm run test:gas
```

## 📦 Compilation

Compile contracts:

```bash
npm run compile
```

## 🚀 Deployment

### Deploy to Mumbai Testnet

```bash
npm run deploy:mumbai
```

### Deploy to Polygon Mainnet

```bash
npm run deploy:polygon
```

### Verify Contract

After deployment:

```bash
npm run verify:mumbai
```

### Setup Test Events

```bash
# Update .env with CONTRACT_ADDRESS first
npm run setup-events
```

## 📝 Contract Features

### TicketNFT.sol

- **Standard**: ERC-1155 Multi-Token
- **Access Control**: Role-based (Admin, Organizer, Minter)
- **Security**: Pausable, ReentrancyGuard, OpenZeppelin audited

#### Main Functions:

**Event Management:**

- `createEvent()` - Create new event
- `updateEventStatus()` - Enable/disable event

**Ticket Management:**

- `createTicketType()` - Create ticket types (VIP, Regular, etc.)
- `purchaseTicket()` - Buy tickets with MATIC
- `checkInTicket()` - Mark ticket as used

**Admin Functions:**

- `withdraw()` - Withdraw contract balance
- `pause()/unpause()` - Emergency controls
- `setURI()` - Update metadata base URI

## 🔐 Security Features

- ✅ OpenZeppelin contracts
- ✅ Role-based access control
- ✅ Reentrancy protection
- ✅ Pausable mechanism
- ✅ Supply management
- ✅ Time-based sale controls

## 📊 Gas Estimates

| Function         | Estimated Gas     |
| ---------------- | ----------------- |
| createEvent      | ~150,000          |
| createTicketType | ~120,000          |
| purchaseTicket   | ~80,000 - 120,000 |
| checkInTicket    | ~50,000           |

## 🌐 Networks

### Mumbai Testnet

- Chain ID: 80001
- RPC: https://rpc-mumbai.maticvigil.com
- Explorer: https://mumbai.polygonscan.com
- Faucet: https://faucet.polygon.technology

### Polygon Mainnet

- Chain ID: 137
- RPC: https://polygon-rpc.com
- Explorer: https://polygonscan.com

## 📚 Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [ERC-1155 Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [Polygon Documentation](https://docs.polygon.technology)

## 🐛 Troubleshooting

### "Insufficient funds" error

Make sure your wallet has enough MATIC for gas fees. Get testnet MATIC from the faucet.

### "Nonce too high" error

Reset your MetaMask account: Settings > Advanced > Reset Account

### Verification fails

Wait a few minutes after deployment before running verification.

## 📄 License

MIT
