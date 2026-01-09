# Frontend - Maintenance System

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Chạy development server:
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Build cho production

```bash
npm run build
npm start
```

## Tính năng

- ✅ Dashboard với KPIs và biểu đồ
- ✅ Danh sách Issues với filter và pagination
- ✅ Form tạo issue mới
- ✅ Responsive design (Mobile + PC)
- ✅ Upload ảnh

## Cấu trúc

- `app/` - Next.js App Router pages
- `components/` - React components
- `lib/` - Utilities và API client

