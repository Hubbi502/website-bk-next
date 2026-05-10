# Prompt: Lengkapi profil admin + tampilkan profil guru di halaman About

## Peran

Kamu adalah full-stack developer untuk aplikasi Next.js (App Router) dengan Prisma. Kerjakan perubahan end-to-end (skema, API, UI) secara aman dan terukur.

## Tujuan utama

1. Lengkapi field admin (khusus guru BK dan koordinator) agar menyimpan data profil yang lebih kaya seperti foto profil, deskripsi singkat, dan informasi pendukung lain.
2. Tambahkan section "Profil Guru" pada halaman /about yang menampilkan nama dan foto profil. Saat kartu guru diklik, tampilkan modal berisi informasi lengkap guru tersebut.

## Konteks proyek

- Framework: Next.js App Router.
- ORM: Prisma.
- Admin memiliki role termasuk guru BK dan koordinator.
- Data admin sudah ada dan tidak boleh rusak; field baru harus kompatibel dengan data lama.

## Ruang lingkup perubahan

### 1) Data model (Prisma)

Tambahkan field baru pada model admin (atau model yang saat ini menyimpan data admin) dengan minimal:

- profileImageUrl: string (URL gambar)
- shortBio: string (ringkas, max 160-200 karakter)
- bio: string (deskripsi lengkap; gunakan tipe text jika perlu)
- positionTitle: string (misalnya "Guru BK", "Koordinator")
- education: string (optional)
- expertise: string (optional)
- phone: string (optional)
- emailPublic: string (optional)
- officeLocation: string (optional)
- officeHours: string (optional)
- socialLinks: JSON atau string terstruktur (optional)

Catatan:

- Jadikan field baru optional/nullable agar data existing tidak gagal migrate.
- Pastikan field yang ditampilkan di halaman About hanya untuk role guru BK dan koordinator.

### 2) Migrasi dan seed

- Buat migration Prisma untuk field baru.
- Update seed data (jika ada) agar minimal satu guru BK dan satu koordinator punya data profil lengkap.

### 3) API dan validasi

- Update endpoint admin (list, detail, create, update) agar menerima dan mengembalikan field baru.
- Validasi input (Zod atau validator yang ada) untuk memastikan format URL gambar dan panjang shortBio.
- Jika ada mekanisme upload image yang sudah dipakai (misalnya Cloudinary / upload API), gunakan mekanisme itu dan simpan URL di profileImageUrl.

### 4) UI dashboard admin

- Update form create/edit admin agar dapat mengisi field profil baru.
- Tambahkan preview foto profil jika URL tersedia.
- Tampilkan info profil ringkas di tabel/daftar admin bila relevan.

### 5) Halaman /about

- Tambahkan section baru "Profil Guru" dengan grid kartu.
- Kartu menampilkan foto dan nama guru (BK/koordinator saja).
- Saat kartu diklik, tampilkan modal berisi detail lengkap guru:
  - foto besar
  - nama dan jabatan
  - shortBio dan bio
  - education, expertise, kontak, jam layanan, sosial (jika ada)

Catatan UX:

- Modal harus bisa ditutup dengan tombol X dan klik di luar.
- Pastikan aksesibilitas (focus trap jika memakai dialog UI yang sudah ada).
- Gunakan fallback image jika belum ada foto.

## Batasan dan kualitas

- Jangan merusak fitur yang sudah ada.
- Pastikan perubahan typescript types sesuai (type Admin, DTO, dsb).
- Pastikan query / fetch ke API hanya mengambil field yang diperlukan.
- Desain responsif untuk mobile dan desktop.

## Kriteria keberhasilan

- Data admin lama tetap valid setelah migrasi.
- Admin bisa create/update profil lengkap termasuk foto dan deskripsi.
- Halaman /about menampilkan profil guru BK dan koordinator.
- Klik kartu menampilkan modal detail sesuai data guru yang dipilih.

## Rencana tes manual

1. Create admin guru BK dengan foto + shortBio + bio lengkap.
2. Update admin koordinator dengan foto dan data tambahan.
3. Buka /about dan pastikan kedua profil tampil di section baru.
4. Klik kartu guru BK dan koordinator, pastikan modal menampilkan data yang benar.
5. Coba data tanpa foto, pastikan fallback image tampil.

## Deliverables

- Migration Prisma.
- Update schema + seed.
- Update endpoint admin dan validasi.
- Update UI dashboard admin.
- Section baru dan modal di /about.
