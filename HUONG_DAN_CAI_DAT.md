# Hướng dẫn cài đặt nhanh

## Bước 1: Cài đặt MySQL

1. Cài đặt MySQL Server (nếu chưa có)
2. Tạo database:
```sql
CREATE DATABASE game_accounts_db;
```

3. Import schema và dữ liệu mẫu:
```bash
# Import cấu trúc database
mysql -u root -p game_accounts_db < server/database.sql

# Import dữ liệu mẫu (tùy chọn)
mysql -u root -p game_accounts_db < server/sample_data.sql
```

Hoặc mở các file trong MySQL Workbench/phpMyAdmin:
- Chạy `server/database.sql` trước (tạo bảng)
- Sau đó chạy `server/sample_data.sql` (thêm dữ liệu mẫu)

## Bước 2: Cấu hình Backend

1. Vào thư mục server:
```bash
cd server
```

2. Cài đặt dependencies (đã cài):
```bash
npm install
```

3. Tạo file `.env` (đã có sẵn, chỉ cần sửa password nếu cần):
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=game_accounts_db
JWT_SECRET=your_secret_key_here
```

4. Chạy server:
```bash
npm start
```

Server sẽ chạy tại: http://localhost:5000

## Bước 3: Cài đặt Frontend

1. Vào thư mục client:
```bash
cd client
```

2. Cài đặt dependencies (đã cài):
```bash
npm install
```

3. Chạy ứng dụng:
```bash
npm start
```

Frontend sẽ chạy tại: http://localhost:3000

## Tài khoản Admin mặc định

- Email: admin@example.com
- Password: admin123

**Lưu ý:** Sau khi đăng nhập lần đầu, nên đổi mật khẩu!

## Cấu trúc thư mục

```
prj_em huy/
├── client/              # React Frontend
│   └── src/
│       ├── components/  # Components (Navbar, ...)
│       ├── pages/       # Pages (Home, Login, Register, ...)
│       ├── store/       # Redux store và slices
│       └── utils/       # Utilities (axios config)
└── server/              # Express Backend
    ├── config/          # Database config
    ├── routes/          # API routes
    ├── middleware/      # Auth middleware
    └── database.sql      # Database schema
```

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra MySQL đang chạy
- Kiểm tra thông tin trong file `.env`
- Kiểm tra database đã được tạo chưa

### Lỗi CORS
- Đảm bảo backend đang chạy tại port 5000
- Kiểm tra file `server/index.js` có cấu hình CORS

### Lỗi authentication
- Kiểm tra JWT_SECRET trong `.env`
- Xóa token trong localStorage và đăng nhập lại

