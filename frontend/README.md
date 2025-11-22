# NFT Ticketing Platform - Frontend

Vue.js 3 frontend application for the NFT Event Ticketing Platform.

## 🚀 Installation

```bash
cd frontend
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Update environment variables:

- Set API URL
- Set contract address (after blockchain deployment)
- Set chain ID

## 📦 Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🏭 Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── assets/         # Static files
│   ├── components/     # Reusable components
│   ├── views/          # Page components
│   ├── composables/    # Composition API functions
│   ├── stores/         # Pinia state management
│   ├── router/         # Vue Router config
│   ├── utils/          # Helper functions
│   ├── App.vue
│   └── main.js
├── index.html
├── vite.config.js
└── package.json
```

## 🔑 Key Features

- ✅ Wallet connection (MetaMask)
- ✅ Browse events
- ✅ Purchase tickets (NFT)
- ✅ View owned tickets
- ✅ QR code generation
- ✅ Responsive design

## 📚 Tech Stack

- Vue 3 (Composition API)
- Vite
- Pinia (State Management)
- Vue Router
- Naive UI
- Ethers.js
- Tailwind CSS

## 📝 License

MIT
