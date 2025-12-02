# Hướng dẫn truy cập từ điện thoại

## Vấn đề
Khi truy cập từ điện thoại qua IP, không thể xem sản phẩm, đăng ký, đăng nhập.

## Giải pháp

### Bước 1: Tạo file .env trong thư mục client

Tạo file `client/.env` với nội dung:
```
HOST=0.0.0.0
PORT=3000
```

**Cách tạo trên Windows:**
1. Mở Notepad
2. Gõ nội dung:
   ```
   HOST=0.0.0.0
   PORT=3000
   ```
3. Lưu file với tên `.env` (quan trọng: có dấu chấm ở đầu)
4. Đặt file vào thư mục `client/`

**Hoặc dùng PowerShell:**
```powershell
cd client
echo "HOST=0.0.0.0" > .env
echo "PORT=3000" >> .env
```

### Bước 2: Tìm IP của máy tính

**Trên Windows:**
1. Mở Command Prompt hoặc PowerShell
2. Chạy lệnh: `ipconfig`
3. Tìm dòng "IPv4 Address" trong phần "Wireless LAN adapter Wi-Fi" hoặc "Ethernet adapter"
4. Ghi lại IP (ví dụ: `192.168.1.100`)

**Hoặc:**
- Settings → Network & Internet → Wi-Fi → Properties → IPv4 address

### Bước 3: Khởi động Server

```bash
cd server
npm start
```

Server sẽ chạy trên port 5000 và lắng nghe trên tất cả các interface mạng (0.0.0.0).

### Bước 4: Khởi động Client

```bash
cd client
npm start
```

Sau khi tạo file `.env`, React sẽ tự động bind vào `0.0.0.0` và bạn sẽ thấy thông báo:
```
On Your Network:  http://192.168.1.100:3000
```

### Bước 5: Truy cập từ điện thoại

1. **Đảm bảo điện thoại và máy tính cùng một mạng WiFi**

2. **Mở trình duyệt trên điện thoại** và truy cập:
   ```
   http://[IP_MÁY_TÍNH]:3000
   ```
   Ví dụ: `http://192.168.1.100:3000`

3. **Frontend sẽ tự động kết nối đến backend** tại `http://[IP_MÁY_TÍNH]:5000`

### Bước 6: Kiểm tra Firewall

Nếu vẫn không truy cập được, kiểm tra Windows Firewall:

1. Mở **Windows Defender Firewall**
2. Chọn **Allow an app or feature through Windows Defender Firewall**
3. Tìm **Node.js** và đảm bảo cả **Private** và **Public** đều được check
4. Nếu không thấy Node.js, click **Allow another app** → Browse → Tìm file `node.exe` (thường ở `C:\Program Files\nodejs\node.exe`)

**Hoặc tạm thời tắt Firewall để test:**
- Settings → Update & Security → Windows Security → Firewall & network protection → Tắt Firewall (chỉ để test)

### Troubleshooting

1. **Không thể truy cập từ điện thoại:**
   - Kiểm tra IP có đúng không
   - Kiểm tra điện thoại và máy tính có cùng WiFi không
   - Kiểm tra Firewall
   - Thử ping từ điện thoại: Mở terminal app trên điện thoại, ping IP máy tính

2. **Có thể truy cập nhưng không load được dữ liệu:**
   - Kiểm tra console trên điện thoại (Chrome DevTools Remote Debugging)
   - Kiểm tra API URL trong console log
   - Đảm bảo server đang chạy và bind vào 0.0.0.0

3. **Lỗi CORS:**
   - Đã được cấu hình trong `server/index.js` với `origin: '*'`
   - Nếu vẫn lỗi, kiểm tra lại CORS config

### Kiểm tra nhanh

Mở trình duyệt trên máy tính và truy cập:
- `http://localhost:5000/api/test` → Phải trả về `{"message":"Server is running!"}`
- `http://[IP_MÁY_TÍNH]:5000/api/test` → Phải trả về `{"message":"Server is running!"}`

Nếu cả hai đều hoạt động, server đã được cấu hình đúng.

