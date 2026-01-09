# 🚀 DEPLOY FRONTEND LÊN VERCEL

## 📋 Bước 1: Push code lên GitHub

```bash
cd frontend

# Kiểm tra git status
git status

# Add files
git add .

# Commit
git commit -m "Initial commit: Frontend Maintenance System"

# Push lên GitHub
git push -u origin main
```

## 📋 Bước 2: Deploy lên Vercel

### Cách 1: Deploy qua Vercel Dashboard

1. Truy cập: https://vercel.com
2. Đăng nhập bằng GitHub
3. Click **"New Project"**
4. Import repository: `nhocac1994/mges-webapp`
5. Cấu hình:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (nếu repo có cả frontend và backend)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `http://14.225.206.163:55777`
7. Click **"Deploy"**

### Cách 2: Deploy qua Vercel CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Production deploy
vercel --prod
```

## ⚙️ Cấu hình Environment Variables

Trong Vercel Dashboard:
1. Vào **Settings** > **Environment Variables**
2. Thêm:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `http://14.225.206.163:55777`
   - **Environment**: Production, Preview, Development

## 🔧 Cấu hình Custom Domain (Optional)

1. Vào **Settings** > **Domains**
2. Thêm domain của bạn
3. Cấu hình DNS theo hướng dẫn

## ✅ Sau khi deploy

- Frontend sẽ có URL: `https://your-project.vercel.app`
- API sẽ kết nối đến: `http://14.225.206.163:55777`
- Đảm bảo backend đang chạy và mở port 55777

## 🆘 Troubleshooting

### Lỗi: "API URL not found"
- Kiểm tra Environment Variable `NEXT_PUBLIC_API_URL` đã set chưa
- Rebuild project sau khi thêm env variable

### Lỗi: "Cannot connect to API"
- Kiểm tra backend đang chạy trên VPS
- Kiểm tra firewall đã mở port 55777
- Kiểm tra CORS trong backend cho phép domain Vercel

