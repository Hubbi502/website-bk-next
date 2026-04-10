# Instruksi Implementasi: CRUD Siswa (Guru BK & Super Admin)

## Deskripsi Fitur

Fitur ini menambahkan halaman pengelolaan data siswa ke dalam dashboard admin dengan **dua level akses**:

- **Guru BK (`role: ADMIN`)** → hanya bisa melihat, menambah, mengedit, dan menghapus siswa di kelas yang ada di `assignedClasses`-nya.
- **Super Admin (`role: SUPER_ADMIN`)** → bisa melakukan CRUD pada **semua siswa** tanpa batasan.

---

## Struktur Data yang Sudah Ada

### Model `Student` (Prisma)

```prisma
model Student {
  id        String   @id @default(cuid())
  name      String
  nisn      String   @unique
  password  String
  class     String   // e.g. "X RPL 1", "XI DKV 2"
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Model `Admin` (Prisma)

```prisma
model Admin {
  id              String    @id @default(cuid())
  role            AdminRole // ADMIN | SUPER_ADMIN
  assignedClasses String[]  // ["X RPL 1", "X RPL 2", "X DKV 1", ...]
  // ...
}
```

**Kunci aturan akses:** Guru BK (`ADMIN`) hanya boleh mengelola siswa yang field `class`-nya ada dalam array `assignedClasses` milik guru tersebut.

---

## Perubahan yang Harus Dilakukan

### 1. API: `/api/students` — `app/api/students/route.ts` [NEW]

Buat file baru `app/api/students/route.ts`.

#### `GET /api/students`

```ts
// Query params yang didukung:
// - teacherId: string (ID admin/guru yang sedang login)
// - role: "ADMIN" | "SUPER_ADMIN"
// - search: string (opsional, cari berdasar nama/NISN)
// - class: string (opsional, filter per kelas)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");
  const role = searchParams.get("role");
  const search = searchParams.get("search") || "";
  const classFilter = searchParams.get("class") || "";

  // Jika ADMIN (Guru BK), ambil assignedClasses dari database
  let allowedClasses: string[] | null = null;
  if (role === "ADMIN" && teacherId) {
    const admin = await prisma.admin.findUnique({ where: { id: teacherId } });
    allowedClasses = admin?.assignedClasses ?? [];
  }

  const students = await prisma.student.findMany({
    where: {
      // Filter berdasarkan kelas yang diizinkan (hanya jika Guru BK)
      ...(allowedClasses ? { class: { in: allowedClasses } } : {}),
      // Filter opsional per kelas
      ...(classFilter ? { class: classFilter } : {}),
      // Pencarian berdasarkan nama atau NISN
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { nisn: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: [{ class: "asc" }, { name: "asc" }],
  });

  return Response.json({ success: true, data: students });
}
```

#### `POST /api/students`

```ts
export async function POST(request: Request) {
  const body = await request.json();
  const { name, nisn, password, class: className, phone, teacherId, role } = body;

  // Validasi: Guru BK hanya bisa tambah siswa di kelasnya
  if (role === "ADMIN" && teacherId) {
    const admin = await prisma.admin.findUnique({ where: { id: teacherId } });
    if (!admin?.assignedClasses.includes(className)) {
      return Response.json(
        { error: "Anda tidak memiliki akses untuk kelas ini" },
        { status: 403 }
      );
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const student = await prisma.student.create({
    data: { name, nisn, password: hashedPassword, class: className, phone },
  });

  return Response.json({ success: true, data: student }, { status: 201 });
}
```

---

### 2. API: `/api/students/[id]` — `app/api/students/[id]/route.ts` [NEW]

Buat file `app/api/students/[id]/route.ts`.

#### `PUT /api/students/[id]`

```ts
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { name, nisn, password, class: className, phone, teacherId, role } = body;

  // Validasi akses kelas untuk Guru BK
  if (role === "ADMIN" && teacherId) {
    const admin = await prisma.admin.findUnique({ where: { id: teacherId } });
    const student = await prisma.student.findUnique({ where: { id: params.id } });

    // Guru BK tidak bisa edit siswa yang bukan di kelasnya
    if (student && !admin?.assignedClasses.includes(student.class)) {
      return Response.json({ error: "Akses ditolak" }, { status: 403 });
    }
    // Guru BK tidak bisa pindahkan siswa ke kelas lain di luar cakupannya
    if (className && !admin?.assignedClasses.includes(className)) {
      return Response.json(
        { error: "Tidak bisa memindahkan siswa ke kelas di luar cakupan Anda" },
        { status: 403 }
      );
    }
  }

  const updateData: any = { name, nisn, class: className, phone };
  if (password) updateData.password = await bcrypt.hash(password, 10);

  const updated = await prisma.student.update({
    where: { id: params.id },
    data: updateData,
  });

  return Response.json({ success: true, data: updated });
}
```

#### `DELETE /api/students/[id]`

```ts
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");
  const role = searchParams.get("role");

  // Validasi akses kelas untuk Guru BK
  if (role === "ADMIN" && teacherId) {
    const admin = await prisma.admin.findUnique({ where: { id: teacherId } });
    const student = await prisma.student.findUnique({ where: { id: params.id } });

    if (student && !admin?.assignedClasses.includes(student.class)) {
      return Response.json({ error: "Akses ditolak" }, { status: 403 });
    }
  }

  await prisma.student.delete({ where: { id: params.id } });

  return Response.json({ success: true, message: "Siswa berhasil dihapus" });
}
```

---

### 3. Komponen: `StudentManagement.tsx` — `components/dashboard/StudentManagement.tsx` [NEW]

Buat komponen baru yang mirip pola `AdminManagement.tsx`.

#### Props

```ts
interface StudentManagementProps {
  adminData: {
    id: string;
    role: "ADMIN" | "SUPER_ADMIN";
    assignedClasses: string[];
  };
}
```

#### State utama

```ts
const [students, setStudents] = useState<Student[]>([]);
const [searchQuery, setSearchQuery] = useState("");
const [classFilter, setClassFilter] = useState("all");
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
const [formData, setFormData] = useState({
  name: "", nisn: "", password: "", class: "", phone: "",
});
```

#### Logika kelas yang tersedia

```ts
// Daftar semua kelas (untuk Super Admin) atau hanya assignedClasses (untuk Guru BK)
const availableClasses = adminData.role === "SUPER_ADMIN"
  ? ALL_CLASSES  // ["X RPL 1", "X RPL 2", ... "XII SIJA 2"]
  : adminData.assignedClasses;
```

#### `loadStudents`

```ts
const loadStudents = async () => {
  const params = new URLSearchParams({
    teacherId: adminData.id,
    role: adminData.role,
    ...(searchQuery && { search: searchQuery }),
    ...(classFilter !== "all" && { class: classFilter }),
  });

  const res = await fetch(`/api/students?${params}`);
  const data = await res.json();
  setStudents(data.data);
};
```

#### Form field kelas

```tsx
// Dropdown kelas di form create/edit dibatasi sesuai availableClasses
<Select value={formData.class} onValueChange={(val) => setFormData({ ...formData, class: val })}>
  <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
  <SelectContent>
    {availableClasses.map((cls) => (
      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

#### Kolom tabel

| Kolom | Keterangan |
|-------|-----------|
| Nama | Nama lengkap siswa |
| NISN | Nomor Induk Siswa Nasional |
| Kelas | Kelas siswa (e.g. X RPL 1) |
| No. HP | Nomor telepon (opsional) |
| Aksi | Tombol Edit & Hapus |

---

### 4. Integrasi ke Dashboard Page — `app/dashboard/page.tsx` [MODIFY]

#### a. Tambah import

```ts
import { StudentManagement } from "@/components/dashboard/StudentManagement";
```

#### b. Perbarui tipe `activeTab`

```ts
const [activeTab, setActiveTab] = useState<
  "overview" | "articles" | "visits" | "admins" | "students"
>("overview");
```

#### c. Tambah render tab siswa

```tsx
{activeTab === "students" && (
  <StudentManagement adminData={adminData} />
)}
```

---

### 5. Integrasi ke Sidebar — `components/dashboard/DashboardLayout.tsx` [MODIFY]

Tambahkan menu item "Kelola Siswa" di sidebar. Menu ini muncul untuk **semua role** (baik `ADMIN` maupun `SUPER_ADMIN`).

```tsx
// Di dalam array menu items atau navigasi sidebar
{ id: "students", label: "Kelola Siswa", icon: GraduationCap }
```

> Catatan: Icon `GraduationCap` tersedia dari package `lucide-react`.

---

## Ringkasan Aturan Akses

| Aksi | Guru BK (`ADMIN`) | Super Admin (`SUPER_ADMIN`) |
|------|-------------------|----------------------------|
| Lihat daftar siswa | ✅ Hanya kelas di `assignedClasses` | ✅ Semua siswa |
| Filter per kelas | ✅ Hanya kelas di `assignedClasses` | ✅ Semua kelas |
| Tambah siswa baru | ✅ Hanya ke kelas di `assignedClasses` | ✅ Ke kelas mana saja |
| Edit data siswa | ✅ Hanya siswa di kelas cakupan | ✅ Semua siswa |
| Pindah kelas siswa | ❌ Tidak bisa ke kelas lain di luar cakupan | ✅ Bebas |
| Hapus siswa | ✅ Hanya siswa di kelas cakupan | ✅ Semua siswa |

---

## Contoh Skenario

**Bu Siti Nurhaliza** (`Ibu Siti Nurhasanah` di seed, Guru BK kelas X):
- `assignedClasses: ["X RPL 1", "X RPL 2", "X DKV 1", "X DKV 2", "X SIJA 1", "X SIJA 2"]`
- Saat buka menu "Kelola Siswa", hanya tampil siswa kelas X.
- Dropdown kelas di form hanya menampilkan pilihan kelas X.
- Jika API menerima request tambah/edit siswa ke kelas XI, server akan mengembalikan `403 Forbidden`.

**Super Admin**:
- Tidak ada filter `assignedClasses` → query prisma tanpa filter kelas.
- Dropdown kelas di form menampilkan semua 18 kelas.

---

## Urutan Implementasi yang Disarankan

1. [ ] Buat `app/api/students/route.ts` (GET & POST)
2. [ ] Buat `app/api/students/[id]/route.ts` (PUT & DELETE)
3. [ ] Buat `components/dashboard/StudentManagement.tsx`
4. [ ] Tambahkan menu "Kelola Siswa" di `DashboardLayout.tsx`
5. [ ] Integrasikan `StudentManagement` ke `app/dashboard/page.tsx`
6. [ ] Uji coba login sebagai Guru BK dan pastikan hanya kelas cakupannya yang tampil
7. [ ] Uji coba login sebagai Super Admin dan pastikan semua siswa tampil
