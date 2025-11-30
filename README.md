# Hệ thống Website Bán Nick Game

Hệ thống website bán nick game được xây dựng với React JS, React Router DOM, Axios, Redux và MySQL.

## Cấu trúc dự án

```
prj_em huy/
├── client/          # Frontend React App
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── store/
│       └── utils/
└── server/          # Backend Express API
    ├── config/
    ├── routes/
    ├── middleware/
    └── database.sql
```

## Yêu cầu hệ thống

- Node.js (v14 trở lên)
- MySQL (v5.7 trở lên)
- npm hoặc yarn

## Cài đặt

### 1. Cài đặt Backend

```bash
cd server
npm install
```

### 2. Cấu hình Database

1. Tạo database MySQL:
```sql
CREATE DATABASE game_accounts_db;
```

2. Import schema và dữ liệu mẫu:
```bash
# Import cấu trúc database (bắt buộc)
mysql -u root -p game_accounts_db < server/database.sql

# Import dữ liệu mẫu (tùy chọn - để có sẵn sản phẩm demo)
mysql -u root -p game_accounts_db < server/sample_data.sql
```

Hoặc chạy các file trong MySQL Workbench hoặc phpMyAdmin:
- Chạy `server/database.sql` trước (tạo bảng)
- Sau đó chạy `server/sample_data.sql` (thêm dữ liệu mẫu)

3. Cấu hình file `.env` trong thư mục `server`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=game_accounts_db
JWT_SECRET=your_secret_key_here
```

### 3. Cài đặt Frontend

```bash
cd client
npm install
```

## Chạy ứng dụng

### Chạy Backend

```bash
cd server
npm start
```

Server sẽ chạy tại `http://localhost:5000`

### Chạy Frontend

```bash
cd client
npm start
```

Frontend sẽ chạy tại `http://localhost:3000`

## Tính năng

### Người dùng thường:
- Đăng ký/Đăng nhập
- Xem danh sách nick game
- Xem chi tiết sản phẩm
- Thêm vào giỏ hàng
- Đặt hàng
- Xem lịch sử đơn hàng

### Admin:
- Quản lý sản phẩm (thêm, sửa, xóa)
- Quản lý đơn hàng (xem, cập nhật trạng thái)
- Quản lý người dùng
- Xem thống kê (tổng người dùng, sản phẩm, đơn hàng, doanh thu)

## Tài khoản mặc định

Sau khi import database, bạn có thể tạo tài khoản admin bằng cách:
1. Đăng ký tài khoản mới
2. Cập nhật role trong database thành 'admin':
```sql
UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
```

Hoặc sử dụng tài khoản admin mặc định (cần cập nhật password trong database.sql).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin only)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin only)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin only)

### Orders
- `GET /api/orders/my-orders` - Lấy đơn hàng của user
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/all` - Lấy tất cả đơn hàng (Admin only)
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng (Admin only)

### Admin
- `GET /api/admin/users` - Lấy danh sách users (Admin only)
- `GET /api/admin/stats` - Lấy thống kê (Admin only)

## Công nghệ sử dụng

### Frontend:
- React JS
- React Router DOM
- Redux Toolkit
- Axios
- CSS3

### Backend:
- Node.js
- Express.js
- MySQL2
- JWT (JSON Web Token)
- bcryptjs
- CORS

## Lưu ý

- Đảm bảo MySQL đang chạy trước khi start server
- Thay đổi JWT_SECRET trong production
- Cập nhật password database trong file .env
- File .env không nên commit lên git (đã có .env.example)

