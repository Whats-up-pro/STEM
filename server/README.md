# 🚀 Hướng Dẫn Cài Đặt & Chạy Server Giám Sát

## 📋 Yêu Cầu Hệ Thống

- **Node.js** v16 trở lên
- **npm** hoặc **yarn**
- **Windows/macOS/Linux**

## 📦 Bước 1: Cài Đặt Dependencies

Mở terminal/cmd trong thư mục `server/`:

```bash
cd server
npm install
```

Dependencies sẽ được cài đặt:
- `express` - Web framework
- `better-sqlite3` - SQLite database
- `cors` - Cross-origin resource sharing
- `body-parser` - Parse JSON requests

## 🖥️ Bước 2: Chạy Server

### Chạy server:
```bash
npm start
```

### Hoặc chạy với nodemon (auto reload khi code thay đổi):
```bash
npm run dev
```

Server sẽ chạy tại: **http://localhost:3000**

## 🎯 Bước 3: Truy Cập Ứng Dụng

### Dành cho HỌC SINH:
Mở trình duyệt và truy cập:
```
http://localhost:3000/index.html
```

1. Nhập **Mã số học sinh**, **Họ tên**, **Lớp**
2. Click "Bắt Đầu Học"
3. Cho phép truy cập **camera**
4. Bắt đầu học và hệ thống sẽ tự động gửi dữ liệu về server

### Dành cho GIÁO VIÊN:
Mở trình duyệt và truy cập:
```
http://localhost:3000/teacher-dashboard.html
```

Dashboard sẽ hiển thị:
- ✅ Danh sách học sinh đang online
- 📊 Dữ liệu tập trung realtime
- 🚨 Cảnh báo khi học sinh mất tập trung
- 📈 Biểu đồ chi tiết

## 📂 Cấu Trúc Dữ Liệu

Server sẽ tạo file database: `server/students.db`

**Các bảng:**
- `students` - Thông tin học sinh
- `sessions` - Phiên học
- `focus_data` - Dữ liệu tập trung theo giây
- `alerts` - Cảnh báo mất tập trung
- `session_summary` - Tóm tắt sau mỗi phiên

## 🔧 Cấu Hình

### Thay đổi PORT:
Mở file `server/server.js` và sửa:
```javascript
const PORT = process.env.PORT || 3000; // Đổi 3000 thành port khác
```

### Thay đổi API URL (nếu chạy trên server khác):
Mở file `index.html` và sửa:
```javascript
const API_URL = 'http://localhost:3000/api'; // Đổi địa chỉ server
```

## 🌐 Deploy Lên Server Thật

### 1. Sử dụng VPS/Server:
```bash
# Copy toàn bộ thư mục lên server
# Cài đặt Node.js
# Chạy server:
cd server
npm install
npm start
```

### 2. Sử dụng PM2 (để server chạy liên tục):
```bash
npm install -g pm2
cd server
pm2 start server.js --name "stem-focus-server"
pm2 save
pm2 startup
```

### 3. Cấu hình Firewall (nếu cần):
Mở port 3000 để truy cập từ bên ngoài:
```bash
# Ubuntu/Linux
sudo ufw allow 3000/tcp

# Windows Firewall
# Vào Settings > Windows Security > Firewall > Add Inbound Rule
```

## 📊 API Endpoints

Tất cả API đều sử dụng prefix: `/api`

### Học sinh:
- `POST /api/student/register` - Đăng ký học sinh
- `POST /api/session/start` - Bắt đầu phiên học
- `POST /api/focus/send` - Gửi dữ liệu tập trung
- `POST /api/session/end` - Kết thúc phiên học

### Giáo viên:
- `GET /api/teacher/active-students` - Danh sách học sinh online
- `GET /api/teacher/student/:session_id/live` - Xem chi tiết học sinh
- `GET /api/teacher/alerts` - Lấy cảnh báo
- `GET /api/teacher/student/:student_id/history` - Lịch sử học sinh
- `GET /api/teacher/dashboard-stats` - Thống kê tổng quan

## 🐛 Xử Lý Lỗi

### Lỗi: `Error: Cannot find module 'better-sqlite3'`
**Giải pháp:**
```bash
cd server
npm install
```

### Lỗi: `Port 3000 already in use`
**Giải pháp:**
- Đổi PORT trong file `server.js`
- Hoặc kill process đang dùng port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill
```

### Lỗi kết nối database
**Giải pháp:**
- Xóa file `server/students.db`
- Khởi động lại server, database sẽ được tạo lại

### Học sinh không kết nối được server
**Giải pháp:**
1. Kiểm tra server đang chạy
2. Kiểm tra API_URL trong `index.html`
3. Kiểm tra CORS settings
4. Nếu khác mạng, cần dùng IP thay vì localhost

## 📝 Ghi Chú

- Server chạy hoàn toàn **offline** trên máy local
- Không cần internet để hoạt động
- Dữ liệu được lưu trong SQLite database
- Học sinh vẫn có thể dùng app khi server tắt (offline mode)

## 🎓 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Console log trong browser (F12)
2. Terminal log của server
3. File database `students.db` có được tạo không

---

**Phát triển bởi STEM Team** 🚀
