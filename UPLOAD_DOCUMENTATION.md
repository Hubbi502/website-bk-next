# Sistem Upload Gambar Artikel

## Deskripsi
Sistem ini memungkinkan admin untuk mengupload gambar artikel langsung ke server, tanpa perlu menggunakan URL eksternal.

## Fitur
- ✅ Upload gambar langsung dari komputer
- ✅ Preview gambar sebelum publish
- ✅ Validasi tipe file (JPG, PNG, WEBP, GIF)
- ✅ Validasi ukuran maksimal 5MB
- ✅ Nama file unik dengan timestamp
- ✅ Gambar tersimpan di `/public/uploads/articles/`

## Cara Penggunaan

### 1. Menambah Artikel Baru
1. Buka Dashboard → Artikel Management
2. Klik tombol "Tambah Artikel"
3. Isi form artikel (Judul, Ringkasan, Konten)
4. Klik "Upload Gambar" dan pilih file gambar dari komputer
5. Preview gambar akan muncul otomatis
6. Klik "Publikasikan Artikel" untuk menyimpan

### 2. Mengedit Artikel
1. Klik tombol Edit pada artikel yang ingin diubah
2. Form akan terisi dengan data artikel lama termasuk gambar lama
3. Untuk mengganti gambar, upload gambar baru
4. Klik "Perbarui Artikel" untuk menyimpan perubahan

## Struktur File

```
public/
└── uploads/
    └── articles/
        ├── .gitkeep
        └── [timestamp]-[filename].jpg
```

## API Endpoints

### POST /api/upload
Upload gambar artikel ke server.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData dengan field "file"

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/articles/1702123456789-my-image.jpg",
    "fileName": "1702123456789-my-image.jpg"
  }
}
```

**Validasi:**
- Tipe file: image/jpeg, image/jpg, image/png, image/webp, image/gif
- Ukuran maksimal: 5MB

## Catatan Penting

1. **Folder uploads tidak ter-commit ke Git**
   - File `.gitignore` sudah dikonfigurasi untuk mengignore `/public/uploads/`
   - Hanya `.gitkeep` yang ter-commit untuk menjaga struktur folder

2. **Backup gambar secara terpisah**
   - Karena gambar tidak ter-commit, pastikan untuk backup folder uploads secara manual atau menggunakan sistem backup lain

3. **Deployment**
   - Pastikan folder `/public/uploads/articles/` ada dan memiliki permission write
   - Untuk production, pertimbangkan menggunakan CDN atau cloud storage (AWS S3, Cloudinary, dll)

## Troubleshooting

### Error: "Gagal mengupload gambar"
- Periksa apakah folder `/public/uploads/articles/` ada
- Periksa permission write pada folder tersebut
- Periksa ukuran dan tipe file

### Gambar tidak tampil di artikel
- Periksa path gambar di database (harus dimulai dengan `/uploads/articles/`)
- Pastikan file gambar masih ada di folder uploads

## Pengembangan Selanjutnya

Untuk production yang lebih robust, pertimbangkan:
- [ ] Integrasi dengan cloud storage (AWS S3, Cloudinary)
- [ ] Image optimization dan resize otomatis
- [ ] WebP conversion untuk performa lebih baik
- [ ] CDN untuk loading gambar lebih cepat
- [ ] Batch delete untuk hapus gambar yang tidak terpakai
