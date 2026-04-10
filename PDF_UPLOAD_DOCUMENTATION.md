# Dokumentasi Fitur Upload PDF pada Artikel

## Deskripsi
Fitur ini memungkinkan admin untuk menambahkan file PDF sebagai lampiran pada artikel. User dapat mengunduh file PDF tersebut dari halaman detail artikel.

## Fitur
- ✅ Upload file PDF langsung dari dashboard
- ✅ Preview nama file sebelum publish
- ✅ Validasi tipe file (hanya PDF)
- ✅ Validasi ukuran maksimal 10MB
- ✅ PDF tersimpan di Cloudinary
- ✅ Tombol download PDF di halaman artikel
- ✅ PDF bersifat opsional (artikel bisa tanpa PDF)

## Cara Penggunaan

### 1. Menambah Artikel dengan PDF
1. Buka Dashboard → Artikel Management
2. Klik tombol "Tambah Artikel"
3. Isi form artikel (Judul, Ringkasan, Konten, Gambar)
4. **[OPSIONAL]** Scroll ke bagian "File PDF (Opsional)"
5. Klik "Upload PDF" dan pilih file PDF dari komputer
6. Preview nama file akan muncul
7. Klik "Publikasikan Artikel" untuk menyimpan

### 2. Mengedit Artikel dan Menambah/Mengganti PDF
1. Klik tombol Edit pada artikel yang ingin diubah
2. Form akan terisi dengan data artikel lama (termasuk PDF jika ada)
3. Untuk menambah/mengganti PDF, upload file PDF baru
4. Untuk menghapus PDF, klik tombol "Hapus" di preview PDF
5. Klik "Perbarui Artikel" untuk menyimpan perubahan

### 3. User Download PDF
1. Buka halaman detail artikel
2. Jika artikel memiliki PDF, akan muncul card "File PDF Tersedia" di bawah gambar artikel
3. Klik tombol "Download PDF" untuk mengunduh file

## Struktur Database

### Model Article (Updated)
```prisma
model Article {
  id          String   @id @default(cuid())
  title       String
  excerpt     String   @db.Text
  content     String   @db.Text
  image       String
  category    String   @default("General")
  readTime    String   @default("5 min read")
  pdfUrl      String?  // URL file PDF di Cloudinary
  pdfFileName String?  // Nama file PDF asli
  authorId    String
  author      Admin    @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  comments Comment[]

  @@index([authorId])
  @@index([category])
  @@map("articles")
}
```

## API Endpoints

### POST /api/upload-pdf
Upload file PDF ke Cloudinary.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData dengan field "file"

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/.../file.pdf",
    "fileName": "document.pdf",
    "publicId": "website-bk/articles/pdfs/xyz123"
  }
}
```

**Validasi:**
- Tipe file: application/pdf
- Ukuran maksimal: 10MB

### POST /api/articles
Menambah artikel baru (updated untuk support PDF).

**Request Body (Updated):**
```json
{
  "title": "Judul Artikel",
  "excerpt": "Ringkasan",
  "content": "Konten lengkap",
  "image": "https://...",
  "category": "Mental Health",
  "readTime": "5 min read",
  "pdfUrl": "https://res.cloudinary.com/.../file.pdf",  // Opsional
  "pdfFileName": "document.pdf",  // Opsional
  "authorId": "admin-id"
}
```

### PUT /api/articles/[id]
Update artikel (updated untuk support PDF).

**Request Body (Updated):**
```json
{
  "title": "Judul Artikel Updated",
  "excerpt": "Ringkasan Updated",
  "content": "Konten Updated",
  "image": "https://...",
  "category": "Career Guidance",
  "readTime": "7 min read",
  "pdfUrl": "https://res.cloudinary.com/.../file.pdf",  // Opsional
  "pdfFileName": "document.pdf"  // Opsional
}
```

## Migration Database

Untuk menerapkan perubahan schema ke database:

**Windows:**
```bash
# Jalankan file migrate.bat yang sudah disediakan
migrate.bat

# Atau jalankan manual:
npx prisma migrate dev --name add_pdf_to_articles
```

**Mac/Linux:**
```bash
npx prisma migrate dev --name add_pdf_to_articles
```

Setelah migration berhasil:
```bash
npx prisma generate
```

## Catatan Penting

1. **PDF bersifat opsional**
   - Artikel bisa dibuat tanpa PDF
   - Field pdfUrl dan pdfFileName bisa bernilai null

2. **Storage di Cloudinary**
   - PDF disimpan di folder: `website-bk/articles/pdfs/`
   - Menggunakan resource_type: "raw" (bukan "image")
   - Format: PDF

3. **Validasi**
   - Hanya file PDF yang diterima (application/pdf)
   - Maksimal ukuran: 10MB
   - Frontend dan backend melakukan validasi

4. **Update/Delete PDF**
   - PDF lama tidak otomatis terhapus dari Cloudinary saat update artikel
   - Untuk production, pertimbangkan untuk menambahkan cleanup job

5. **Download Button**
   - Tombol download hanya muncul jika artikel memiliki PDF
   - Menggunakan target="_blank" untuk membuka di tab baru
   - Attribute download untuk trigger download

## Troubleshooting

### Error: "Tipe file tidak valid"
- Pastikan file yang diupload adalah PDF
- Cek ekstensi file (.pdf)

### Error: "Ukuran file terlalu besar"
- Maksimal ukuran PDF adalah 10MB
- Compress PDF terlebih dahulu jika terlalu besar

### PDF tidak muncul di artikel
- Periksa apakah pdfUrl tersimpan di database
- Cek console browser untuk error
- Pastikan URL Cloudinary valid dan accessible

### Migration Error
- Pastikan database connection sudah benar
- Cek apakah ada migration yang pending
- Jalankan `npx prisma migrate reset` untuk reset (hati-hati: akan menghapus semua data)

## Pengembangan Selanjutnya

Untuk production yang lebih robust:
- [ ] Auto-delete PDF lama dari Cloudinary saat update
- [ ] Batch cleanup untuk PDF yang tidak terpakai
- [ ] Preview PDF di browser (iframe/PDF viewer)
- [ ] Multiple PDF support
- [ ] PDF compression sebelum upload
- [ ] Analytics tracking untuk download PDF
- [ ] Access control untuk download (login required)
