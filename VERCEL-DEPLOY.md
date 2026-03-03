# 🚀 Deploy StudyWatch lên Vercel

## ⚠️ LƯU Ý QUAN TRỌNG

Phiên bản này sử dụng **in-memory storage** (Map) thay vì SQLite. 

**Hạn chế:**
- Data sẽ **mất** khi Vercel function restart (cold start ~10-15 phút không có request)
- Chỉ phù hợp cho **demo/testing**
- Để production, cần upgrade lên **Vercel Postgres** (xem phần Upgrade bên dưới)

---

## 📦 Cách 1: Deploy qua Vercel CLI (NHANH NHẤT - 2 phút)

### Bước 1: Cài Vercel CLI
```bash
npm install -g vercel
```

### Bước 2: Login vào Vercel
```bash
vercel login
```

### Bước 3: Deploy
```bash
# Di chuyển vào folder project
cd e:\STEM

# Deploy lên Vercel
vercel --prod
```

Thế thôi! ✅ 

Vercel sẽ:
- Tự động detect config từ `vercel.json`
- Install dependencies từ `package.json`
- Deploy frontend + API
- Cho bạn URL production: `https://your-project.vercel.app`

---

## 🌐 Cách 2: Deploy qua Vercel Dashboard (ĐỒNG HỌA - 3 phút)

### Bước 1: Tạo tài khoản Vercel
Truy cập: https://vercel.com/signup

### Bước 2: Import Project
1. Click **"Add New..." → Project**
2. Chọn **"Import Git Repository"** hoặc **"Import from Local"**

#### Option A: Qua Git (Khuyến nghị)
1. Push code lên GitHub/GitLab
2. Connect repository với Vercel
3. Vercel tự động deploy

#### Option B: Qua Upload (Nhanh)
1. Zip folder `e:\STEM`
2. Upload lên Vercel Dashboard
3. Click Deploy

### Bước 3: Configure (Tự động)
Vercel sẽ tự detect:
- Framework: Other
- Build Command: (none)
- Output Directory: (none)
- Install Command: `npm install`

### Bước 4: Deploy
Click **"Deploy"** → Chờ ~60 giây → Xong! 🎉

---

## 🔗 Sau khi Deploy

Bạn sẽ nhận được:
- **URL Production:** `https://studywatch.vercel.app` (hoặc tên tương tự)
- **API Endpoint:** `https://studywatch.vercel.app/api/student/register`
- **Dashboard:** `https://studywatch.vercel.app/teacher-dashboard.html`

### Kiểm tra hoạt động:
```bash
# Test API
curl https://your-project.vercel.app/api/teacher/dashboard-stats
```

---

## ⚙️ Cấu hình đã tạo

### 1. `vercel.json` - Routing config
- Route `/api/*` → Serverless function
- Route `/*` → Static files (HTML/CSS/JS)

### 2. `api/server.js` - Serverless function
- Xử lý tất cả API endpoints
- In-memory storage (Map)
- CORS enabled

### 3. `package.json` - Dependencies
- `cors`: CORS middleware
- `vercel`: CLI tool

### 4. `.vercelignore` - Ignore files
- Bỏ qua server/ folder cũ
- Bỏ qua node_modules, .git, *.db

---

## 🎯 Commands Hữu Ích

```bash
# Test local trước khi deploy
vercel dev

# Deploy preview (test URL)
vercel

# Deploy production
vercel --prod

# Xem logs
vercel logs

# Xem danh sách projects
vercel ls

# Remove deployment
vercel remove [project-name]
```

---

## 🔄 UPGRADE LÊN VERCEL POSTGRES (Persistent Data)

### Khi nào cần upgrade?
- Khi cần lưu data lâu dài
- Khi số lượng học sinh > 10
- Khi deploy production thực tế

### Cách upgrade:

#### 1. Tạo Vercel Postgres Database
```bash
# Trong project dashboard
vercel env add POSTGRES_URL
```

#### 2. Cài thêm dependencies
```bash
npm install @vercel/postgres
```

#### 3. Sửa `api/server.js`
Thay thế Map storage bằng SQL queries:
```javascript
import { sql } from '@vercel/postgres';

// Thay vì storage.students.set()
await sql`INSERT INTO students (student_id, name, class) VALUES (${student_id}, ${name}, ${className})`;

// Thay vì storage.students.get()
const result = await sql`SELECT * FROM students WHERE student_id = ${student_id}`;
```

#### 4. Tạo tables (chạy 1 lần)
Xem schema tại: `server/database.js`

---

## 🐛 Troubleshooting

### Lỗi: "Module not found: cors"
```bash
cd e:\STEM
npm install cors
vercel --prod
```

### Lỗi: "Serverless Function failed"
- Check logs: `vercel logs`
- Test local: `vercel dev`

### API trả về 404
- Check `vercel.json` routing config
- Ensure `/api` prefix trong URL

### Data bị mất
- ✅ Đúng rồi! In-memory storage sẽ mất data
- 💡 Upgrade lên Vercel Postgres (xem bên trên)

---

## 📊 So sánh với Railway/Render

| Feature | Vercel | Railway | Render |
|---------|--------|---------|--------|
| Setup Time | ⚡ 2 phút | 🔥 3 phút | 🐌 5 phút |
| SQLite Support | ❌ Không | ✅ Có | ✅ Có |
| Free Tier | ✅ Generous | ✅ $5/tháng | ✅ Free |
| Cold Start | ~300ms | ~1s | ~1 phút |
| Best For | Frontend + Serverless | Fullstack + DB | Free hosting |

**Kết luận:** 
- Dùng **Vercel** nếu: Demo nhanh, không cần persistent data
- Dùng **Railway** nếu: Cần SQLite, production thực tế
- Dùng **Render** nếu: Hoàn toàn miễn phí, không vấn đề cold start

---

## ✅ Checklist Deploy

- [x] Tạo `vercel.json`
- [x] Tạo `api/server.js`
- [x] Tạo `package.json` (root)
- [x] Tạo `.vercelignore`
- [ ] Run `npm install`
- [ ] Run `vercel login`
- [ ] Run `vercel --prod`
- [ ] Test URL production
- [ ] (Optional) Setup custom domain

---

## 🎓 Kết luận

Setup hiện tại cho phép bạn deploy **ngay lập tức** để demo/test.

Khi chuyển sang production thực tế (nhiều học sinh, lưu data lâu dài), upgrade lên:
1. ✅ **Vercel Postgres** (easy, integrated)
2. ✅ **Supabase** (PostgreSQL + Realtime)
3. ✅ **PlanetScale** (MySQL serverless)

Hoặc chuyển sang **Railway/Render** để giữ nguyên SQLite.

Good luck! 🚀
