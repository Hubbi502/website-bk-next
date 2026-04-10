# ⚠️ PENTING: Instruksi Setelah Implementasi

## Langkah yang Harus Dilakukan

### 1. Jalankan Database Migration
Sebelum menjalankan aplikasi, Anda harus menjalankan migration database terlebih dahulu:

**Windows:**
```bash
# Cara 1: Jalankan file migrate.bat
migrate.bat

# Cara 2: Manual
npx prisma migrate dev --name add_pdf_to_articles
```

**Mac/Linux:**
```bash
npx prisma migrate dev --name add_pdf_to_articles
```

### 2. Generate Prisma Client
Setelah migration berhasil, generate ulang Prisma Client:

```bash
npx prisma generate
```

### 3. Restart Development Server
Jika server sudah berjalan, restart untuk apply changes:

```bash
# Stop server (Ctrl+C)
# Kemudian jalankan lagi:
npm run dev
```

### 4. Test Fitur
1. Login ke dashboard sebagai admin
2. Buka "Artikel Management"
3. Tambah artikel baru dengan upload PDF
4. Lihat artikel di halaman detail
5. Test download PDF

## File yang Telah Dibuat/Dimodifikasi

### Backend
- ✅ `prisma/schema.prisma` - Ditambahkan field pdfUrl dan pdfFileName
- ✅ `app/api/upload-pdf/route.ts` - **NEW** API endpoint untuk upload PDF
- ✅ `app/api/articles/route.ts` - Updated untuk support PDF
- ✅ `app/api/articles/[id]/route.ts` - Updated untuk support PDF

### Frontend
- ✅ `components/dashboard/ArticleManagement.tsx` - Ditambahkan form upload PDF
- ✅ `app/article-detail/page.tsx` - Ditambahkan tombol download PDF

### Documentation
- ✅ `PDF_UPLOAD_DOCUMENTATION.md` - Dokumentasi lengkap fitur PDF
- ✅ `migrate.bat` - Script helper untuk migration di Windows
- ✅ `MIGRATION_INSTRUCTIONS.md` - File ini

## Troubleshooting

### Jika Migration Gagal
```bash
# 1. Cek status migration
npx prisma migrate status

# 2. Jika ada issue, reset database (HATI-HATI: Menghapus semua data!)
npx prisma migrate reset

# 3. Jalankan migration lagi
npx prisma migrate dev --name add_pdf_to_articles
```

### Jika TypeScript Error
```bash
# Restart TypeScript server di VS Code
# Tekan: Ctrl+Shift+P
# Ketik: "TypeScript: Restart TS Server"
```

### Jika Cloudinary Error
Pastikan environment variables sudah diset di `.env`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Selesai! 🎉

Setelah semua langkah di atas selesai, fitur upload dan download PDF pada artikel sudah siap digunakan!

Baca `PDF_UPLOAD_DOCUMENTATION.md` untuk dokumentasi lengkap dan cara penggunaan.
