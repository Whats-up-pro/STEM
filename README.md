# 🎓 StudyWatch - Giám Sát Học Tập Online
**Hệ thống AI giám sát học sinh học online theo thời gian thực**

> ⚠️ **LƯU Ý QUAN TRỌNG:**  
> Phiên bản hiện tại là **POC (Proof of Concept)** - Chứng minh khái niệm.  
> Có **hạn chế** khi triển khai thực tế với Google Meet/Teams (xung đột camera).  
> 📘 **Xem chi tiết:** [FUTURE-DEVELOPMENT.md](FUTURE-DEVELOPMENT.md) - Hướng triển khai khả thi cho môi trường giáo dục VN.

## 📋 Mô Tả Dự Án

Ứng dụng web sử dụng AI để giám sát và phân tích mức độ tập trung của học sinh khi học online, giúp giáo viên theo dõi tình hình học tập realtime và học sinh tự cải thiện hiệu quả học tập.

### ✅ Chức Năng Hiện Tại
- 🎯 Nhận diện trạng thái: Focus / Distracted / Sleepy (AI realtime)
- 📊 Dashboard giáo viên: Xem tình hình cả lớp theo thời gian thực
- 💾 Server backend: Lưu trữ dữ liệu, lịch sử, cảnh báo (SQLite)
- 📈 Thống kê chi tiết: Biểu đồ, báo cáo phiên học

### ⚠️ Hạn Chế Cần Biết
- **Xung đột camera:** Không dùng chung với Google Meet/Teams trên cùng 1 thiết bị
- **Giải pháp tạm thời:** Học sinh cần 2 thiết bị (laptop học Meet + điện thoại chạy StudyWatch)
- **Hướng phát triển:** Chrome Extension tích hợp trực tiếp vào Meet/Teams (xem [FUTURE-DEVELOPMENT.md](FUTURE-DEVELOPMENT.md))

## 🚀 Công Nghệ Sử Dụng

### Core Technologies
- **HTML5** - Cấu trúc ứng dụng
- **CSS3** - Giao diện responsive, modern
- **JavaScript (ES6+)** - Logic xử lý

### AI & Machine Learning
- **TensorFlow.js** (v3.20.0)
  - Thư viện ML chạy trên browser
  - Xử lý model AI realtime
  - Không cần server backend
  
- **Teachable Machine Image Model** (v0.8)
  - Model nhận dạng trạng thái: Focus/Distracted/Sleepy
  - Train model: https://teachablemachine.withgoogle.com/
  - Load từ local files (`/model/`)

### Data Visualization
- **Chart.js** (latest)
  - Biểu đồ thời gian thực
  - Line chart 120 giây lịch sử
  - Responsive và interactive

### Device Integration
- **WebRTC / getUserMedia API**
  - Truy cập webcam laptop
  - 300x300px video stream
  - Bật/tắt camera thực sự (stop/start tracks)

### Progressive Web App
- **Service Worker** (`sw.js`)
  - Offline-first strategy
  - Cache assets và model
  - Chạy hoàn toàn offline sau lần đầu load
  
- **Web App Manifest** (`manifest.json`)
  - Installable như native app
  - Standalone mode
  - Custom theme color

### Storage & Data
- **localStorage**
  - Lưu settings người dùng
  - Persist state
  
- **JSON Export**
  - Export dữ liệu session
  - Download file JSON chi tiết

## 📊 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────┐
│           WEBCAM INPUT                  │
│      (getUserMedia API)                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      TENSORFLOW.JS MODEL                │
│   (Teachable Machine Image)             │
│  - model.json                           │
│  - metadata.json                        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      CLASSIFICATION (3 States)          │
│  🎯 Focus                               │
│  😕 Distracted                          │
│  😴 Sleepy                              │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────┐     ┌──────────────┐
│ Analysis │     │  Tracking    │
│ % Focus  │     │  Per Second  │
└────┬─────┘     └──────┬───────┘
     │                  │
     ▼                  ▼
┌─────────────────────────────┐
│      VISUALIZATION          │
│  - Chart.js Line Chart      │
│  - Real-time Dashboard      │
│  - State Breakdown          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│     WARNING SYSTEM          │
│  Alert when < 60% focus     │
└─────────────────────────────┘
```

## 💡 Tính Năng

### ✅ Đã Hoàn Thành
- [x] Nhận dạng 3 trạng thái (Focus/Distracted/Sleepy)
- [x] Giao diện responsive, hiện đại
- [x] Biểu đồ theo thời gian thực (2 phút)
- [x] Thống kê % tập trung
- [x] Bật/tắt camera thật sự
- [x] Bật/tắt giám sát
- [x] Cảnh báo khi < 60% tập trung
- [x] Export dữ liệu JSON
- [x] 100% offline-ready
- [x] PWA support

### 🔮 Có Thể Nâng Cao Thêm

#### Performance Optimization
- [ ] **Web Workers** - Chạy TensorFlow.js trên worker thread
- [ ] **WebAssembly** - Tối ưu tốc độ inference
- [ ] **Model Quantization** - Giảm kích thước model

#### Data & Analytics
- [ ] **IndexedDB** - Lưu lịch sử dài hạn
- [ ] **CSV Export** - Export dạng spreadsheet
- [ ] **Statistics Dashboard** - Báo cáo tuần/tháng
- [ ] **Goal Setting** - Đặt mục tiêu tập trung

#### Features
- [ ] **Pomodoro Timer** - Tích hợp kỹ thuật Pomodoro
- [ ] **Sound Alerts** - Cảnh báo bằng âm thanh
- [ ] **Break Reminders** - Nhắc nghỉ ngơi
- [ ] **Multi-language** - EN/VI/...
- [ ] **Dark Mode** - Chế độ tối

#### Integration
- [ ] **Google Calendar** - Sync lịch học
- [ ] **Notion API** - Export sang Notion
- [ ] **Chrome Extension** - Extension riêng

## 📦 Cài Đặt & Sử Dụng

### 1. Clone Repository
```bash
git clone <repository-url>
cd STEM
```

### 2. Cấu Trúc Thư Mục
```
STEM/
├── index.html          # File chính
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
├── model/
│   ├── model.json     # TensorFlow model
│   └── metadata.json  # Model metadata
└── README.md          # Documentation
```

### 3. Chạy Ứng Dụng

**Cách 1: Mở trực tiếp**
- Double click `index.html`
- Cho phép quyền camera khi trình duyệt hỏi

**Cách 2: Local Server (Khuyến nghị)**
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# Live Server (VS Code)
# Click "Go Live" trong VS Code
```

Truy cập: `http://localhost:8000`

### 4. Sử dụng Offline

Sau lần đầu load, ứng dụng có thể chạy **hoàn toàn offline**:
1. Load ứng dụng lần đầu khi có internet
2. Service Worker sẽ cache tất cả files
3. Ngắt internet
4. Reload trang → Vẫn hoạt động bình thường! 🚀

## 🎯 Hướng Dẫn Sử Dụng

1. **Cho phép camera**: Click "Allow" khi trình duyệt yêu cầu
2. **Chờ khởi động**: Model sẽ load trong vài giây
3. **Bắt đầu học**: Ngồi trước camera, hệ thống tự động giám sát
4. **Xem thống kê**: Dashboard hiển thị % tập trung realtime
5. **Điều khiển**: 
   - Toggle "Camera" để bật/tắt camera
   - Toggle "Giám Sát" để pause/resume
6. **Export dữ liệu**: Click nút "Xuất Dữ Liệu" để tải file JSON

## ⚙️ Cấu Hình & Tối Ưu

### Model Configuration
```javascript
// Trong index.html
const URL = "./model/";
model = await tmImage.load(URL + "model.json", URL + "metadata.json");
```

### Chart Configuration
```javascript
// 120 giây = 2 phút lịch sử
const MAX_HISTORY_SECONDS = 120;
```

### Warning Threshold
```javascript
// Cảnh báo khi < 60% tập trung
if (focusPercent < 60 && focusHistory.length >= 10) {
    // Show warning
}
```

## 🔒 Bảo Mật & Quyền Riêng Tư

- ✅ Không upload video lên server
- ✅ Xử lý 100% trên browser
- ✅ Không lưu hình ảnh
- ✅ Dữ liệu chỉ lưu local
- ✅ Có thể tắt camera bất cứ lúc nào

## 📈 Performance

- **Model Size**: ~5MB (model.json + weights)
- **FPS**: ~30 FPS prediction
- **Latency**: <50ms per inference
- **Memory**: ~100MB RAM usage

## � Hướng Dẫn Triển Khai Thực Tế

### 🏫 Cho Giáo Viên & Trường Học

#### **Phương Án 1: Học sinh có 2 thiết bị** ⭐ (Khuyến nghị hiện tại)

**Cách triển khai:**
1. **Laptop/PC:** Học sinh tham gia Google Meet/Teams bình thường
2. **Điện thoại/Tablet:** Mở StudyWatch (`http://[server-ip]:3000/index.html`)
3. **Đặt điện thoại** trên giá, camera hướng về mặt học sinh

**Ưu điểm:**
- ✅ Không xung đột camera
- ✅ Dễ thiết lập
- ✅ Ổn định

**Yêu cầu:**
- Học sinh cần có smartphone (phổ biến ở VN)
- Cả 2 thiết bị cùng kết nối WiFi

#### **Phương Án 2: Sử dụng Virtual Camera** (Nâng cao)

**Bước thực hiện:**
1. Cài đặt **OBS Studio** (miễn phí): https://obsproject.com/
2. Setup Virtual Camera trong OBS
3. Chọn Virtual Camera cho Meet/Teams
4. Camera thật vẫn dùng cho StudyWatch

**Ưu điểm:**
- ✅ Chỉ cần 1 thiết bị

**Nhược điểm:**
- ❌ Phức tạp, cần hướng dẫn kỹ
- ❌ Tốn tài nguyên máy

#### **Phương Án 3: Chờ Chrome Extension** 🚀 (Tốt nhất - Đang phát triển)

Xem chi tiết tại [FUTURE-DEVELOPMENT.md](FUTURE-DEVELOPMENT.md) - Extension sẽ tích hợp trực tiếp vào Meet/Teams.

### 📋 Checklist Triển Khai Lớp Học

**Chuẩn bị (1 tuần trước):**
- [ ] Setup server trên máy tính/VPS (xem `server/README.md`)
- [ ] Test với 2-3 học sinh trước
- [ ] Gửi hướng dẫn cho phụ huynh
- [ ] Giải thích mục đích sử dụng rõ ràng

**Buổi học đầu tiên:**
- [ ] Hướng dẫn học sinh đăng nhập StudyWatch
- [ ] Kiểm tra tất cả học sinh đã kết nối server
- [ ] Mở Dashboard giáo viên để theo dõi
- [ ] Giải đáp thắc mắc

**Trong quá trình sử dụng:**
- [ ] Theo dõi dashboard realtime
- [ ] Lưu ý học sinh có % tập trung thấp
- [ ] Xem báo cáo sau mỗi buổi học
- [ ] Thu thập feedback để cải thiện

### ⚖️ Lưu Ý Pháp Lý

- 📄 **Xin phép phụ huynh** trước khi sử dụng
- 🔒 **Giải thích rõ:** Không lưu video, chỉ lưu metadata
- 👁️ **Minh bạch:** Cho phép học sinh/PHHH xem dữ liệu của mình
- ✋ **Quyền từ chối:** Không bắt buộc nếu PHHH không đồng ý

## �🐛 Troubleshooting

### Camera không hoạt động
- Kiểm tra quyền camera trong browser settings
- Chỉ hoạt động trên HTTPS hoặc localhost
- Đảm bảo không có ứng dụng khác đang dùng camera

### Model không load
- Kiểm tra file `model/model.json` và `model/metadata.json`
- Xem console log để debug
- Reload trang

### Offline không hoạt động
- Kiểm tra Service Worker đã đăng ký chưa (F12 → Application → Service Workers)
- Clear cache và reload lần đầu khi có internet

## 📝 License

MIT License - Tự do sử dụng cho mục đích học tập và thương mại.

## 👨‍💻 Phát Triển

Để train model mới:
1. Truy cập https://teachablemachine.withgoogle.com/
2. Chọn "Image Project"
3. Thu thập ảnh cho 3 class: Focus, Distracted, Sleepy
4. Train model
5. Export "TensorFlow.js" model
6. Thay thế files trong folder `/model/`

---

**Made with ❤️ using AI & Web Technologies**

🌟 **100% Offline • 100% Privacy • 100% Free**
