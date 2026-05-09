# Instruksi Implementasi: Visibilitas Penuh Laporan untuk Super Admin

Dokumen ini berisi panduan dan instruksi teknis mendetail bagi AI Assistant untuk mengimplementasikan fitur **"Visibilitas Penuh Laporan pada Dashboard Super Admin"**.

## 1. Deskripsi Fitur

Pada dashboard Super Admin, entitas dengan role `SUPER_ADMIN` harus memiliki hak istimewa (privilege) tertinggi dan jangkauan penglihatan terluas. Secara spesifik, Super Admin dapat melihat:

- **Seluruh laporan bimbingan (visits/reports) yang masuk ke semua Guru BK (Admin).**
- Berbeda dengan Guru BK biasa yang hanya dapat melihat laporan pasien/siswa yang ditugaskan kepada mereka sendiri, Super Admin dapat memantau seluruh aktivitas.

## 2. Struktur Proyek Terkait

- **Database Schema**: `prisma/schema.prisma` (Model: `Visit`, `User`, role: `SUPER_ADMIN`, `ADMIN`)
- **API Endpoint**: `app/api/visits/route.ts` (GET request untuk mengambil daftar visit/laporan)
- **Frontend Dashboard**: `components/dashboard/VisitManagement.tsx` atau komponen terkait di `components/dashboard/`
- **RBAC (Role-Based Access Control)**: `lib/permissions.ts` atau middleware terkait otorisasi.

## 3. Langkah-langkah Implementasi

### A. Modifikasi API Endpoint (Backend)

Buka file yang menangani pengambilan data kunjungan/laporan, misalnya `app/api/visits/route.ts`.

1. **Periksa Role Pengguna (Authentication & Authorization):**
   - Ambil data token/sesi pengguna yang sedang login (dapat menggunakan JWT verifier dari `lib/jwt.ts` atau yang serupa).
   - Identifikasi apakah `role` pengguna adalah `SUPER_ADMIN` atau `ADMIN` (Guru BK).

2. **Sesuaikan Logika Query Database (Prisma):**
   - Jika `role === 'SUPER_ADMIN'`: Lakukan query Prisma tanpa memfilter `teacherId` atau `adminId`. Ambil seluruh data `Visit`.
     ```typescript
     // Contoh logika untuk disesuaikan
     if (userRole === "SUPER_ADMIN") {
       visits = await prisma.visit.findMany({
         include: { student: true, teacher: true },
         orderBy: { createdAt: "desc" },
       });
     }
     ```
   - Jika `role === 'ADMIN'`: Tetap gunakan logika saat ini, yaitu memfilter `Visit` berdasarkan `teacherId/adminId` pengguna yang sedang login.

### B. Pembaruan Komponen Frontend

Buka komponen manajemen kunjungan di Dashboard, kemungkinan `components/dashboard/VisitManagement.tsx`.

1. **Penyesuaian UI Table/Daftar Kunjungan:**
   - Untuk Super Admin, tabel perlu menampilkan kolom tambahan berupa **"Guru BK Penanggung Jawab"** agar Super Admin tahu laporan tersebut ditangani oleh siapa.
   - Kolom ini dapat disembunyikan jika yang login hanyalah Guru BK biasa.
2. **Penambahan Fitur Filter (Opsional namun sangat disarankan):**
   - Tambahkan dropdown filter berdasarkan "Nama Guru BK" khusus untuk tampilan Super Admin. Hal ini akan memudahkan Super Admin dalam mengkategorisasikan laporan.

### C. Penyesuaian RBAC (Jika Diperlukan)

1. Pastikan perizinan di tingkat UI untuk melihat tab atau tombol terkait fitur laporan sudah dapat diakses oleh `SUPER_ADMIN`.
2. Jika ada `lib/permissions.ts`, pastikan aksi seperti `VIEW_ALL_REPORTS` telah dimasukkan ke dalam daftar permissions milik `SUPER_ADMIN`.

## 4. Kriteria Penerimaan (Acceptance Criteria)

1. **Guru BK (Admin)**: Saat login, hanya melihat daftar laporannya sendiri di Dashboard.
2. **Super Admin**: Saat login, melihat Halaman Dashboard yang memuat semua laporan dari semua Guru BK.
3. Keamanan Endpoint tetap terjaga: pengguna tidak bisa memanipulasi parameter query API untuk melihat laporan yang bukan haknya kecuali ia memiliki role `SUPER_ADMIN`.

## 5. Instruksi Khusus untuk AI

- Harap periksa struktur model Prisma (`prisma/schema.prisma`) terlebih dahulu, pastikan penamaan field relasi (misalnya `teacherId`, `adminId`, atau `userId`) sudah tepat sebelum memodifikasi `route.ts`.
- Jika menambahkan field pada tabel antarmuka pengguna (UI), gunakan komponen dari library _UI_ yang sudah ada (seperti `components/ui/table.tsx` dsb).
- Pastikan ada penanganan error (_error handling_) jika terjadi in-konsistensi data di backend.

---

**Gunakan dokumen ini sebagai satu kesatuan konteks (_context_) utama ketika mulai mengubah source code pada backend dan frontend.**
