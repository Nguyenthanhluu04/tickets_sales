đây là một số yêu cầu cơ bảng ### **DỰ ÁN: NỀN TẢNG BÁN VÉ SỰ KIỆN BẰNG NFT**

Đây là kế hoạch triển khai cho dự án bán vé NFT của chúng ta. Mục tiêu là xây dựng một hệ thống cho phép người dùng mua vé (dưới dạng NFT) cho các sự kiện, sử dụng React (Frontend), Node.js (Backend), và Smart Contract (Blockchain).

Để làm việc hiệu quả, chúng ta sẽ chia dự án thành **5 giai đoạn**. Các giai đoạn này có thể gối đầu lên nhau, nhưng **kết quả đầu ra** của giai đoạn trước là **điều kiện bắt buộc** cho giai đoạn sau.

---

### **GIAI ĐOẠN 1: BLOCKCHAIN (SMART CONTRACT) - "NỀN MÓNG"**

**Mục tiêu:** Tạo ra "hợp đồng thông minh" (vé) trên blockchain. Đây là phần lõi, lưu trữ quyền sở hữu vé.

**Người phụ trách:** Blockchain Dev.

**Nhiệm vụ:**

1.  **Thiết lập môi trường:** Dùng **Hardhat** làm môi trường phát triển.
2.  **Viết Contract:**
    - Sử dụng tiêu chuẩn **ERC-1155** (từ thư viện OpenZeppelin) để cho phép tạo nhiều loại vé (VIP, Thường) trong cùng một contract.
    - Viết hàm `mintTicket(to_address, ticket_type_id, amount)`: Cho phép "đúc" vé cho người mua.
    - Viết hàm `uri(ticket_type_id)`: Hàm này sẽ trả về link metadata (ở Giai đoạn 2) cho loại vé tương ứng.
3.  **Kiểm thử (Test):** Viết kịch bản test (Unit Test) cho tất cả các hàm (mint, chuyển vé, đọc URI...) trên mạng "giả" của Hardhat.
4.  **Triển khai (Deploy):** Triển khai contract lên mạng **Testnet** (ví dụ: Polygon Mumbai).

**✅ Kết quả đầu ra (Cung cấp cho Team):**

1.  **Contract Address (Địa chỉ Hợp đồng):** Link của contract trên Testnet.
2.  **File ABI (Application Binary Interface):** File `...json` mô tả cách Frontend có thể "nói chuyện" với contract này.

---

### **GIAI ĐOẠN 2: TÀI SẢN SỐ (IPFS) - "LINH HỒN CỦA VÉ"**

**Mục tiêu:** Chuẩn bị hình ảnh, mô tả cho vé và lưu trữ chúng vĩnh viễn.

**Người phụ trách:** Backend Dev / Designer.

**Nhiệm vụ:**

1.  **Thiết kế:** Tạo các file hình ảnh (PNG/JPG) cho từng loại vé (ví dụ: `vip.png`, `thuong.png`).
2.  **Lưu trữ Ảnh:** Tải các file ảnh này lên **IPFS** (sử dụng dịch vụ như **Pinata.cloud**). Lấy về các link **IPFS Image URL**.
3.  **Tạo Metadata:** Tạo các file `...json` (ví dụ: `vip.json`, `thuong.json`) theo chuẩn NFT.
    - _Ví dụ file `vip.json`:_
      ```json
      {
        "name": "Vé VIP Sự kiện X",
        "description": "Vé hạng sang nhất.",
        "image": "ipfs://...URL_hinh_anh_vip_o_buoc_2"
      }
      ```
4.  **Lưu trữ Metadata:** Tải các file `.json` này lên IPFS (Pinata).

**✅ Kết quả đầu ra (Cung cấp cho Team):**

1.  **Danh sách các link Metadata (IPFS URL):** Ví dụ: `ipfs://.../vip.json`, `ipfs://.../thuong.json`.
    - _Lưu ý:_ Blockchain Dev (Giai đoạn 1) sẽ cần các link này để "trỏ" Smart Contract đến đúng metadata.

---

### **GIAI ĐOẠN 3: BACKEND (NODE.JS) - "MÁY CHỦ DỮ LIỆU"**

**Mục tiêu:** Xây dựng một API để cung cấp thông tin "Web 2.0" (tên sự kiện, ngày giờ, mô tả) cho Frontend.

**Người phụ trách:** Backend Dev.

**Nhiệmvụ:**

1.  **Thiết lập Server:** Dựng server **Express.js** và kết nối Database (MongoDB/PostgreSQL).
2.  **Thiết kế Database (Schema):** Tạo schema cho `Events` (Sự kiện).
    - _Các trường quan trọng:_ `name`, `description`, `date`, `location`.
    - _Trường nâng cao:_ Cần một mảng (array) `ticket_types` (loại vé) để map thông tin vé với Smart Contract, ví dụ:
      `[{ "name": "VIP", "price": 100, "ticketTypeId": 1 }, { "name": "Thường", "price": 50, "ticketTypeId": 2 }]`
3.  **Xây dựng API Endpoints:**
    - `GET /api/events`: Trả về danh sách tất cả sự kiện.
    - `GET /api/events/:id`: Trả về thông tin chi tiết của 1 sự kiện (bao gồm các loại vé của nó).

**✅ Kết quả đầu ra (Cung cấp cho Team):**

1.  **API Documentation (Swagger/Postman):** Tài liệu mô tả cách gọi các API.
2.  **Base URL (Test):** Link API server (ví dụ: `https://api-test.duan.com`) để Frontend có thể bắt đầu gọi.

---

### **GIAI ĐOẠN 4: FRONTEND (REACT) - "GIAO DIỆN TƯƠNG TÁC"**

**Mục tiêu:** Xây dựng giao diện cho người dùng xem sự kiện, kết nối ví và mua vé.

**Người phụ trách:** Frontend Dev.

**Nhiệm vụ:**

1.  **Thiết lập Dự án:** Dùng Vite hoặc Create React App.
2.  **Cài đặt Thư viện:** Cài đặt **`wagmi`** và **`ethers.js`** (đây là các thư viện Web3 mạnh nhất hiện nay).
3.  **Xây dựng Giao diện (UI):**
    - Tạo trang `EventList` (danh sách sự kiện): Gọi `GET /api/events` (từ Giai đoạn 3) để hiển thị.
    - Tạo trang `EventDetail` (chi tiết sự kiện): Gọi `GET /api/events/:id` (từ Giai đoạn 3).
4.  **Tích hợp Web3 (Phần quan trọng):**
    - **Nút Connect Wallet:** Dùng hook `useConnect` của `wagmi` để cho phép người dùng kết nối MetaMask.
    - **Logic Mua vé:**
      - Khi người dùng nhấn "Mua vé", sử dụng hook `useContractWrite` của `wagmi`.
      - Cấu hình hook này với:
        - **`address`**: Contract Address (từ Giai đoạn 1).
        - **`abi`**: File ABI (từ Giai đoạn 1).
        - **`functionName`**: `'mintTicket'`.
        - **`args`**: `[dia_chi_nguoi_mua, ticket_type_id, so_luong]` (lấy từ thông tin sự kiện của Giai đoạn 3).
5.  **(Tùy chọn) Trang "Vé của tôi":** Dùng hook `useContractRead` để đọc số dư vé (`balanceOf`) của người dùng từ Smart Contract.

**✅ Kết quả đầu ra (Cung cấp cho Team):**

1.  Một ứng dụng web (đã deploy lên Vercel/Netlify) để cả team kiểm thử.

---

### **GIAI ĐOẠN 5: TÍCH HỢP VÀ KIỂM THỬ TOÀN LUỒNG**

**Mục tiêu:** Đảm bảo mọi thứ hoạt động trơn tru từ đầu đến cuối.

**Người phụ trách:** Cả Team.

**Luồng kiểm thử (Test flow):**

1.  **FE** gọi **BE** lấy thông tin sự kiện A thành công.
2.  **FE** hiển thị nút "Mua vé VIP" (giá 10 MATIC) cho sự kiện A.
3.  Người dùng nhấn "Mua vé", MetaMask bật lên.
4.  Giao dịch thành công trên **Testnet** (Polygon Mumbai).
5.  Kiểm tra Etherscan (hoặc OpenSea Testnet) xem người dùng đã thực sự nhận được NFT chưa.
6.  Kiểm tra xem NFT đó có hiển thị đúng hình ảnh (từ **IPFS** - Giai đoạn 2) không.

---

### **NGUYÊN TẮC LÀM VIỆC**

- **Communicate (Giao tiếp):** FE cần **ABI** và **Address** từ Blockchain Dev. FE cần **API Docs** từ Backend Dev. Hãy cung cấp ngay khi có.
- **Testnet là Vua:** Mọi thứ phải chạy ổn định trên **Testnet** trước khi nghĩ đến Mainnet (chạy thật).
- **Bảo mật:** Blockchain Dev chịu trách nhiệm cao nhất về bảo mật contract. Kiểm tra kỹ lỗi (ví dụ: reentrancy) và sử dụng thư viện OpenZeppelin chuẩn.

🎫 DỰ ÁN NỀN TẢNG BÁN VÉ SỰ KIỆN BẰNG NFT
📋 MỤC TIÊU DỰ ÁN
Xây dựng nền tảng phân phối vé sự kiện dưới dạng NFT, cho phép:

Người tổ chức tạo sự kiện và phát hành vé
Người dùng mua vé bằng cryptocurrency
Xác thực vé khi check-in
Ngăn chặn vé giả và giao dịch gian lận

🏗️ CẤU TRÚC DỰ ÁN
nft-ticketing-platform/
│
├── blockchain/ # Smart Contracts & Deployment
│ ├── contracts/
│ │ ├── TicketNFT.sol # Main ERC-1155 contract
│ │ └── libraries/
│ │ └── EventLib.sol # Helper library
│ ├── scripts/
│ │ ├── deploy.js
│ │ ├── verify.js
│ │ └── setup-events.js
│ ├── test/
│ │ ├── TicketNFT.test.js
│ │ └── integration.test.js
│ ├── hardhat.config.js
│ ├── .env.example
│ └── package.json
│
├── backend/ # Express.js API Server
│ ├── src/
│ │ ├── config/
│ │ │ ├── database.js # MongoDB config
│ │ │ ├── blockchain.js # Web3 provider setup
│ │ │ └── ipfs.js # Pinata configuration
│ │ │
│ │ ├── models/ # Database schemas
│ │ │ ├── User.js
│ │ │ ├── Event.js
│ │ │ ├── Ticket.js
│ │ │ ├── Transaction.js
│ │ │ └── CheckInLog.js
│ │ │
│ │ ├── controllers/ # Business logic
│ │ │ ├── authController.js
│ │ │ ├── eventController.js
│ │ │ ├── ticketController.js
│ │ │ ├── userController.js
│ │ │ └── adminController.js
│ │ │
│ │ ├── services/ # External integrations
│ │ │ ├── blockchainService.js
│ │ │ ├── ipfsService.js
│ │ │ ├── eventListenerService.js
│ │ │ ├── emailService.js
│ │ │ └── qrCodeService.js
│ │ │
│ │ ├── routes/ # API endpoints
│ │ │ ├── auth.js
│ │ │ ├── events.js
│ │ │ ├── tickets.js
│ │ │ ├── users.js
│ │ │ └── admin.js
│ │ │
│ │ ├── middleware/
│ │ │ ├── auth.js # JWT verification
│ │ │ ├── errorHandler.js
│ │ │ ├── validator.js # Request validation
│ │ │ └── rateLimiter.js
│ │ │
│ │ ├── utils/
│ │ │ ├── logger.js
│ │ │ └── helpers.js
│ │ │
│ │ └── server.js # Entry point
│ │
│ ├── .env.example
│ ├── .gitignore
│ └── package.json
│
├── frontend/ # Vue.js 3 Application
│ ├── public/
│ │ ├── favicon.ico
│ │ └── index.html
│ │
│ ├── src/
│ │ ├── assets/ # Static files
│ │ │ ├── images/
│ │ │ └── styles/
│ │ │ └── main.css
│ │ │
│ │ ├── components/ # Reusable components
│ │ │ ├── common/
│ │ │ │ ├── Navbar.vue
│ │ │ │ ├── Footer.vue
│ │ │ │ ├── Loading.vue
│ │ │ │ └── ErrorModal.vue
│ │ │ │
│ │ │ ├── wallet/
│ │ │ │ ├── ConnectWallet.vue
│ │ │ │ └── WalletInfo.vue
│ │ │ │
│ │ │ ├── event/
│ │ │ │ ├── EventCard.vue
│ │ │ │ ├── EventFilter.vue
│ │ │ │ └── CreateEventForm.vue
│ │ │ │
│ │ │ └── ticket/
│ │ │ ├── TicketCard.vue
│ │ │ ├── PurchaseModal.vue
│ │ │ ├── TicketQRCode.vue
│ │ │ └── TicketDetails.vue
│ │ │
│ │ ├── views/ # Page components
│ │ │ ├── Home.vue
│ │ │ ├── EventList.vue
│ │ │ ├── EventDetail.vue
│ │ │ ├── MyTickets.vue
│ │ │ ├── Profile.vue
│ │ │ ├── CheckIn.vue
│ │ │ └── admin/
│ │ │ ├── Dashboard.vue
│ │ │ ├── CreateEvent.vue
│ │ │ ├── ManageEvents.vue
│ │ │ └── Analytics.vue
│ │ │
│ │ ├── composables/ # Vue 3 Composition API
│ │ │ ├── useWeb3.js # Wallet connection
│ │ │ ├── useContract.js # Smart contract interaction
│ │ │ ├── useTickets.js # Ticket operations
│ │ │ └── useAuth.js # Authentication
│ │ │
│ │ ├── stores/ # Pinia state management
│ │ │ ├── wallet.js
│ │ │ ├── user.js
│ │ │ ├── events.js
│ │ │ └── tickets.js
│ │ │
│ │ ├── router/
│ │ │ └── index.js # Vue Router config
│ │ │
│ │ ├── utils/
│ │ │ ├── constants.js
│ │ │ ├── contractABI.json
│ │ │ └── helpers.js
│ │ │
│ │ ├── App.vue
│ │ └── main.js
│ │
│ ├── .env.example
│ ├── vite.config.js
│ └── package.json
│
├── ipfs-assets/ # Metadata templates
│ ├── images/
│ │ ├── ticket-templates/
│ │ └── event-banners/
│ └── metadata/
│ └── template.json
│
├── docs/ # Documentation
│ ├── API.md
│ ├── SMART_CONTRACT.md
│ ├── DEPLOYMENT.md
│ ├── USER_GUIDE.md
│ └── ARCHITECTURE.md
│
├── .gitignore
└── README.md

📦 YÊU CẦU CÔNG NGHỆ

1. Blockchain Layer
   json{
   "blockchain": {
   "network": "Polygon Mumbai Testnet (sau chuyển sang Mainnet)",
   "standard": "ERC-1155",
   "tools": {
   "hardhat": "^2.19.0",
   "@openzeppelin/contracts": "^5.0.0",
   "@nomicfoundation/hardhat-toolbox": "^4.0.0",
   "ethers": "^6.10.0"
   }
   }
   }
2. Backend (Node.js + Express)
   json{
   "dependencies": {
   "express": "^4.18.0",
   "mongoose": "^8.0.0",
   "ethers": "^6.10.0",
   "@pinata/sdk": "^2.1.0",
   "jsonwebtoken": "^9.0.0",
   "bcryptjs": "^2.4.3",
   "dotenv": "^16.3.0",
   "cors": "^2.8.5",
   "helmet": "^7.1.0",
   "express-rate-limit": "^7.1.0",
   "joi": "^17.11.0",
   "winston": "^3.11.0",
   "qrcode": "^1.5.0",
   "nodemailer": "^6.9.0"
   }
   }
3. Frontend (Vue.js 3)
   json{
   "dependencies": {
   "vue": "^3.4.0",
   "vue-router": "^4.2.0",
   "pinia": "^2.1.0",
   "viem": "^2.0.0",
   "@wagmi/vue": "^2.0.0",
   "@wagmi/core": "^2.0.0",
   "axios": "^1.6.0",
   "@vueuse/core": "^10.7.0",
   "naive-ui": "^2.38.0",
   "qrcode.vue": "^3.4.0"
   }
   }
4. Yêu cầu môi trường

Node.js >= 18.x
MongoDB >= 6.0 hoặc PostgreSQL >= 14
MetaMask Extension
Git
VS Code (khuyến nghị)

🚀 KẾ HOẠCH TRIỂN KHAI 5 GIAI ĐOẠN
PHASE 1: SMART CONTRACT (2 tuần)
Tuần 1: Phát triển Contract
Nhiệm vụ:

Setup Hardhat project
Viết TicketNFT.sol với các tính năng:

ERC-1155 Multi-Token
Role-based access (ADMIN, MINTER)
Event management (create, update)
Ticket types (VIP, Regular, Early Bird...)
Purchase với payment on-chain
Supply management (max supply, current supply)
Price management per ticket type
Withdrawal function
Event emissions
Tuần 2: Testing & Deployment
Nhiệm vụ:

Viết unit tests (coverage > 90%)
Integration tests
Deploy lên Mumbai Testnet
Verify contract trên PolygonScan
Document API contract

Deliverables:

✅ Smart contract đã deploy
✅ Contract address & ABI
✅ Test report
✅ Gas consumption report

PHASE 2: BACKEND CORE (2 tuần)
Tuần 1: Setup & Core Services
Nhiệm vụ:

Setup Express.js project
Database schema design & setup
JWT authentication
Blockchain service (connect to contract)
IPFS service (Pinata integration)
Database Schema:
javascript// models/User.js
const userSchema = new Schema({
walletAddress: { type: String, required: true, unique: true, lowercase: true },
email: String,
name: String,
role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'user' },
createdAt: { type: Date, default: Date.now }
});

// models/Event.js
const eventSchema = new Schema({
eventId: { type: Number, required: true, unique: true },
name: String,
description: String,
location: String,
startTime: Date,
endTime: Date,
bannerImage: String,
organizer: { type: String, ref: 'User' },
totalTicketsSold: { type: Number, default: 0 },
revenue: { type: String, default: '0' },
isActive: Boolean
});

// models/Ticket.js
const ticketSchema = new Schema({
tokenId: { type: String, required: true, unique: true },
eventId: Number,
ticketTypeId: Number,
owner: { type: String, ref: 'User' },
price: String,
metadataURI: String,
transactionHash: String,
isUsed: { type: Boolean, default: false },
checkedInAt: Date,
purchasedAt: { type: Date, default: Date.now }
});

// models/Transaction.js
const transactionSchema = new Schema({
transactionHash: { type: String, required: true, unique: true },
from: String,
to: String,
eventId: Number,
ticketTypeId: Number,
tokenId: String,
amount: String,
status: { type: String, enum: ['pending', 'confirmed', 'failed'] },
createdAt: { type: Date, default: Date.now }
});
Tuần 2: API Development
API Endpoints:
javascript// routes/auth.js
POST /api/auth/login // Login with wallet signature
POST /api/auth/register // Register new user
GET /api/auth/me // Get current user
POST /api/auth/refresh // Refresh JWT token

// routes/events.js
GET /api/events // List all events (public)
GET /api/events/:id // Get event details
POST /api/events // Create event (organizer/admin)
PUT /api/events/:id // Update event
DELETE /api/events/:id // Delete event
GET /api/events/:id/stats // Get event statistics

// routes/tickets.js
POST /api/tickets/purchase // Process ticket purchase (backend-controlled)
POST /api/tickets/sync // Sync on-chain purchase to DB
GET /api/tickets/verify/:tokenId // Verify ticket authenticity
POST /api/tickets/checkin // Check-in ticket
GET /api/tickets/my-tickets // Get user's tickets
GET /api/tickets/:tokenId // Get ticket details

// routes/users.js
GET /api/users/:address // Get user profile
PUT /api/users/:address // Update profile
GET /api/users/:address/tickets // Get user's tickets
GET /api/users/:address/events // Get user's organized events

// routes/admin.js
GET /api/admin/dashboard // Admin dashboard data
GET /api/admin/users // Manage users
GET /api/admin/transactions // View all transactions
POST /api/admin/withdraw // Withdraw contract balance
Core Services:
javascript// services/blockchainService.js

- connectToContract()
- getEventDetails(eventId)
- purchaseTicket(eventId, ticketTypeId, userAddress)
- verifyOwnership(tokenId, address)
- getTicketMetadata(tokenId)
- listenToEvents()

// services/ipfsService.js

- uploadImage(file)
- uploadMetadata(metadata)
- getMetadata(cid)

// services/eventListenerService.js

- listenTicketPurchased()
- listenTicketCheckedIn()
- syncToDatabase()
  Deliverables:

✅ RESTful API hoàn chỉnh
✅ JWT authentication
✅ Database models
✅ Blockchain integration
✅ API documentation

PHASE 3: FRONTEND CORE (2 tuần)
Tuần 1: Setup & Core Components
Nhiệm vụ:

Setup Vue 3 + Vite project
Configure Vue Router
Setup Pinia stores
Implement wallet connection (@wagmi/vue)
Create reusable components

Core Composables:
javascript// composables/useWeb3.js
export function useWeb3() {
const { address, isConnected } = useAccount()
const { connect, connectors } = useConnect()
const { disconnect } = useDisconnect()

const connectWallet = async () => {
// Connect MetaMask
}

return { address, isConnected, connectWallet, disconnect }
}

// composables/useContract.js
export function useContract() {
const contract = ref(null)

const purchaseTicket = async (eventId, ticketTypeId, price) => {
// Call smart contract
}

const getTicketDetails = async (tokenId) => {
// Fetch ticket info
}

return { purchaseTicket, getTicketDetails }
}
Tuần 2: Page Development
Pages cần phát triển:

Home.vue - Landing page với featured events
EventList.vue - Danh sách sự kiện với filter/search
EventDetail.vue - Chi tiết sự kiện + nút mua vé
MyTickets.vue - Danh sách vé đã mua (NFTs)
Profile.vue - Thông tin user
CheckIn.vue - Scan QR code để check-in

Deliverables:

✅ Responsive UI
✅ Wallet connection
✅ Event browsing
✅ Ticket purchase flow
✅ My Tickets page

PHASE 4: INTEGRATION (1 tuần)
Nhiệm vụ:

Kết nối Frontend - Backend
Kết nối Backend - Blockchain
Test end-to-end flows
Handle edge cases
Error handling & loading states
Transaction confirmation flows

Critical Flows to Test:

✅ User registration & login
✅ Browse events
✅ Purchase ticket (on-chain)
✅ View purchased tickets
✅ Generate QR code
✅ Check-in validation
✅ Transaction history

Deliverables:

✅ Fully integrated system
✅ E2E test results
✅ Bug fixes

PHASE 5: ADVANCED FEATURES (1-2 tuần)
Nhiệm vụ:

Admin dashboard với analytics
QR code generation & scanning
Check-in system
Email notifications
Transaction history
Secondary market (resale tickets)
Event statistics & reports

Admin Dashboard Features:

Tổng doanh thu
Số vé đã bán / còn lại
Biểu đồ bán vé theo thời gian
Danh sách người mua
Check-in statistics

Deliverables:

✅ Admin panel
✅ QR check-in
✅ Analytics dashboard
✅ Email system
✅ Production-ready app

🔐 YÊU CẦU BẢO MẬT

1. Smart Contract Security

✅ Use OpenZeppelin audited contracts
✅ Implement role-based access control
✅ Add pausable mechanism
✅ Reentrancy protection
✅ Input validation
✅ Audit contract before mainnet

2. Backend Security

✅ JWT with refresh tokens
✅ Rate limiting (100 req/15min)
✅ Helmet.js for headers
✅ Input validation (Joi)
✅ CORS configuration
✅ Environment variables
✅ HTTPS only
✅ Database connection encryption

3. Frontend Security

✅ XSS prevention
✅ CSRF protection
✅ Secure wallet connection
✅ Transaction confirmation
✅ Never store private keys

4. Private Key Management
   bash# .env (NEVER commit)
   DEPLOYER_PRIVATE_KEY=your_key_here
   BACKEND_WALLET_PRIVATE_KEY=your_key_here

```

**Best Practices:**
- Backend wallet chỉ giữ đủ MATIC cho gas fees
- Sử dụng hardware wallet cho admin operations
- Implement multi-sig cho withdrawal

---

## 📊 LUỒNG HOẠT ĐỘNG CHI TIẾT

### **Luồng 1: Organizer Tạo Sự Kiện**
```

1. Organizer login → Frontend
2. Fill event form (name, date, location, ticket types, prices)
3. Upload banner image
4. Frontend → Backend: POST /api/events/create
5. Backend:
   - Upload image to IPFS
   - Create metadata JSON
   - Upload metadata to IPFS
   - Call contract.createEvent()
   - Call contract.createTicketType() for each type
   - Save to database
6. Return: eventId, contract info, IPFS URIs
7. Frontend: Show success + redirect to event page

```

### **Luồng 2: User Mua Vé (On-chain)**
```

1. User browse events → Select event → Choose ticket type
2. Click "Buy Ticket"
3. Frontend shows price + gas estimate
4. User confirm → MetaMask popup
5. Frontend call: contract.purchaseTicket(eventId, ticketTypeId, {value: price})
6. Wait for transaction confirmation (show loading)
7. On success:
   - Frontend → Backend: POST /api/tickets/sync
   - Backend verify transaction on-chain
   - Save ticket to database
   - Generate QR code
8. Frontend: Show success + redirect to My Tickets
9. Email notification (optional)

```

### **Luồng 3: Check-in tại Sự Kiện**
```

1. Organizer/Staff open Check-in page
2. Scan QR code từ vé của user
3. QR code chứa: tokenId + signature
4. Frontend → Backend: GET /api/tickets/verify/:tokenId
5. Backend verify:
   - Token exists on-chain?
   - Belongs to correct event?
   - Not checked-in yet?
   - Signature valid?
6. If valid → POST /api/tickets/checkin
7. Backend:
   - Mark ticket as used in DB
   - (Optional) Call contract.checkIn()
8. Frontend: Show success ✅ / error ❌

⚠️ VẤN ĐỀ CẦN LƯU Ý

1. Gas Fees

Vấn đề: Mỗi transaction tốn phí
Giải pháp:

Sử dụng Polygon (phí ~$0.01)
Batch mint cho multiple tickets
Estimate gas trước khi purchase

2. Scalability

Vấn đề: 10,000 users mua cùng lúc
Giải pháp:

Implement queue system (Bull + Redis)
Rate limiting
Load balancer
Database indexing

3. User Experience

Vấn đề: Users không có MetaMask/crypto
Giải pháp:

Tích hợp Web3Auth (social login)
Custodial wallet option
Fiat payment → Backend mint hộ

4. NFT Storage

Vấn đề: IPFS có thể chậm/không khả dụng
Giải pháp:

Pin files trên Pinata
Backup metadata on centralized server
Use IPFS gateway với CDN

📈 TESTING STRATEGY
Smart Contract Tests
bashnpm test # Run all tests
npm run coverage # Check coverage
npm run gas-report # Gas consumption
Backend Tests

Unit tests (Jest)
Integration tests
API endpoint tests
Blockchain interaction tests

Frontend Tests

Component tests (Vitest)
E2E tests (Playwright/Cypress)
Wallet connection tests

🚀 DEPLOYMENT CHECKLIST
Smart Contract

Audit contract code
Test on Mumbai testnet
Verify on PolygonScan
Deploy to mainnet
Transfer ownership to multi-sig

Backend

Setup production database
Configure environment variables
Setup SSL certificates
Deploy to VPS/Cloud (AWS, DigitalOcean)
Setup monitoring (PM2, Datadog)
Configure backups

Frontend

Build production bundle
Configure contract addresses
Deploy to Vercel/Netlify
Setup custom domain
Configure CDN

📚 TÀI LIỆU THAM KHẢO

Hardhat Documentation
OpenZeppelin Contracts
Polygon Developer Docs
Vue.js 3 Guide
Wagmi Documentation
Express.js Guide
