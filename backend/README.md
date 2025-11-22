# NFT Ticketing Platform - Backend

Express.js API server for the NFT Event Ticketing Platform.

## 📁 Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # MongoDB models
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── .env.example
└── package.json
```

## 🚀 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Update environment variables:

- Set MongoDB URI
- Set blockchain contract address
- Set Pinata API keys
- Set JWT secrets

## 📦 Development

```bash
npm run dev
```

## 🏭 Production

```bash
npm start
```

## 📚 API Documentation

### Authentication

- `POST /api/auth/login` - Login with wallet signature
- `GET /api/auth/nonce/:address` - Get nonce for signing
- `GET /api/auth/me` - Get current user

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event
- `GET /api/events/:id/stats` - Get event statistics

### Tickets

- `POST /api/tickets/sync` - Sync ticket purchase
- `GET /api/tickets/my-tickets` - Get user's tickets
- `GET /api/tickets/verify/:tokenId` - Verify ticket
- `POST /api/tickets/checkin` - Check-in ticket
- `GET /api/tickets/:tokenId` - Get ticket details

### Users

- `GET /api/users/:address` - Get user profile
- `PUT /api/users/:address` - Update profile
- `GET /api/users/:address/tickets` - Get user tickets
- `GET /api/users/:address/events` - Get user events

### Admin

- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/users` - All users
- `GET /api/admin/transactions` - All transactions

## 🔐 Authentication

All protected routes require JWT token in header:

```
Authorization: Bearer <token>
```

## 📝 License

MIT
