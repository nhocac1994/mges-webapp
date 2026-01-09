# 🔧 FIX: Token không được forward đến backend

## ❌ Vấn đề

Sau khi đăng nhập, không thể xem được danh sách issues. API trả về empty data:
```json
{
  "data": [],
  "totalPages": 0,
  "currentPage": 1,
  "totalItems": 0
}
```

**Nguyên nhân:**
- Frontend gửi request với `Authorization: Bearer <token>` header
- Next.js API routes (proxy) **KHÔNG forward** Authorization header đến backend
- Backend không nhận được token → Trả về 401 hoặc filter sai

---

## ✅ Giải pháp

Đã sửa tất cả API routes để **forward Authorization header**:

### Files đã sửa:

1. **`app/api/issues/route.ts`**
   - GET: Forward Authorization header
   - POST: Forward Authorization header (cả FormData và JSON)

2. **`app/api/dashboard/stats/route.ts`**
   - GET: Forward Authorization header

3. **`app/api/dashboard/by-area/route.ts`**
   - GET: Forward Authorization header

4. **`app/api/dashboard/by-department/route.ts`**
   - GET: Forward Authorization header

5. **`app/api/issues/[id]/route.ts`**
   - GET: Forward Authorization header

---

## 🔍 Code Pattern

Tất cả API routes đều sử dụng pattern này:

```typescript
// Forward Authorization header từ request gốc
const authHeader = request.headers.get('authorization')
const headers: HeadersInit = {
  'Content-Type': 'application/json',
}
if (authHeader) {
  headers['Authorization'] = authHeader
}

const response = await fetch(`${API_URL}/api/...`, {
  method: 'GET',
  headers, // Include Authorization header
  signal: AbortSignal.timeout(30000),
})
```

---

## ✅ Test

Sau khi sửa:

1. **Đăng nhập** với bất kỳ user nào
2. **Xem danh sách Issues** → Phải hiển thị data
3. **Xem Dashboard** → Phải hiển thị stats đúng
4. **Kiểm tra filter theo department:**
   - Admin: Xem tất cả
   - User: Chỉ xem department của mình

---

## 🐛 Debug

Nếu vẫn không hoạt động:

1. **Kiểm tra browser console:**
   - Xem có log `Forwarding request with auth: true` không
   - Xem có lỗi 401 không

2. **Kiểm tra backend logs:**
   - Xem có nhận được token không
   - Xem có verify token thành công không

3. **Kiểm tra token trong localStorage:**
   ```javascript
   localStorage.getItem('token')
   ```

4. **Test API trực tiếp:**
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:55777/api/issues
   ```

---

## 📝 Lưu ý

- **Uploads route** (`/api/uploads/[...path]`) không cần authentication (public images)
- **Auth routes** (`/api/auth/*`) không cần forward token (chúng tự xử lý)
- Tất cả **protected routes** đều cần forward token

