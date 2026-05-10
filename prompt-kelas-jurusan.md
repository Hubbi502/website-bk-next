# Prompt: Implementasi Tabel Kelas dan Jurusan (Relasi Database)

**Konteks Proyek:**
Saya memiliki proyek Next.js (App Router) menggunakan Prisma ORM (PostgreSQL), Tailwind CSS, dan komponen dari shadcn/ui.

**Kondisi Saat Ini:**
Saat ini, data "kelas" hanya disimpan sebagai tipe data `String` di model `Student` (`class String`) dan `Visit` (`class String?`). Saya ingin menormalisasi database ini.

**Tugas Utama:**
Saya ingin Anda membantu saya membuat tabel **Kelas (Class)** dan **Jurusan (Major)** yang saling berelasi, serta merelasikannya ke tabel pengguna (Student) dan kunjungan (Visit). Koordinator (Superadmin) harus bisa melakukan operasi CRUD pada data Kelas dan Jurusan.

Tolong berikan instruksi implementasi langkah demi langkah untuk poin-poin berikut:

## 1. Pembaruan Schema Prisma (`prisma/schema.prisma`)
Buat dan modifikasi model Prisma agar sesuai dengan struktur berikut:
- **Model `Major` (Jurusan):**
  - Kolom: `id`, `name` (misal: "Rekayasa Perangkat Lunak"), `code` (misal: "RPL"), `createdAt`, `updatedAt`.
  - Relasi: Satu Jurusan memiliki banyak Kelas (`classes Class[]`).
- **Model `Class` (Kelas):**
  - Kolom: `id`, `name` (misal: "XII RPL 1"), `grade` (Tingkat, misal: 10, 11, 12), `majorId` (Foreign key ke Major), `createdAt`, `updatedAt`.
  - Relasi: Milik satu Jurusan (`major Major`). Memiliki banyak Student (`students Student[]`) dan Visit (`visits Visit[]`).
- **Model `Student` & `Visit`:**
  - Ubah field `class String` menjadi relasi ke model `Class` (`classId String`, `class Class @relation(...)`).
- **Model `Admin`:**
  - Ubah field `assignedClasses String[]` agar bisa merelasikan guru BK ke spesifik kelas (bisa menggunakan relasi implicit m-to-n atau field array of string ID kelas).
- *Catatan:* Berikan perintah migrasi Prisma yang tepat (misal: panduan cara menangani data lama / string sebelum migrasi ke relasi ID).

## 2. Pembuatan Backend API (Next.js App Router)
Buat REST API Routes untuk CRUD:
- `app/api/majors/route.ts` dan `app/api/majors/[id]/route.ts`
- `app/api/classes/route.ts` dan `app/api/classes/[id]/route.ts`
- **Syarat:** Pastikan API endpoints ini memiliki pengamanan otentikasi/otorisasi yang membatasi akses edit/hapus hanya untuk `role: SUPER_ADMIN` (Koordinator).

## 3. Pembaruan Komponen Frontend (UI Dashboard)
Berikan panduan dan kode lengkap untuk antarmuka pengguna:
- Buat komponen **Manajemen Jurusan** (`MajorManagement.tsx`) dan **Manajemen Kelas** (`ClassManagement.tsx`).
- Komponen ini harus menampilkan tabel data menggunakan shadcn/ui (`Table`).
- Sediakan tombol Tambah, Edit, dan Hapus yang membuka Modal/Dialog (`Dialog` shadcn/ui).
- Saat membuat atau mengedit Kelas, sediakan `Select` dropdown (shadcn/ui) untuk memilih Jurusan (Major) yang sudah ada di database.
- Gunakan `useToast` untuk memberikan notifikasi keberhasilan atau kegagalan aksi.

Tolong berikan kode lengkap dan best practice untuk mengimplementasikannya secara efisien di Next.js App Router.
