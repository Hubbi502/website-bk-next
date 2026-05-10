# Prompt: Guru dapat mengedit profil sendiri

## Peran

Kamu adalah full-stack developer untuk aplikasi Next.js (App Router) dengan Prisma. Kerjakan perubahan end-to-end (API, auth, UI) agar guru yang sedang login dapat mengubah profilnya sendiri tanpa perlu melalui koordinator/super admin.

## Tujuan utama

- Guru (role guru BK atau koordinator) yang sedang login bisa melihat dan mengedit profil miliknya sendiri.
- Akses edit profil dibatasi hanya untuk akun yang sedang login.
- Admin koordinator tetap dapat mengelola profil guru lain (jika fitur itu sudah ada), tetapi fitur baru ini tidak bergantung pada koordinator.

## Konteks proyek

- Framework: Next.js App Router.
- ORM: Prisma.
- Auth sudah ada (gunakan mekanisme auth yang berlaku di proyek ini).
- Data profil guru sudah disimpan pada model admin (atau model sejenis).

## Ruang lingkup perubahan

### 1) API: endpoint "profil saya"

Tambahkan atau perbarui endpoint agar guru login bisa:

- GET profil dirinya sendiri.
- PATCH/PUT profil dirinya sendiri.

Kebutuhan keamanan:

- Ambil userId dari session/token, bukan dari request body.
- Tolak akses jika role bukan guru BK atau koordinator.
- Pastikan guru hanya bisa mengedit data miliknya sendiri.

### 2) Validasi

- Validasi input menggunakan validator yang sudah ada (misalnya Zod).
- Batasi panjang shortBio dan bio.
- Validasi URL untuk foto profil.
- Untuk field sensitif (misalnya email akun login), putuskan apakah boleh diubah sendiri atau tidak.

### 3) UI: halaman profil guru

Buat halaman khusus (misalnya /dashboard/profile atau /dashboard/my-profile) yang dapat diakses guru login.

- Tampilkan data profil saat ini.
- Form edit untuk profileImageUrl, shortBio, bio, positionTitle, education, expertise, officeHours, dsb.
- Tombol Simpan yang memanggil API "profil saya".
- Preview foto profil.
- State loading dan notifikasi sukses/gagal.

### 4) Integrasi upload foto

Jika proyek punya API upload gambar (misal Cloudinary), gunakan mekanisme yang sama.

- Simpan URL ke profileImageUrl.
- Tampilkan fallback jika tidak ada gambar.

### 5) Authorization di server

- Pastikan middleware/guard mengecek role dan userId.
- Hindari kebocoran data dengan memastikan respon API hanya mengembalikan field yang perlu.

## Batasan dan kualitas

- Tidak boleh merusak flow admin/super admin yang sudah ada.
- Data existing harus tetap kompatibel.
- Pastikan typescript types dan DTO sudah diperbarui.
- Desain responsif dan rapi untuk mobile.

## Kriteria keberhasilan

- Guru login dapat melihat profil sendiri.
- Guru login dapat mengubah dan menyimpan profilnya sendiri.
- Guru tidak bisa mengedit profil orang lain.
- Koordinator/super admin tetap bisa mengelola admin lain sesuai fitur yang sudah ada.

## Rencana tes manual

1. Login sebagai guru BK, buka halaman profil saya, ubah shortBio dan foto, simpan.
2. Refresh halaman, pastikan data tersimpan.
3. Coba akses endpoint edit dengan userId lain, harus ditolak.
4. Login sebagai role non-guru, pastikan endpoint profil saya ditolak.

## Deliverables

- Endpoint GET/PATCH profil saya.
- Validasi input dan authorization.
- Halaman UI profil guru dan form edit.
- Integrasi upload foto (jika tersedia).
