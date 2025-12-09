# Flowchart Aplikasi Sistem Bimbingan dan Konseling (Sahabat BK)

## 1. Flowchart Siswa/Murid

```mermaid
flowchart TD
    Start([Siswa Buka Website]) --> Home[Landing Page]
    
    Home --> Action{Pilih Menu}
    Action -->|Lihat Artikel| Articles[Halaman Artikel]
    Action -->|Jadwal Konseling| CheckLogin{Sudah Login?}
    Action -->|Login| LoginPage[Halaman Login Siswa]
    
    Articles --> ReadArticle[Baca Artikel]
    ReadArticle --> CommentArticle[Komentar Artikel]
    
    CheckLogin -->|Belum| LoginPage
    CheckLogin -->|Sudah| Schedule[Halaman Schedule]
    
    LoginPage --> InputLogin["Input: NISN & Password"]
    InputLogin --> SubmitLogin[Submit Login]
    SubmitLogin --> ValidateLogin{Validasi}
    ValidateLogin -->|Berhasil| Schedule
    ValidateLogin -->|Gagal| LoginPage
    
    Schedule --> ScheduleAction{Pilih Aksi}
    ScheduleAction -->|Lihat Kunjungan| MyVisits[Daftar Kunjungan Saya]
    ScheduleAction -->|Buat Baru| CreateVisit[Form Pengajuan]
    
    CreateVisit --> FillForm["Isi: Tanggal, Waktu, Alasan"]
    FillForm --> SubmitVisit[Submit Pengajuan]
    SubmitVisit --> Pending[Status: PENDING]
    Pending --> WaitApproval[Tunggu Approval Guru]
    
    MyVisits --> CheckStatus{Cek Status}
    CheckStatus -->|PENDING| StatusPending[Menunggu Persetujuan]
    CheckStatus -->|APPROVED| StatusApproved[Jadwal Dikonfirmasi]
    CheckStatus -->|COMPLETED| StatusCompleted[Konseling Selesai]
    CheckStatus -->|CANCELLED| StatusCancelled[Ditolak/Dibatalkan]
    
    StatusApproved --> Counseling[Datang Konseling]
    Counseling --> Done([Selesai])
    
    %% STYLING
    classDef studentClass fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef processClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef statusClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    
    class Home,Schedule,Articles studentClass
    class LoginPage,CreateVisit,FillForm processClass
    class Pending,StatusPending,StatusApproved,StatusCompleted,StatusCancelled statusClass
```

---

## 2. Flowchart Admin (Guru BK)

```mermaid
flowchart TD
    Start([Admin Login]) --> LoginPage[Halaman Login Admin]
    LoginPage --> InputCred["Input: Username & Password"]
    InputCred --> Validate{Validasi}
    Validate -->|Gagal| LoginPage
    Validate -->|Berhasil| Dashboard[Dashboard]
    
    Dashboard --> Menu{Pilih Menu}
    
    Menu -->|Overview| Overview[Statistik & Ringkasan]
    Menu -->|Artikel| ArticleMenu[Manajemen Artikel]
    Menu -->|Kunjungan| VisitMenu[Manajemen Kunjungan]
    
    ArticleMenu --> ArticleAction{Aksi}
    ArticleAction -->|Create| CreateArticle[Buat Artikel Baru]
    ArticleAction -->|Edit| EditArticle[Pilih Artikel yang Akan Diedit]
    ArticleAction -->|Delete| DeleteArticle[Hapus Artikel]
    
    CreateArticle --> FormArticle["Isi: Judul, Konten, Gambar, Kategori"]
    FormArticle --> SaveArticle[Simpan Artikel]
    SaveArticle --> Published[Artikel Dipublikasi]
    
    EditArticle --> FormEditArticle["Ubah: Judul, Konten, Gambar, Kategori"]
    FormEditArticle --> SaveEditArticle[Simpan Perubahan]
    SaveEditArticle --> ArticleUpdated[Artikel Berhasil Diupdate]
    
    VisitMenu --> VisitList[List Semua Kunjungan]
    VisitList --> FilterVisit{Filter Status}
    
    FilterVisit -->|PENDING| PendingList[Kunjungan Pending]
    FilterVisit -->|APPROVED| ApprovedList[Kunjungan Approved]
    FilterVisit -->|COMPLETED| CompletedList[Kunjungan Selesai]
    
    PendingList --> ReviewVisit[Review Pengajuan]
    ReviewVisit --> Decision{Keputusan}
    Decision -->|Approve| ApproveVisit[Setujui Kunjungan]
    Decision -->|Reject| RejectVisit[Tolak Kunjungan]
    Decision -->|Add Notes| AddNotes[Tambah Catatan]
    
    ApproveVisit --> NotifyStudent[Notifikasi Siswa]
    RejectVisit --> NotifyReject[Notifikasi Penolakan]
    
    ApprovedList --> Counseling[Lakukan Konseling]
    Counseling --> MarkComplete[Tandai Selesai]
    MarkComplete --> AddResult[Tambah Catatan Hasil]
    AddResult --> Completed([Selesai])
    
    %% STYLING
    classDef adminClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef actionClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef statusClass fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    
    class Dashboard,ArticleMenu,VisitMenu adminClass
    class CreateArticle,EditArticle,ReviewVisit,ApproveVisit actionClass
    class Published,ArticleUpdated,NotifyStudent,Completed statusClass
```

---

## 3. Flowchart Super Admin

```mermaid
flowchart TD
    Start([Super Admin Login]) --> LoginPage[Halaman Login Super Admin]
    LoginPage --> InputCred["Input: Username & Password"]
    InputCred --> Validate{Validasi}
    Validate -->|Gagal| LoginPage
    Validate -->|Berhasil| Dashboard[Dashboard Super Admin]
    
    Dashboard --> Menu{Pilih Menu}
    
    Menu -->|Overview| Overview[Statistik & Ringkasan]
    Menu -->|Artikel| ArticleMenu[Manajemen Artikel]
    Menu -->|Kunjungan| VisitMenu[Manajemen Kunjungan]
    Menu -->|Admin| AdminMenu[Manajemen Admin]
    
    %% ARTICLE MANAGEMENT
    ArticleMenu --> ArticleAction{Aksi Artikel}
    ArticleAction -->|Create| CreateArticle[Buat Artikel Baru]
    ArticleAction -->|Edit| EditArticle[Edit Artikel]
    ArticleAction -->|Delete| DeleteArticle[Hapus Artikel]
    
    CreateArticle --> FormArticle["Isi: Judul, Konten, Gambar, Kategori"]
    FormArticle --> SaveArticle[Simpan Artikel]
    SaveArticle --> Published[Artikel Dipublikasi]
    
    %% VISIT MANAGEMENT
    VisitMenu --> VisitList[List Semua Kunjungan]
    VisitList --> FilterVisit{Filter Status}
    
    FilterVisit -->|PENDING| PendingList[Kunjungan Pending]
    FilterVisit -->|APPROVED| ApprovedList[Kunjungan Approved]
    FilterVisit -->|COMPLETED| CompletedList[Kunjungan Selesai]
    
    PendingList --> ReviewVisit[Review Pengajuan]
    ReviewVisit --> Decision{Keputusan}
    Decision -->|Approve| ApproveVisit[Setujui Kunjungan]
    Decision -->|Reject| RejectVisit[Tolak Kunjungan]
    Decision -->|Add Notes| AddNotes[Tambah Catatan]
    
    ApproveVisit --> NotifyStudent[Notifikasi Siswa]
    RejectVisit --> NotifyReject[Notifikasi Penolakan]
    
    ApprovedList --> Counseling[Lakukan Konseling]
    Counseling --> MarkComplete[Tandai Selesai]
    MarkComplete --> AddResult[Tambah Catatan Hasil]
    
    %% ADMIN MANAGEMENT (Exclusive to Super Admin)
    AdminMenu --> AdminAction{Aksi Admin}
    AdminAction -->|Create| CreateAdmin[Buat Admin Baru]
    AdminAction -->|Edit| EditAdmin[Edit Data Admin]
    AdminAction -->|Delete| DeleteAdmin[Hapus Admin]
    AdminAction -->|Change Role| ChangeRole[Ubah Role Admin]
    
    CreateAdmin --> FormAdmin["Input: Nama, Username, Password, Role"]
    FormAdmin --> SaveAdmin[Simpan Admin]
    SaveAdmin --> AdminCreated[Admin Berhasil Dibuat]
    
    EditAdmin --> UpdateAdmin[Update Data Admin]
    UpdateAdmin --> AdminUpdated[Admin Berhasil Diupdate]
    
    ChangeRole --> SelectRole{Pilih Role}
    SelectRole -->|ADMIN| SetAdmin[Set Role: ADMIN]
    SelectRole -->|SUPER_ADMIN| SetSuperAdmin[Set Role: SUPER_ADMIN]
    
    SetAdmin --> RoleUpdated[Role Berhasil Diupdate]
    SetSuperAdmin --> RoleUpdated
    
    DeleteAdmin --> ConfirmDelete{Konfirmasi Hapus?}
    ConfirmDelete -->|Ya| AdminDeleted[Admin Berhasil Dihapus]
    ConfirmDelete -->|Tidak| AdminMenu
    
    AdminCreated --> Done([Selesai])
    AdminUpdated --> Done
    RoleUpdated --> Done
    AdminDeleted --> Done
    AddResult --> Done
    Published --> Done
    
    %% STYLING
    classDef superClass fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef adminClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef actionClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef successClass fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    
    class Dashboard,AdminMenu superClass
    class ArticleMenu,VisitMenu,CreateAdmin,EditAdmin adminClass
    class CreateArticle,ReviewVisit,ApproveVisit,ChangeRole actionClass
    class Published,NotifyStudent,AdminCreated,AdminUpdated,RoleUpdated,AdminDeleted successClass
```

---

## Keterangan

### Status Kunjungan
- **PENDING**: Menunggu review dari guru BK
- **APPROVED**: Disetujui, jadwal dikonfirmasi
- **COMPLETED**: Sesi konseling selesai
- **CANCELLED**: Ditolak atau dibatalkan

### Role Admin
- **ADMIN**: Guru BK biasa - Akses kelola artikel & kunjungan
- **SUPER_ADMIN**: Guru BK Senior - Akses penuh termasuk kelola admin

### Perbedaan Admin vs Super Admin
| Fitur | Admin | Super Admin |
|-------|-------|-------------|
| Manajemen Artikel | ✅ | ✅ |
| Manajemen Kunjungan | ✅ | ✅ |
| Statistik & Overview | ✅ | ✅ |
| Manajemen Admin | ❌ | ✅ |
| Ubah Role Admin | ❌ | ✅ |

### Alur Singkat
1. **Siswa**: Login → Lihat Artikel → Buat Jadwal Konseling → Tunggu Approval → Konseling
2. **Admin**: Login → Kelola Artikel → Review & Approve Kunjungan → Konseling → Buat Catatan
3. **Super Admin**: Login → Semua Fitur Admin + Kelola Data Admin & Role

### Catatan Penting
- Akun siswa dibuat oleh Admin/Super Admin melalui sistem, siswa hanya perlu login dengan NISN yang telah diberikan
