# 🌐 Hướng Dẫn Truy Cập Từ Thiết Bị Khác

## 📱 Cách 1: Live Server (HTTP - Đơn giản nhưng camera có thể không hoạt động)

### Bước 1: Chạy Live Server
1. Mở `index.html` trong VS Code
2. Click "Go Live" ở góc phải dưới
3. Server chạy tại: `http://localhost:5500`

### Bước 2: Lấy IP của máy tính

**Windows:**
```bash
ipconfig
```
Tìm `IPv4 Address`, ví dụ: `192.168.1.100`

**Mac/Linux:**
```bash
ifconfig
# hoặc
hostname -I
```

### Bước 3: Truy cập từ thiết bị khác

Trên điện thoại/tablet (cùng WiFi), mở browser:
```
http://192.168.1.100:5500/index.html
```

### ⚠️ Lưu Ý:
- Camera có thể KHÔNG hoạt động (HTTP không an toàn)
- Chỉ hoạt động khi cùng mạng WiFi
- Cần tắt Firewall hoặc cho phép port 5500

---

## 🔒 Cách 2: HTTPS Server (Khuyến nghị - Camera hoạt động)

### Cài đặt http-server với SSL:

```bash
# Cài đặt http-server
npm install -g http-server

# Tạo self-signed certificate (chạy từ thư mục STEM)
# Windows (PowerShell as Admin):
New-SelfSignedCertificate -DnsName "localhost","192.168.1.100" -CertStoreLocation "cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1)

# Mac/Linux:
openssl req -newkey rsa:2048 -new -nodes -x509 -days 365 -keyout key.pem -out cert.pem
```

### Chạy HTTPS Server:

```bash
# Từ thư mục STEM
http-server -S -C cert.pem -K key.pem -p 8443

# Hoặc nếu dùng Python:
python -m http.server 8443 --bind 0.0.0.0
```

### Truy cập:
```
https://192.168.1.100:8443/index.html
```

**Lưu ý:** Trình duyệt sẽ cảnh báo "Not Secure" → Click "Advanced" → "Proceed anyway"

---

## 🚀 Cách 3: Ngrok (Truy cập qua Internet - Tốt nhất)

### Cài đặt Ngrok:
1. Download: https://ngrok.com/download
2. Giải nén và chạy:

```bash
# Chạy Live Server trước (port 5500)
# Sau đó chạy ngrok:
ngrok http 5500
```

### Kết quả:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:5500
```

### Truy cập:
Mở `https://abc123.ngrok.io` trên BẤT KỲ thiết bị nào (có internet)

**Ưu điểm:**
- ✅ HTTPS tự động (camera hoạt động)
- ✅ Truy cập từ mọi nơi (không cần cùng WiFi)
- ✅ Public URL đẹp
- ✅ Miễn phí

---

## 🔧 Khắc Phục Sự Cố

### Camera không hoạt động:
- **Nguyên nhân:** HTTP không an toàn
- **Giải pháp:** Dùng HTTPS (Cách 2 hoặc 3)

### Không kết nối được:
1. **Kiểm tra cùng WiFi:**
   ```bash
   # Trên máy chủ
   ipconfig
   
   # Trên điện thoại: Settings → WiFi → IP address
   # Cùng dải 192.168.1.x → OK
   ```

2. **Tắt Firewall tạm thời:**
   ```bash
   # Windows (PowerShell as Admin)
   netsh advfirewall set allprofiles state off
   
   # Nhớ bật lại sau khi test:
   netsh advfirewall set allprofiles state on
   ```

3. **Mở port trong Firewall:**
   - Windows → Firewall → Advanced Settings → Inbound Rules
   - New Rule → Port → TCP → 5500 → Allow

### Model không load:
- Đảm bảo thư mục `model/` có đầy đủ 3 files:
  - model.json ✅
  - metadata.json ✅
  - weights.bin ✅

---

## 📊 So Sánh Các Phương Pháp

| Phương Pháp | Dễ dàng | Camera | Cùng WiFi | Internet |
|-------------|---------|--------|-----------|----------|
| Live Server | ⭐⭐⭐   | ❌     | ✅        | ❌       |
| HTTPS Local | ⭐⭐     | ✅     | ✅        | ❌       |
| **Ngrok**   | ⭐⭐⭐   | ✅     | ✅        | ✅       |

**Khuyến nghị:** Dùng **Ngrok** để demo hoặc test trên nhiều thiết bị!

---

## 🎯 Quick Start (Ngrok):

```bash
# 1. Cài Live Server extension trong VS Code
# 2. Click "Go Live" → Server chạy port 5500

# 3. Download & chạy Ngrok:
ngrok http 5500

# 4. Copy URL từ Ngrok (vd: https://abc123.ngrok.io)
# 5. Mở trên bất kỳ thiết bị nào → Done! ✅
```

---

**Tạo bởi:** StudyWatch Team
**Ngày:** 15/02/2026
