# Backend Scripts

Các scripts hỗ trợ quản lý và bảo trì hệ thống.

## 🚀 Scripts Chính

### Đồng Bộ Blockchain

```bash
# Đồng bộ toàn bộ dữ liệu từ blockchain
node scripts/sync-blockchain-full.js

# Đồng bộ chỉ totalTicketsSold
node scripts/sync-total-tickets-sold.js

# Đồng bộ supply của ticket types
node scripts/sync-supply.js

# Đồng bộ tickets từ blockchain
node scripts/sync-tickets.js
```

### Kiểm Tra Dữ Liệu

```bash
# Kiểm tra events và ticket types
node scripts/check-events.js

# Kiểm tra thời gian bán vé
node scripts/check-sale-times.js

# Kiểm tra dữ liệu database
node scripts/check-db-data.js

# Kiểm tra blockchain nhanh
node scripts/check-blockchain-quick.js
```

### Quản Lý IPFS

```bash
# Upload ảnh lên Pinata IPFS
node scripts/upload-local-images.js

# Verify ảnh đã upload
node scripts/verify-ipfs-images.js
```

### Testing

```bash
# Test API endpoints
node scripts/test-api.js
```

## 📋 Chi Tiết Scripts

### sync-blockchain-full.js

Đồng bộ toàn bộ dữ liệu từ blockchain vào database:

- Events
- Ticket types
- Tickets
- Cập nhật totalTicketsSold và revenue

### sync-total-tickets-sold.js

Cập nhật lại cột `totalTicketsSold` cho tất cả events dựa trên blockchain.

### check-events.js

Hiển thị tất cả events, ticket types và thống kê.

### check-sale-times.js

Kiểm tra thời gian mở/đóng bán vé, xác định vé nào đang bán.

### upload-local-images.js

Upload ảnh từ `public/images/events/` lên Pinata IPFS và cập nhật database.

## 🔧 Khi Nào Dùng

| Tình Huống                     | Script                                             |
| ------------------------------ | -------------------------------------------------- |
| Dữ liệu database không đồng bộ | `sync-blockchain-full.js`                          |
| Số vé bán không đúng           | `sync-total-tickets-sold.js`                       |
| User không mua được vé         | `check-sale-times.js`                              |
| Thêm event mới với ảnh         | `upload-local-images.js` → `verify-ipfs-images.js` |
| Kiểm tra tổng quan database    | `check-db-data.js`                                 |
| Debug blockchain connection    | `check-blockchain-quick.js`                        |

## ⚠️ Lưu Ý

1. Đảm bảo `.env` được cấu hình đúng
2. MongoDB phải đang chạy
3. Backend phải có kết nối blockchain
4. Backup database trước khi chạy sync scripts

## 🔐 Bảo Mật

- KHÔNG commit `.env` file
- KHÔNG share PINATA_JWT
- Rotate API keys định kỳ
