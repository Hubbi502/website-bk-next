# Ringkasan Flow Program - Sahabat BK (Sistem Bimbingan dan Konseling)

## 📋 Overview Aplikasi

Sahabat BK adalah aplikasi web berbasis **Next.js 16** yang dirancang untuk memfasilitasi layanan bimbingan dan konseling di sekolah. Aplikasi ini memiliki 3 jenis pengguna utama:

1. **Pengunjung Umum** - Dapat melihat artikel dan membuat kunjungan tanpa login
2. **Siswa** - Dapat login untuk mengelola jadwal konseling dan berkomentar
3. **Admin/Guru BK** - Dapat mengelola artikel, kunjungan, dan admin lain (Super Admin)

---

## 🏗️ Teknologi Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI Components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL dengan Prisma ORM
- **Authentication**: Session-based (menggunakan token sederhana)
- **File Upload**: File system untuk artikel images

---

## 📊 Database Schema (Prisma)

### Models:
1. **Admin** - Data guru BK dengan role (ADMIN/SUPER_ADMIN)
2. **Student** - Data murid dengan NISN sebagai username
3. **Article** - Artikel bimbingan konseling
4. **Comment** - Komentar pada artikel (bisa dari siswa atau anonim)
5. **Visit** - Pengajuan kunjungan konseling

### Enums:
- **AdminRole**: ADMIN, SUPER_ADMIN
- **VisitStatus**: PENDING, APPROVED, COMPLETED, CANCELLED

---

## 🔄 Flow Utama Aplikasi

## 1. Flow Pengunjung Umum

```
┌─────────────────┐
│  Landing Page   │
│   (/)           │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌─────────┐
│About│   │Articles │
└─────┘   └────┬────┘
               │
          ┌────┴─────┐
          │          │
          ▼          ▼
    ┌──────────┐  ┌────────┐
    │  Detail  │  │Comment │
    │ Artikel  │  │(Anonim)│
    └──────────┘  └────────┘
```

### Fitur:
- ✅ Melihat landing page dengan hero banner
- ✅ Melihat daftar artikel (halaman `/articles`)
- ✅ Membaca detail artikel (`/article-detail?id=xxx`)
- ✅ Berkomentar pada artikel (anonim tanpa login)
- ✅ Melihat halaman About

---

## 2. Flow Siswa/Murid

```
┌──────────────┐
│ Login Siswa  │
│ (/student-   │
│   login)     │
└──────┬───────┘
       │
       │ Input: NISN & Password
       ▼
┌──────────────┐
│  Validasi    │
│  Auth API    │
└──────┬───────┘
       │
       ├──── Gagal ──→ Kembali Login
       │
       └──── Berhasil
              │
              ▼
    ┌──────────────────┐
    │ Set Session/Token│
    └────────┬─────────┘
             │
         ┌───┴────┐
         │        │
         ▼        ▼
    ┌────────┐  ┌──────────┐
    │Schedule│  │ Comment  │
    │  Page  │  │ (Login)  │
    └───┬────┘  └──────────┘
        │
    ┌───┴───┐
    │       │
    ▼       ▼
┌────────┐ ┌──────────────┐
│ Lihat  │ │ Buat Kunjungan│
│Kunjung │ │     Baru      │
│  an    │ └───────┬───────┘
└────────┘         │
                   │ Input: Tanggal, Waktu, Alasan
                   ▼
            ┌──────────────┐
            │ POST /api/   │
            │   visits     │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │ Status:      │
            │   PENDING    │
            └──────────────┘
```

### Fitur Siswa:
- ✅ Login dengan NISN & Password
- ✅ Melihat jadwal kunjungan konseling
- ✅ Membuat pengajuan kunjungan baru
- ✅ Melihat status kunjungan (PENDING, APPROVED, COMPLETED, CANCELLED)
- ✅ Berkomentar pada artikel dengan nama siswa (authenticated)

### API Endpoints untuk Siswa:
- `POST /api/auth/student/login` - Login siswa
- `POST /api/auth/student/logout` - Logout siswa
- `GET /api/visits?studentId=xxx` - Lihat kunjungan siswa
- `POST /api/visits` - Buat kunjungan baru

---

## 3. Flow Admin/Guru BK

```
┌──────────────┐
│ Login Admin  │
│  (/login)    │
└──────┬───────┘
       │
       │ Input: Username & Password
       ▼
┌──────────────┐
│  Validasi    │
│  Auth API    │
└──────┬───────┘
       │
       ├──── Gagal ──→ Kembali Login
       │
       └──── Berhasil
              │
              ▼
    ┌──────────────────┐
    │     Dashboard    │
    │   (/dashboard)   │
    └────────┬─────────┘
             │
      ┌──────┴──────────────┬──────────┐
      │                     │          │
      ▼                     ▼          ▼
┌──────────┐         ┌──────────┐  ┌──────────┐
│ Overview │         │ Artikel  │  │Kunjungan │
└──────────┘         └────┬─────┘  └────┬─────┘
                          │             │
                    ┌─────┴────┐    ┌───┴────┐
                    │          │    │        │
                    ▼          ▼    ▼        ▼
              ┌────────┐  ┌──────┐ ┌─────┐ ┌──────┐
              │ Tambah │  │ Edit │ │Review│ │Update│
              │Artikel │  │Delete│ │Status│ │Notes │
              └────────┘  └──────┘ └─────┘ └──────┘
```

### Fitur Admin (ADMIN role):
- ✅ Login ke dashboard
- ✅ Melihat overview statistik
- ✅ **Mengelola Artikel**:
  - Create artikel baru (dengan upload gambar)
  - Edit artikel existing
  - Hapus artikel
- ✅ **Mengelola Kunjungan**:
  - Melihat semua kunjungan
  - Filter berdasarkan status
  - Approve/Reject kunjungan
  - Update status ke COMPLETED
  - Menambahkan notes pada kunjungan
- ❌ Tidak bisa mengelola admin lain

### Fitur Super Admin (SUPER_ADMIN role):
- ✅ Semua fitur Admin
- ✅ **Mengelola Admin**:
  - Melihat daftar semua admin
  - Tambah admin baru (dengan role ADMIN/SUPER_ADMIN)
  - Edit admin (update name, username, password, role)
  - Hapus admin (tidak bisa hapus diri sendiri)

### API Endpoints untuk Admin:

#### Authentication:
- `POST /api/auth/admin/login` - Login admin
- `POST /api/auth/admin/logout` - Logout admin

#### Articles (Admin & Super Admin):
- `GET /api/articles` - List semua artikel
- `GET /api/articles/[id]` - Detail artikel
- `POST /api/articles` - Create artikel baru
- `PUT /api/articles/[id]` - Update artikel
- `DELETE /api/articles/[id]` - Hapus artikel

#### Visits (Admin & Super Admin):
- `GET /api/visits` - List semua kunjungan
- `GET /api/visits/[id]` - Detail kunjungan
- `PUT /api/visits/[id]` - Update kunjungan (status, notes)
- `DELETE /api/visits/[id]` - Hapus kunjungan

#### Admins (Super Admin Only):
- `GET /api/admins` - List semua admin
- `GET /api/admins/[id]` - Detail admin
- `POST /api/admins` - Create admin baru
- `PUT /api/admins/[id]` - Update admin
- `DELETE /api/admins/[id]` - Hapus admin

#### Upload:
- `POST /api/upload` - Upload gambar artikel

---

## 🔐 Sistem Autentikasi & Autorisasi

### Autentikasi:
1. **Admin**: Username & Password (hashed dengan bcryptjs)
2. **Student**: NISN & Password (hashed dengan bcryptjs)
3. Token disimpan di session/localStorage
4. Middleware di API routes untuk validasi token

### Autorisasi (RBAC - Role-Based Access Control):
```
Permission System:
├── Super Admin
│   ├── ✅ Kelola Admin (CRUD)
│   ├── ✅ Kelola Artikel (CRUD)
│   └── ✅ Kelola Kunjungan (CRUD + Review)
│
├── Admin
│   ├── ❌ Kelola Admin
│   ├── ✅ Kelola Artikel (CRUD)
│   └── ✅ Kelola Kunjungan (CRUD + Review)
│
└── Student
    ├── ❌ Akses Dashboard
    ├── ✅ Lihat Artikel & Comment
    └── ✅ Buat & Lihat Kunjungan sendiri
```

**Permission Helper Functions** (`lib/permissions.ts`):
- `isSuperAdmin()` - Check super admin
- `isAdmin()` - Check admin atau super admin
- `hasPermission()` - Check permission spesifik
- `canManageAdmins()` - Hanya super admin
- `canManageArticles()` - Admin & super admin
- `canManageVisits()` - Admin & super admin

---

## 📁 Struktur Folder Penting

```
website-bk/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── about/page.tsx            # Halaman About
│   ├── articles/page.tsx         # List artikel
│   ├── article-detail/page.tsx   # Detail artikel
│   ├── schedule/page.tsx         # Jadwal siswa (protected)
│   ├── login/page.tsx            # Login admin
│   ├── student-login/page.tsx    # Login siswa
│   ├── dashboard/page.tsx        # Dashboard admin (protected)
│   └── api/                      # API Routes
│       ├── auth/                 # Authentication endpoints
│       ├── articles/             # Article CRUD
│       ├── visits/               # Visit CRUD
│       ├── admins/               # Admin management (Super Admin)
│       └── upload/               # File upload
│
├── components/                   # React Components
│   ├── Navbar.tsx                # Navigation bar
│   ├── ArticleCard.tsx           # Artikel card
│   ├── CommentSection.tsx        # Comment form & list
│   ├── StudentAuthModal.tsx      # Modal login siswa
│   └── dashboard/                # Dashboard components
│       ├── DashboardLayout.tsx   # Layout dashboard
│       ├── DashboardOverview.tsx # Overview stats
│       ├── ArticleManagement.tsx # Kelola artikel
│       ├── VisitManagement.tsx   # Kelola kunjungan
│       └── AdminManagement.tsx   # Kelola admin (Super Admin)
│
├── lib/                          # Utilities & Helpers
│   ├── prisma.ts                 # Prisma client instance
│   ├── permissions.ts            # RBAC permission helpers
│   ├── utils.ts                  # General utilities
│   ├── articleStorage.ts         # Article storage logic
│   └── visitStorage.ts           # Visit storage logic
│
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Seed data
│   └── migrations/               # Database migrations
│
└── public/
    └── uploads/
        └── articles/             # Uploaded artikel images
```

---

## 🔄 Flow Data Utama

### 1. Artikel Flow
```
Admin Dashboard
    │
    ├─→ Buat Artikel
    │   └─→ Upload Gambar (/api/upload)
    │       └─→ Save to /public/uploads/articles/
    │           └─→ POST /api/articles
    │               └─→ Prisma.article.create()
    │                   └─→ Article tersimpan di DB
    │
    └─→ Public View
        └─→ GET /api/articles
            └─→ Tampil di /articles
                └─→ Click artikel
                    └─→ /article-detail?id=xxx
                        └─→ Tampil detail + comments
```

### 2. Kunjungan (Visit) Flow
```
Siswa Login
    │
    └─→ /schedule
        │
        ├─→ Buat Kunjungan Baru
        │   └─→ Input: Tanggal, Waktu, Alasan
        │       └─→ POST /api/visits
        │           └─→ Status: PENDING
        │               └─→ Tersimpan di DB
        │
        └─→ Admin Dashboard
            └─→ Kelola Kunjungan
                │
                ├─→ Review PENDING
                │   └─→ Approve → Status: APPROVED
                │   └─→ Reject → Status: CANCELLED
                │
                └─→ Setelah Konseling
                    └─→ Update Status: COMPLETED
                        └─→ Tambah Notes (opsional)
```

### 3. Comment Flow
```
Artikel Page
    │
    └─→ Comment Section
        │
        ├─→ User Tidak Login
        │   └─→ Input: Nama, Email, Comment
        │       └─→ POST /api/articles/[id]/comments
        │           └─→ Comment anonim tersimpan
        │
        └─→ Student Login
            └─→ Input: Comment (auto ambil nama dari session)
                └─→ POST /api/articles/[id]/comments
                    └─→ Comment dengan studentId tersimpan
```

---

## 🎯 Fitur Keamanan

1. **Password Hashing**: Semua password di-hash dengan bcryptjs
2. **Role-Based Access**: Endpoint dilindungi berdasarkan role
3. **Authorization Header**: Bearer token untuk autentikasi
4. **Protected Routes**: Middleware checking di API routes
5. **Self-deletion Prevention**: Super admin tidak bisa hapus diri sendiri
6. **Input Validation**: Validasi di frontend dan backend
7. **SQL Injection Prevention**: Menggunakan Prisma ORM
8. **File Upload Validation**: Validasi tipe file dan ukuran

---

## 📝 Catatan Penting

### Seed Data untuk Testing:
```typescript
// Super Admin
username: "superadmin"
password: "guru123"
role: SUPER_ADMIN

// Admin
username: "admin1"
password: "guru123"
role: ADMIN

// Student
nisn: "12345678"
password: "siswa123"
```

### Environment Variables Required:
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Commands:
```bash
# Development
npm run dev

# Database
npx prisma migrate dev    # Run migrations
npx prisma generate       # Generate Prisma Client
npx prisma db seed        # Seed database
npx prisma studio         # Open Prisma Studio

# Build
npm run build
npm start
```

---

## 🚀 Flow Deployment

```
1. Setup Database (PostgreSQL)
   │
2. Set Environment Variables
   │
3. Install Dependencies
   └─→ npm install
       │
4. Database Setup
   └─→ npx prisma migrate deploy
       └─→ npx prisma generate
           └─→ npx prisma db seed (optional)
               │
5. Build Application
   └─→ npm run build
       │
6. Start Production
   └─→ npm start
```

---

## 📚 Dokumentasi Tambahan

- **FLOWCHART.md** - Flowchart visual dengan Mermaid
- **RBAC_DOCUMENTATION.md** - Detail sistem Role-Based Access Control
- **UPLOAD_DOCUMENTATION.md** - Dokumentasi file upload system
- **README.md** - Quick start guide

---

## 🔮 Alur Penggunaan Typical

### Scenario 1: Siswa Mau Konseling
1. Siswa buka website
2. Login di `/student-login` dengan NISN
3. Masuk ke `/schedule`
4. Klik "Buat Kunjungan Baru"
5. Isi form: tanggal, waktu, alasan
6. Submit → Status PENDING
7. Tunggu approval dari guru BK
8. Dapat notifikasi/refresh untuk lihat status
9. Jika APPROVED → Datang sesuai jadwal
10. Setelah konseling → Admin ubah status ke COMPLETED

### Scenario 2: Admin Publish Artikel
1. Admin login di `/login`
2. Masuk dashboard → Menu "Kelola Artikel"
3. Klik "Tambah Artikel"
4. Isi: Judul, Excerpt, Konten, Upload Gambar, Kategori
5. Submit → Artikel tersimpan
6. Artikel langsung muncul di halaman `/articles`
7. Siswa/Public bisa baca dan comment

### Scenario 3: Super Admin Kelola Tim
1. Super Admin login
2. Dashboard → Menu "Kelola Admin" (hanya visible untuk Super Admin)
3. Lihat list semua admin + statistik mereka
4. Tambah admin baru → Set role (ADMIN/SUPER_ADMIN)
5. Edit admin existing (update data atau role)
6. Hapus admin yang tidak aktif

---

Dibuat pada: 13 Desember 2025
