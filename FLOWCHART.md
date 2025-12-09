# Flowchart Aplikasi Sistem Bimbingan dan Konseling (Sahabat BK)

```mermaid
flowchart TD
    Start([User Buka Website]) --> Home[Landing Page]
    
    Home --> UserType{Tipe User}
    
    %% GUEST USER FLOW
    UserType -->|Guest| GuestAction{Pilih Aksi}
    GuestAction -->|Lihat Artikel| ViewArticles[Halaman Artikel]
    GuestAction -->|Tentang| About[Halaman About]
    GuestAction -->|Jadwal Konseling| GuestSchedule[Halaman Schedule - Terbatas]
    GuestAction -->|Login| LoginChoice{Jenis Login?}
    
    ViewArticles --> ArticleDetail[Detail Artikel]
    ArticleDetail --> NeedLogin[Perlu Login untuk Comment]
    
    GuestSchedule --> MustLoginFirst[Harus Login Dulu]
    MustLoginFirst --> LoginChoice
    
    %% LOGIN SELECTION
    LoginChoice -->|Login Guru| TeacherLoginPage["Login Guru: /login"]
    LoginChoice -->|Login Murid| StudentLoginPage["Login Murid: /student-login"]
    
    %% TEACHER LOGIN FLOW
    TeacherLoginPage --> TeacherInput[Input Username & Password]
    TeacherInput --> TeacherAuth{Validasi Guru}
    TeacherAuth -->|Invalid| TeacherError[Error: Kredensial Salah]
    TeacherError --> TeacherInput
    TeacherAuth -->|Valid| TeacherStorage[Save adminData localStorage]
    TeacherStorage --> Dashboard[Dashboard Guru]
    
    %% DASHBOARD MENU
    Dashboard --> DashMenu{Menu Dashboard}
    DashMenu -->|Overview| DashOverview[Statistik & Ringkasan]
    DashMenu -->|Artikel| ArticleManage[Manajemen Artikel]
    DashMenu -->|Kunjungan| VisitManage[Manajemen Kunjungan]
    DashMenu -->|Admin| AdminManage[Manajemen Admin]
    
    %% ARTICLE MANAGEMENT
    ArticleManage --> ArticleAction{Aksi Artikel}
    ArticleAction -->|Create| CreateArticle[Form Baru]
    ArticleAction -->|Edit| EditArticle[Form Edit]
    ArticleAction -->|Delete| DeleteArticle[Hapus Artikel]
    CreateArticle --> UploadImage[Upload Gambar]
    UploadImage --> SaveArticle[Simpan ke DB]
    SaveArticle --> PublishArticle[Artikel Published]
    
    %% VISIT MANAGEMENT
    VisitManage --> VisitList[List Kunjungan]
    VisitList --> FilterStatus{Filter Status}
    FilterStatus -->|PENDING| PendingVisits[Kunjungan Pending]
    FilterStatus -->|APPROVED| ApprovedVisits[Kunjungan Approved]
    FilterStatus -->|COMPLETED| CompletedVisits[Kunjungan Selesai]
    FilterStatus -->|CANCELLED| CancelledVisits[Kunjungan Batal]
    
    PendingVisits --> ReviewVisit{Review Pengajuan}
    ReviewVisit -->|Approve| ApproveVisit[Status: APPROVED]
    ReviewVisit -->|Reject| RejectVisit[Status: CANCELLED]
    ReviewVisit -->|Add Notes| AddNotes[Tambah Catatan]
    
    ApproveVisit --> NotifyApprove[Notifikasi Murid - Approved]
    RejectVisit --> NotifyReject[Notifikasi Murid - Rejected]
    
    ApprovedVisits --> CounselingSession[Sesi Konseling]
    CounselingSession --> MarkComplete[Status: COMPLETED]
    MarkComplete --> AddResultNotes[Tambah Catatan Hasil]
    
    %% ADMIN MANAGEMENT
    AdminManage --> AdminAction{Aksi Admin}
    AdminAction -->|Create| CreateAdmin[Buat Admin Baru]
    AdminAction -->|Edit| EditAdmin[Edit Admin]
    AdminAction -->|Delete| DeleteAdmin[Hapus Admin]
    AdminAction -->|Change Role| ChangeRole[Ubah Role Admin]
    
    %% STUDENT LOGIN FLOW
    StudentLoginPage --> StudentMode{Mode}
    StudentMode -->|Login| StudentLoginForm[Form Login NISN]
    StudentMode -->|Register| StudentRegForm[Form Registrasi]
    
    StudentRegForm --> RegInput[Input: Nama, NISN, Password, Class, Phone]
    RegInput --> RegValidate{Validasi}
    RegValidate -->|Invalid| RegError[Error: NISN Sudah Ada]
    RegError --> RegInput
    RegValidate -->|Valid| RegSuccess[Registrasi Berhasil]
    RegSuccess --> StudentLoginForm
    
    StudentLoginForm --> StudentInput[Input NISN & Password]
    StudentInput --> StudentAuth{Validasi Murid}
    StudentAuth -->|Invalid| StudentError[Error: Kredensial Salah]
    StudentError --> StudentInput
    StudentAuth -->|Valid| StudentStorage[Save studentData localStorage]
    StudentStorage --> StudentRedirect[Redirect ke Schedule]
    
    %% STUDENT LOGGED IN FLOW
    UserType -->|Student Logged In| StudentAction{Pilih Aksi}
    StudentAction -->|Baca Artikel| StudentArticles[Artikel + Comment]
    StudentAction -->|Jadwal Konseling| StudentSchedule[Halaman Schedule - Full]
    StudentAction -->|Logout| StudentLogout[Hapus Session]
    StudentLogout --> Home
    
    StudentArticles --> StudentArticleDetail[Detail + Add Comment]
    StudentArticleDetail --> PostComment[Post Comment ke DB]
    
    StudentSchedule --> ViewMyVisits[Lihat Kunjungan Saya]
    StudentSchedule --> CreateNewVisit[Buat Pengajuan Baru]
    
    CreateNewVisit --> VisitForm[Form Kunjungan]
    VisitForm --> SelectDateTime[Pilih Tanggal & Waktu]
    SelectDateTime --> WriteReason[Tulis Alasan Konseling]
    WriteReason --> SubmitVisit[Submit Pengajuan]
    SubmitVisit --> VisitPending[Status: PENDING]
    VisitPending --> WaitTeacher[Tunggu Approval Guru]
    
    ViewMyVisits --> MyVisitStatus{Status Kunjungan}
    MyVisitStatus -->|PENDING| WaitingApproval[Menunggu Approval]
    MyVisitStatus -->|APPROVED| ScheduleConfirmed[Jadwal Dikonfirmasi]
    MyVisitStatus -->|COMPLETED| ConsultationDone[Konseling Selesai]
    MyVisitStatus -->|CANCELLED| VisitCancelled[Dibatalkan]
    
    %% DATABASE & API LAYER
    SaveArticle -.->|API| ArticleAPI[/api/articles]
    PostComment -.->|API| CommentAPI[/api/articles/id/comments]
    SubmitVisit -.->|API| VisitAPI[/api/visits]
    ApproveVisit -.->|API| VisitUpdateAPI[/api/visits/id]
    TeacherStorage -.->|API| AuthAPI[/api/auth/login]
    StudentStorage -.->|API| StudentAuthAPI[/api/auth/student/login]
    RegSuccess -.->|API| StudentRegAPI[/api/auth/student/register]
    UploadImage -.->|API| UploadAPI[/api/upload]
    CreateAdmin -.->|API| AdminAPI[/api/admins]
    
    ArticleAPI -.->|DB| DatabasePrisma[(PostgreSQL + Prisma)]
    CommentAPI -.-> DatabasePrisma
    VisitAPI -.-> DatabasePrisma
    VisitUpdateAPI -.-> DatabasePrisma
    AuthAPI -.-> DatabasePrisma
    StudentAuthAPI -.-> DatabasePrisma
    StudentRegAPI -.-> DatabasePrisma
    AdminAPI -.-> DatabasePrisma
    
    %% STYLING
    classDef guestClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef studentClass fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef teacherClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef apiClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef dbClass fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class GuestAction,ViewArticles,About,GuestSchedule,LoginChoice guestClass
    class StudentAction,StudentArticles,StudentSchedule,CreateNewVisit,VisitForm studentClass
    class Dashboard,DashMenu,ArticleManage,VisitManage,AdminManage teacherClass
    class ArticleAPI,CommentAPI,VisitAPI,AuthAPI,StudentAuthAPI,UploadAPI,AdminAPI apiClass
    class DatabasePrisma dbClass
```

---

## Keterangan

### Status Kunjungan
- **PENDING**: Pengajuan baru, menunggu review guru
- **APPROVED**: Disetujui oleh guru, jadwal dikonfirmasi
- **COMPLETED**: Sesi konseling telah selesai dilakukan
- **CANCELLED**: Dibatalkan (oleh guru atau sistem)

### Role Admin
- **ADMIN**: Guru BK biasa
- **SUPER_ADMIN**: Guru BK Senior dengan akses penuh

### Fitur Berdasarkan User Type
1. **Guest**: Lihat artikel (tanpa comment), info about, harus login untuk jadwal
2. **Student**: Baca & comment artikel, buat jadwal konseling, lihat status kunjungan
3. **Teacher/Admin**: Dashboard lengkap - CRUD artikel, approve kunjungan, kelola admin

### API Endpoints
- `/api/auth/login` - Login guru
- `/api/auth/student/login` - Login murid
- `/api/auth/student/register` - Register murid
- `/api/articles` - CRUD artikel
- `/api/articles/[id]/comments` - Comment artikel
- `/api/visits` - CRUD kunjungan
- `/api/admins` - CRUD admin
- `/api/upload` - Upload gambar

### Database Schema (Prisma + PostgreSQL)
- **Admin**: id, name, username, password, role
- **Student**: id, name, nisn, password, class, phone
- **Article**: id, title, content, image, category, authorId
- **Comment**: id, content, articleId, studentId
- **Visit**: id, visitDate, visitTime, reason, status, studentId, approvedBy
