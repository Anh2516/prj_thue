# Kiểm tra nhanh - Truy cập từ điện thoại

## ✅ Đã sửa các vấn đề:

1. ✅ Server bind vào `0.0.0.0` (cho phép truy cập từ mạng)
2. ✅ Client có file `.env` với `HOST=0.0.0.0`
3. ✅ Tất cả API calls sử dụng `axiosInstance` tự động detect IP
4. ✅ CORS đã được cấu hình đúng

## 🔍 Kiểm tra từng bước:

### Bước 1: Tìm IP máy tính
```powershell
ipconfig
```
Tìm "IPv4 Address" (ví dụ: `192.168.1.100`)

### Bước 2: Khởi động Server
```bash
cd server
npm start
```

**Kiểm tra log:**
- Phải thấy: `Server is running on port 5000`
- Phải thấy: `Access from network: http://0.0.0.0:5000`

**Test từ máy tính:**
- Mở browser: `http://localhost:5000/api/test`
- Phải trả về: `{"message":"Server is running!"}`

**Test từ IP:**
- Mở browser: `http://192.168.1.100:5000/api/test` (thay IP của bạn)
- Phải trả về: `{"message":"Server is running!"}`

### Bước 3: Khởi động Client
```bash
cd client
npm start
```

**Kiểm tra log:**
- Phải thấy: `On Your Network:  http://192.168.1.100:3000`
- Nếu không thấy dòng này, file `.env` chưa được đọc

**Kiểm tra file .env:**
```powershell
cd client
Get-Content .env
```
Phải thấy:
```
HOST=0.0.0.0
PORT=3000
```

### Bước 4: Test từ điện thoại

1. **Đảm bảo điện thoại và máy tính cùng WiFi**

2. **Mở trình duyệt trên điện thoại:**
   - Truy cập: `http://192.168.1.100:3000` (thay IP của bạn)

3. **Mở Developer Tools trên điện thoại:**
   - Chrome: Menu → More tools → Remote debugging
   - Hoặc dùng Chrome trên máy tính: `chrome://inspect`
   - Xem Console để kiểm tra:
     - `API URL: http://192.168.1.100:5000/api`
     - `Current hostname: 192.168.1.100`

4. **Kiểm tra Network tab:**
   - Xem các request đến `/api/products`, `/api/auth/login`, etc.
   - Kiểm tra xem có lỗi CORS không
   - Kiểm tra status code (phải là 200, không phải 404 hoặc CORS error)

### Bước 5: Kiểm tra Firewall

**Windows Firewall:**
1. Settings → Update & Security → Windows Security
2. Firewall & network protection
3. Allow an app through firewall
4. Tìm **Node.js** và check cả **Private** và **Public**

**Hoặc tạm thời tắt Firewall để test:**
- Tắt Firewall tạm thời (chỉ để test)

### Bước 6: Debug nếu vẫn lỗi

**Trên điện thoại, mở Console và kiểm tra:**

1. **API URL có đúng không?**
   ```javascript
   // Phải thấy trong console:
   API URL: http://192.168.1.100:5000/api
   Current hostname: 192.168.1.100
   ```

2. **Có lỗi network không?**
   - `Network Error` → Server không chạy hoặc Firewall chặn
   - `CORS Error` → CORS config chưa đúng
   - `404 Not Found` → API URL sai

3. **Test API trực tiếp từ điện thoại:**
   - Mở browser trên điện thoại
   - Truy cập: `http://192.168.1.100:5000/api/test`
   - Phải trả về: `{"message":"Server is running!"}`
   - Nếu không được → Server hoặc Firewall có vấn đề

## 🐛 Các lỗi thường gặp:

### 1. "Cannot GET /" hoặc "404 Not Found"
- **Nguyên nhân:** React Router không match route
- **Giải pháp:** Đảm bảo truy cập đúng URL: `http://IP:3000`

### 2. "Network Error" hoặc "ERR_CONNECTION_REFUSED"
- **Nguyên nhân:** Server không chạy hoặc Firewall chặn
- **Giải pháp:** 
  - Kiểm tra server có chạy không
  - Kiểm tra Firewall
  - Test API trực tiếp: `http://IP:5000/api/test`

### 3. "CORS Error"
- **Nguyên nhân:** CORS config chưa đúng
- **Giải pháp:** Đã được fix trong `server/index.js`

### 4. "API URL: http://localhost:5000/api" (trên điện thoại)
- **Nguyên nhân:** `axiosConfig.js` không detect đúng IP
- **Giải pháp:** Đã được fix, nhưng cần restart client

### 5. Không thấy "On Your Network" trong log
- **Nguyên nhân:** File `.env` chưa được đọc
- **Giải pháp:** 
  - Kiểm tra file `.env` có đúng không
  - Restart client
  - Xóa `node_modules/.cache` và restart

## 📝 Checklist:

- [ ] Server chạy và bind vào `0.0.0.0`
- [ ] File `client/.env` có `HOST=0.0.0.0`
- [ ] Client hiển thị "On Your Network: http://IP:3000"
- [ ] Test API từ máy tính: `http://localhost:5000/api/test` → OK
- [ ] Test API từ IP: `http://IP:5000/api/test` → OK
- [ ] Test API từ điện thoại: `http://IP:5000/api/test` → OK
- [ ] Truy cập web từ điện thoại: `http://IP:3000` → Load được
- [ ] Console trên điện thoại hiển thị đúng API URL
- [ ] Firewall đã cho phép Node.js

## 🚀 Sau khi fix xong:

1. **Restart cả server và client**
2. **Clear cache trên điện thoại** (nếu cần)
3. **Test lại từ đầu**

