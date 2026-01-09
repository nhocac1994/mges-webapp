# 🔧 SỬA LỖI 500 VÀ RSC PAYLOAD ERROR

## ❌ Vấn đề

1. **API 500 Error**: Backend không accessible từ Vercel
2. **RSC Payload Failed**: Next.js không thể fetch RSC payload do API route lỗi
3. **ERR_INTERNET_DISCONNECTED**: Network error hoặc backend không accessible

---

## ✅ Giải pháp đã áp dụng

### 1. Cải thiện Error Handling

**Thay đổi:**
- API routes **luôn trả về response hợp lệ** (status 200)
- Trả về **fallback data** thay vì error khi backend lỗi
- Giảm timeout từ 30s xuống 10s để fail nhanh hơn

**Trước:**
```typescript
// Trả về 500 error → RSC payload failed
return NextResponse.json(
  { success: false, message: 'Error' },
  { status: 500 }
)
```

**Sau:**
```typescript
// Trả về fallback data → Page vẫn render được
return NextResponse.json({
  totalReceivedMonth: 0,
  totalPendingMonth: 0,
  // ...
}, { status: 200 })
```

### 2. Fallback Data cho từng API

**Dashboard Stats:**
```typescript
{
  totalReceivedMonth: 0,
  totalPendingMonth: 0,
  totalPendingAll: 0,
  totalCompletedMonth: 0,
}
```

**Issues List:**
```typescript
{
  data: [],
  totalPages: 0,
  currentPage: 1,
  totalItems: 0,
}
```

**Charts Data:**
```typescript
[] // Empty array
```

### 3. Cải thiện Client-side Error Handling

**File:** `app/page.tsx`

- Thêm fallback data trong catch block
- Page vẫn hiển thị được ngay cả khi API lỗi

---

## 🔍 Nguyên nhân

### 1. Backend không accessible từ Vercel

**Kiểm tra:**
```bash
# Test từ máy khác (không phải VPS)
curl http://14.225.206.163:55777/api/health
```

**Nếu lỗi:**
- Backend chưa chạy
- Firewall chưa mở port 55777
- Backend chỉ listen trên localhost (127.0.0.1) thay vì 0.0.0.0

**Giải pháp:**
- Đảm bảo backend listen trên `0.0.0.0:55777`
- Mở firewall port 55777
- Kiểm tra backend đang chạy

### 2. Environment Variable chưa set

**Kiểm tra trong Vercel:**
1. Settings → Environment Variables
2. `NEXT_PUBLIC_API_URL=http://14.225.206.163:55777`
3. Redeploy sau khi thay đổi

### 3. Network timeout

- Vercel có timeout limit
- Backend phản hồi chậm
- **Giải pháp:** Giảm timeout xuống 10s, trả về fallback nhanh hơn

---

## 📋 Checklist

- [x] API routes luôn trả về response hợp lệ
- [x] Fallback data cho tất cả APIs
- [x] Giảm timeout xuống 10s
- [x] Client-side error handling
- [ ] Backend đang chạy và accessible
- [ ] Environment Variable đã set trong Vercel
- [ ] Firewall đã mở port 55777

---

## 🚀 Sau khi fix

1. **Page sẽ luôn render được** - Không còn RSC payload error
2. **Hiển thị fallback data** - Nếu backend không accessible
3. **Error messages rõ ràng** - Trong console logs

---

## 🆘 Nếu vẫn lỗi

### 1. Kiểm tra Backend

**Trên VPS:**
```bash
# Kiểm tra backend đang chạy
netstat -ano | findstr :55777

# Test backend
curl http://localhost:55777/api/health
```

**Từ máy khác:**
```bash
curl http://14.225.206.163:55777/api/health
```

### 2. Kiểm tra Firewall

**Windows Firewall:**
```powershell
# Mở port 55777
New-NetFirewallRule -DisplayName "Maintenance API 55777" -Direction Inbound -LocalPort 55777 -Protocol TCP -Action Allow
```

### 3. Kiểm tra Backend Config

**File:** `backend/app.json`

```json
{
  "Server": {
    "Port": 55777,
    "Host": "0.0.0.0"  // ← Phải là 0.0.0.0, không phải localhost
  }
}
```

### 4. Xem Logs trong Vercel

1. Vào **Deployments** → Chọn deployment
2. Click **Functions** tab
3. Xem logs của API routes
4. Sẽ thấy error chi tiết

---

## 📝 Lưu ý

- **Fallback data** chỉ là tạm thời - Cần fix backend để có data thật
- **Timeout 10s** - Nếu backend chậm, có thể tăng lại
- **Status 200** - Để tránh RSC error, nhưng vẫn log warning trong console

---

## 🎯 Kết quả mong đợi

- ✅ Page load được (không còn RSC error)
- ✅ Hiển thị fallback data (0 hoặc empty)
- ✅ Console logs rõ ràng về lỗi
- ✅ User vẫn có thể navigate (không bị crash)

