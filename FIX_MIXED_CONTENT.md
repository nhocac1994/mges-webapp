# 🔧 SỬA LỖI MIXED CONTENT VÀ API 500

## ❌ Vấn đề

1. **Mixed Content Error**: Vercel (HTTPS) không thể load images từ HTTP backend
2. **API 500 Error**: Lỗi khi gọi `/api/issues`

---

## ✅ Giải pháp đã áp dụng

### 1. Tạo Image Proxy Route

**File:** `app/api/uploads/[...path]/route.ts`

- Proxy tất cả image requests qua Next.js
- Client gọi: `/api/uploads/uploads/issue-xxx.webp`
- Next.js proxy: `http://14.225.206.163:55444/uploads/issue-xxx.webp`
- Trả về image với proper headers

### 2. Cập nhật Image URLs

**File:** `app/issues/[id]/page.tsx`

**Trước:**
```jsx
src={`${process.env.NEXT_PUBLIC_API_URL}${issue.ImageUrl}`}
// → http://14.225.206.163:55444/uploads/... (HTTP - bị chặn)
```

**Sau:**
```jsx
src={`/api/uploads${issue.ImageUrl}`}
// → /api/uploads/uploads/... (HTTPS - OK)
```

---

## 🔍 Debug API 500 Error

### Kiểm tra Environment Variable trong Vercel:

1. Vào **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Kiểm tra: `NEXT_PUBLIC_API_URL`
3. **Giá trị đúng:**
   ```
   NEXT_PUBLIC_API_URL=http://14.225.206.163:55444
   ```
   (hoặc port 55777 nếu backend chạy trên port đó)

### Kiểm tra Backend:

**Trên VPS, test backend:**
```bash
curl http://14.225.206.163:55444/api/health
curl http://14.225.206.163:55444/api/issues
```

**Nếu lỗi:**
- Backend chưa chạy
- Port chưa mở firewall
- Port sai (55444 vs 55777)

### Kiểm tra Logs:

**Trong Vercel:**
1. Vào **Deployments** → Chọn deployment mới nhất
2. Click **Functions** tab
3. Xem logs của `/api/issues` function
4. Sẽ thấy error chi tiết

**Trong code:**
- Đã thêm `console.error` chi tiết trong API routes
- Logs sẽ hiển thị: API_URL, error message, stack trace

---

## 📋 Checklist

- [ ] Environment Variable `NEXT_PUBLIC_API_URL` đã set trong Vercel
- [ ] Port đúng (55444 hoặc 55777)
- [ ] Backend đang chạy trên VPS
- [ ] Firewall đã mở port backend
- [ ] Test backend trực tiếp: `curl http://14.225.206.163:55444/api/health`
- [ ] Redeploy sau khi thay đổi Environment Variable

---

## 🚀 Sau khi fix

1. **Images sẽ load được** - Không còn Mixed Content error
2. **API sẽ hoạt động** - Nếu backend đang chạy và port đúng
3. **Tất cả requests qua HTTPS** - An toàn hơn

---

## 🆘 Nếu vẫn lỗi

### API 500 vẫn còn:

1. **Kiểm tra backend logs:**
   ```bash
   # Trên VPS
   # Xem logs của backend Node.js
   ```

2. **Test trực tiếp backend:**
   ```bash
   curl -v http://14.225.206.163:55444/api/issues
   ```

3. **Kiểm tra CORS trong backend:**
   - Backend phải cho phép requests từ Vercel domain
   - Hoặc dùng `*` (đã có trong code)

4. **Kiểm tra port:**
   - Backend chạy trên port nào?
   - Environment Variable có đúng port không?

### Images vẫn không load:

1. **Kiểm tra image path:**
   - `issue.ImageUrl` có đúng format không? (ví dụ: `/uploads/issue-xxx.webp`)
   - Test: `/api/uploads/uploads/issue-xxx.webp`

2. **Kiểm tra backend serve images:**
   ```bash
   curl http://14.225.206.163:55444/uploads/issue-xxx.webp
   ```

3. **Kiểm tra Next.js logs:**
   - Xem logs của `/api/uploads/[...path]` function trong Vercel

---

## 📝 Lưu ý

- **Port 55444 vs 55777**: Cần xác nhận backend đang chạy trên port nào
- **Environment Variable**: Phải redeploy sau khi thay đổi
- **Image caching**: Images được cache 1 năm (max-age=31536000)

