# Hướng dẫn tạo tài khoản Admin

Có 2 cách để tạo tài khoản admin:

## Cách 1: Tạo admin tương tác (Khuyến nghị)

Chạy lệnh sau và nhập thông tin:

```bash
cd server
npm run create-admin
```

Script sẽ hỏi:
- Username cho admin
- Email cho admin  
- Password cho admin

## Cách 2: Tạo admin tự động (Nhanh)

Chạy lệnh sau để tạo admin với thông tin mặc định:

```bash
cd server
npm run create-admin-simple
```

**Thông tin mặc định:**
- Username: `admin`
- Email: `admin@example.com`
- Password: `admin123`

### Tùy chỉnh thông tin admin mặc định

Sửa file `server/.env` và thêm:

```env
ADMIN_USERNAME=your_admin_username
ADMIN_EMAIL=your_admin@email.com
ADMIN_PASSWORD=your_password
```

Sau đó chạy lại:
```bash
npm run create-admin-simple
```

## Cách 3: Tạo admin bằng SQL (Thủ công)

1. Tạo hash password cho mật khẩu của bạn:

```bash
cd server
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your_password', 10).then(hash => console.log(hash));"
```

2. Chạy SQL trong MySQL:

```sql
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@example.com', 'hash_password_here', 'admin');
```

Hoặc cập nhật user hiện có thành admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
```

## Lưu ý

- Đảm bảo database đã được tạo và file `.env` đã được cấu hình đúng
- Sau khi tạo admin, nên đổi mật khẩu ngay lần đầu đăng nhập
- Không nên dùng mật khẩu mặc định trong production

