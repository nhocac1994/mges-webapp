# 🚀 HƯỚNG DẪN CHẠY FRONTEND

## ⚡ Quick Start

### Bước 1: Cài đặt dependencies

```bash
cd frontend
npm install
```

### Bước 2: Cấu hình API URL

File `.env.local` đã được tạo với:
```env
NEXT_PUBLIC_API_URL=http://localhost:55777
```

Nếu backend chạy trên VPS, cập nhật:
```env
NEXT_PUBLIC_API_URL=http://14.225.206.163:55777
```

### Bước 3: Chạy Frontend

```bash
npm run dev
```

Frontend sẽ chạy trên: `http://localhost:3000`

---

## 🧪 Test kết nối

### 1. Mở browser

Truy cập: `http://localhost:3000`

### 2. Kiểm tra các trang

- **Trang chủ**: `http://localhost:3000`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Danh sách Issues**: `http://localhost:3000/issues`
- **Tạo Issue mới**: `http://localhost:3000/issues/new`

### 3. Test API từ browser console

Mở Developer Tools (F12) và chạy:

```javascript
// Test health check
fetch('http://localhost:55777/api/health')
  .then(r => r.json())
  .then(console.log)

// Test issues
fetch('http://localhost:55777/api/issues')
  .then(r => r.json())
  .then(console.log)

// Test dashboard stats
fetch('http://localhost:55777/api/dashboard/stats')
  .then(r => r.json())
  .then(console.log)
```

---

## 🔧 Troubleshooting

### Lỗi: "Cannot connect to API"

1. **Kiểm tra backend đang chạy:**
   ```bash
   curl http://localhost:55777/api/health
   ```

2. **Kiểm tra CORS:**
   - Backend phải có `CORS_ORIGIN=*` hoặc cho phép `http://localhost:3000`

3. **Kiểm tra file `.env.local`:**
   - Đảm bảo `NEXT_PUBLIC_API_URL=http://localhost:55777`
   - Restart Next.js sau khi thay đổi `.env.local`

### Lỗi: "Module not found"

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "Port 3000 already in use"

```bash
# Đổi port
PORT=3001 npm run dev
```

---

## 📋 Checklist

Trước khi chạy:

- [ ] Backend đang chạy trên `http://localhost:55777`
- [ ] File `.env.local` đã tạo với đúng API URL
- [ ] Đã chạy `npm install`
- [ ] Database `appweb` đã có bảng `MaintenanceIssues`

---

## 🎯 Các tính năng để test

1. **Dashboard** - Xem KPIs và biểu đồ
2. **Danh sách Issues** - Xem, filter, search issues
3. **Tạo Issue mới** - Form nhập liệu với upload ảnh
4. **Chi tiết Issue** - Xem thông tin chi tiết

---

## 💡 Lưu ý

- Frontend chạy trên port **3000** (Next.js default)
- Backend chạy trên port **55777**
- Đảm bảo cả 2 đều chạy cùng lúc
- Nếu backend chạy trên VPS, cập nhật `.env.local` với IP VPS

