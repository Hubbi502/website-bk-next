# Instruksi Implementasi Fitur Negosiasi Waktu Kunjungan BK

## 1) Tujuan

Menambahkan opsi baru pada alur saat guru BK tidak tersedia:

- Opsi lama: siswa memilih "Pilih Guru Lain" (sudah ada).
- Opsi baru: siswa memilih "Pilih Waktu Lain" untuk tetap dengan guru BK yang sama.

Aturan bisnis utama:

1. Siswa mengajukan waktu baru (tanggal dan jam baru) ke guru BK awal.
2. Guru BK harus konfirmasi terlebih dahulu.
3. Jika guru setuju, status menjadi accepted pada sistem ini (pakai status `APPROVED`).
4. Jika guru menolak, siswa kembali mendapat pilihan:
   - "Pilih Waktu Lain"
   - "Pilih Guru Lain"

Dokumen ini disusun agar langsung sesuai struktur kode project saat ini.

---

## 2) Kondisi Saat Ini (Baseline)

Flow delegasi yang sudah berjalan:

- `PENDING` -> guru klik tidak tersedia -> `AWAITING_STUDENT`
- Siswa pilih lanjut -> pilih guru lain -> `PENDING_DELEGATION`
- Guru baru approve -> `APPROVED`
- Guru baru reject -> kembali `AWAITING_STUDENT`

File utama yang sudah ada:

- `prisma/schema.prisma`
- `app/api/visits/[id]/unavailable/route.ts`
- `app/api/visits/[id]/student-decision/route.ts`
- `app/api/visits/[id]/delegate/route.ts`
- `app/api/visits/[id]/teacher-response/route.ts`
- `app/api/visits/booked-slots/route.ts`
- `app/api/visits/route.ts`
- `app/api/visits/[id]/route.ts`
- `app/schedule/page.tsx`
- `components/dashboard/VisitManagement.tsx`
- `app/dashboard/page.tsx`
- `lib/pusher.ts`

---

## 3) Desain Alur Baru

### 3.1 Status tambahan

Tambahkan status baru di enum `VisitStatus`:

- `PENDING_TIME_NEGOTIATION` = siswa sudah mengajukan jadwal baru, menunggu konfirmasi guru BK awal.

Status lain tetap dipakai:

- `AWAITING_STUDENT` untuk menunggu aksi siswa.
- `PENDING_DELEGATION` untuk alur "Pilih Guru Lain".
- `APPROVED` sebagai accepted final.

### 3.2 Transisi status

1. Guru BK awal klik tidak tersedia:
   - `PENDING` -> `AWAITING_STUDENT`
2. Siswa pilih "Pilih Guru Lain":
   - jalur existing ke `PENDING_DELEGATION`
3. Siswa pilih "Pilih Waktu Lain" dan submit tanggal/jam baru:
   - `AWAITING_STUDENT` -> `PENDING_TIME_NEGOTIATION`
4. Guru BK awal merespons negosiasi waktu:
   - approve -> `APPROVED`
   - reject -> `AWAITING_STUDENT` (opsi siswa muncul lagi)

### 3.3 Catatan penting state machine

- Saat guru menolak negosiasi waktu, jangan otomatis memasukkan guru ke `rejectedAdminIds`.
- `rejectedAdminIds` tetap khusus untuk alur "guru sudah menolak delegasi guru".
- Jika siswa ingin pindah guru, baru pakai endpoint delegasi existing.

---

## 4) Perubahan Database (Prisma)

## 4.1 Update enum `VisitStatus`

Di `prisma/schema.prisma`, tambahkan:

`PENDING_TIME_NEGOTIATION`

Contoh urutan enum:

- `PENDING`
- `AWAITING_STUDENT`
- `PENDING_TIME_NEGOTIATION`
- `PENDING_DELEGATION`
- `APPROVED`
- `FORWARDED`
- `COMPLETED`
- `CANCELLED`

## 4.2 Tambah field pada model `Visit`

Tambahkan field berikut:

- `proposedVisitDate DateTime?`
- `proposedVisitTime String?`
- `timeNegotiationStep Int @default(0)`
- `timeNegotiationNotes String? @db.Text` (opsional, catatan alasan siswa/guru)

Tujuan field:

- Menyimpan jadwal usulan sementara sebelum guru approve.
- Menyimpan jumlah iterasi negosiasi waktu.

## 4.3 Jalankan migration

Gunakan salah satu:

1. Dev migration:
   - `npx prisma migrate dev --name add_time_negotiation_flow`
2. Jika project sekarang pakai db push:
   - `npx prisma db push`

Lalu:

- `npx prisma generate`

---

## 5) Perubahan API Backend

## 5.1 Endpoint baru: usulan waktu dari siswa

- Method: `POST`
- Endpoint: `/api/visits/[id]/propose-time`
- Aktor: siswa

Request body:

```json
{
  "studentId": "string",
  "proposedVisitDate": "2026-04-20",
  "proposedVisitTime": "10:00"
}
```

Validasi wajib:

1. `visit` harus ada.
2. `visit.status` harus `AWAITING_STUDENT`.
3. `visit.studentId` harus sama dengan `studentId` payload.
4. `visit.targetTeacherId` harus ada (guru asal yang akan diminta konfirmasi).
5. Tanggal/jam tidak boleh di masa lalu.
6. Slot guru di tanggal/jam itu tidak bentrok dengan kunjungan aktif.

Cek bentrok (server-side, wajib):

- Cari visit lain (`id != currentVisitId`) dengan:
  - `targetTeacherId == visit.targetTeacherId`
  - `visitDate == proposedVisitDate`
  - `visitTime == proposedVisitTime`
  - status aktif: `PENDING`, `APPROVED`, `FORWARDED`, `PENDING_TIME_NEGOTIATION`

Update data saat valid:

- `status = PENDING_TIME_NEGOTIATION`
- `proposedVisitDate = new Date(proposedVisitDate)`
- `proposedVisitTime = proposedVisitTime`
- `timeNegotiationStep` increment 1

Realtime event:

- Trigger `visit-status-changed` ke channel `visits`
- payload minimal:
  - `visitId`
  - `status: "PENDING_TIME_NEGOTIATION"`
  - `teacherId: visit.targetTeacherId`
  - `reason: "time_negotiation_requested"`

## 5.2 Endpoint baru: respons guru terhadap negosiasi waktu

- Method: `POST`
- Endpoint: `/api/visits/[id]/time-negotiation-response`
- Aktor: admin/guru BK target awal

Request body:

```json
{
  "adminId": "string",
  "response": "approve",
  "notes": "opsional"
}
```

`response` bisa `approve` atau `reject`.

Validasi wajib:

1. `visit` ada.
2. `visit.status` harus `PENDING_TIME_NEGOTIATION`.
3. `visit.targetTeacherId === adminId`.
4. `proposedVisitDate` dan `proposedVisitTime` tidak null.

Jika `approve`:

- `visitDate = proposedVisitDate`
- `visitTime = proposedVisitTime`
- `proposedVisitDate = null`
- `proposedVisitTime = null`
- `status = APPROVED`
- `approvedBy = adminId`
- optional append `timeNegotiationNotes`

Jika `reject`:

- `status = AWAITING_STUDENT`
- `proposedVisitDate = null`
- `proposedVisitTime = null`
- optional simpan alasan di `timeNegotiationNotes`

Realtime event:

- Approve: `reason = "time_negotiation_approved"`
- Reject: `reason = "time_negotiation_rejected"`

## 5.3 Update endpoint existing

1. `app/api/visits/booked-slots/route.ts`
   - Tambahkan status `PENDING_TIME_NEGOTIATION` sebagai slot terblokir.
   - Tambahkan query opsional `excludeVisitId` agar saat edit/negosiasi bisa mengabaikan visit sendiri bila diperlukan.

2. `app/api/visits/route.ts` (GET)
   - Kembalikan field baru: `proposedVisitDate`, `proposedVisitTime`, `timeNegotiationStep`, `timeNegotiationNotes`.

3. `app/api/visits/[id]/route.ts` (GET)
   - Kembalikan field baru yang sama.

4. `app/api/visits/[id]/student-decision/route.ts`
   - Pertahankan behavior existing untuk `cancel` dan `continue`.
   - Tidak wajib menambah nilai decision baru jika negosiasi waktu memakai endpoint `/propose-time`.

---

## 6) Perubahan Frontend Siswa

File utama: `app/schedule/page.tsx`

## 6.1 Update tipe status

Tambahkan `pending_time_negotiation` pada union `Visit["status"]`.

## 6.2 Tambah opsi ketiga pada dialog saat `awaiting_student`

Di modal "Guru BK Tidak Tersedia", ubah CTA menjadi:

1. `Batalkan Kunjungan`
2. `Pilih Guru Lain`
3. `Pilih Waktu Lain` (baru)

Mapping aksi:

- Batalkan -> endpoint existing `student-decision` dengan `cancel`
- Pilih Guru Lain -> endpoint existing + modal pilih guru
- Pilih Waktu Lain -> buka modal negosiasi waktu

## 6.3 Tambah `TimeNegotiationModal`

Isi modal:

- Input tanggal baru
- Select waktu baru
- Info guru BK yang sama (dari `awaitingVisit.targetTeacher`)
- Tombol submit

Saat tanggal berubah:

- Panggil `/api/visits/booked-slots?teacherId={targetTeacherId}&date={yyyy-mm-dd}&excludeVisitId={visitId}`
- Disable slot yang bentrok

Saat submit:

- `POST /api/visits/[id]/propose-time`
- Success: tutup modal, tampilkan toast "Menunggu konfirmasi guru"

## 6.4 Update badge/icon/status text

Tambahkan mapping untuk `pending_time_negotiation`:

- Label: `Menunggu Konfirmasi Waktu Guru`
- Warna: ungu atau cyan (beda dari pending_delegation)
- Icon: `Clock` atau `RefreshCw`

## 6.5 Trigger notifikasi ulang saat ditolak

Karena status kembali `awaiting_student`, logic existing `loadVisits()` dan event `visit-status-changed` bisa dipakai lagi.

Pastikan modal yang muncul lagi menampilkan 3 opsi (bukan 2 opsi).

---

## 7) Perubahan Frontend Dashboard Guru

File utama:

- `components/dashboard/VisitManagement.tsx`
- `app/dashboard/page.tsx`

## 7.1 Update tipe status

Tambahkan `pending_time_negotiation` pada union status di kedua file.

## 7.2 Tambah panel "Permintaan Negosiasi Waktu"

Di `VisitManagement.tsx`, tampilkan panel khusus untuk visit dengan kondisi:

- `status === "pending_time_negotiation"`
- `targetTeacherId === adminData?.id`

Info minimal panel:

- Nama siswa
- Tanggal/jam usulan baru
- Tanggal/jam lama (opsional, agar guru bisa bandingkan)
- Tombol `Setujui Waktu` / `Tolak`

## 7.3 Handler aksi guru

Tambahkan handler:

- `handleApproveTimeNegotiation(visit)`
- `handleRejectTimeNegotiation(visit)`

Keduanya memanggil endpoint:

- `POST /api/visits/[id]/time-negotiation-response`

## 7.4 Update badge dashboard

Di `app/dashboard/page.tsx`:

- Tambahkan varian badge `pending_time_negotiation`
- Masukkan status ini ke counter kunjungan aktif yang butuh aksi

---

## 8) Notifikasi Realtime

Sistem saat ini sudah memakai `Pusher` di channel `visits`.

Gunakan event yang sudah ada (`visit-status-changed`) dengan `reason` berbeda, sehingga frontend cukup reload daftar kunjungan.

`reason` yang direkomendasikan:

- `time_negotiation_requested`
- `time_negotiation_approved`
- `time_negotiation_rejected`

Jika ingin lebih eksplisit, boleh tambah constant baru di `lib/pusher.ts`:

- `VISIT_TIME_NEGOTIATION_EVENT`

Tetapi ini opsional, karena event status existing sudah cukup.

---

## 9) Checklist Implementasi (Eksekusi)

## Fase A - Schema

- [ ] Tambah enum status `PENDING_TIME_NEGOTIATION`
- [ ] Tambah field `proposedVisitDate`, `proposedVisitTime`, `timeNegotiationStep`, `timeNegotiationNotes`
- [ ] Jalankan migration + generate prisma

## Fase B - API

- [ ] Buat `POST /api/visits/[id]/propose-time`
- [ ] Buat `POST /api/visits/[id]/time-negotiation-response`
- [ ] Update `booked-slots` agar aware status baru
- [ ] Update formatter data di `visits` GET dan `visits/[id]` GET

## Fase C - Frontend Siswa

- [ ] Tambah opsi `Pilih Waktu Lain` di alert `awaiting_student`
- [ ] Buat modal negosiasi waktu
- [ ] Integrasikan validasi slot bentrok
- [ ] Tambah status badge `pending_time_negotiation`

## Fase D - Frontend Guru

- [ ] Tambah panel request negosiasi waktu
- [ ] Tambah aksi approve/reject waktu
- [ ] Tambah badge/status di dashboard

## Fase E - Realtime

- [ ] Trigger event di endpoint baru
- [ ] Pastikan siswa dan guru auto refresh data setelah event masuk

---

## 10) Skenario Uji Wajib

1. Guru tidak tersedia -> siswa pilih waktu lain -> guru approve -> status `approved`.
2. Guru tidak tersedia -> siswa pilih waktu lain -> guru reject -> status balik `awaiting_student`.
3. Setelah reject, siswa tetap bisa pilih `Pilih Guru Lain`.
4. Slot bentrok harus ditolak di server walaupun UI salah.
5. Siswa lain booking slot yang sama saat modal negosiasi terbuka -> submit harus gagal dengan pesan bentrok.
6. Event pusher mengubah tampilan status tanpa hard refresh.
7. Legacy flow (`forwarded` dan `pending_delegation`) tetap berjalan.

---

## 11) Risiko dan Guardrail

1. Risiko race condition slot.
   - Solusi: validasi bentrok wajib di backend sebelum update status.

2. Risiko status tidak sinkron antar halaman.
   - Solusi: semua update status trigger pusher + frontend reload data.

3. Risiko regressi flow delegasi guru.
   - Solusi: pisahkan endpoint negosiasi waktu dari endpoint delegasi guru.

4. Risiko endpoint disalahgunakan.
   - Solusi: validasi actor (`studentId`, `adminId`) dan relasi terhadap visit.

---

## 12) Definisi Selesai (Definition of Done)

Fitur dianggap selesai jika:

1. Siswa melihat 3 opsi saat status `awaiting_student`:
   - Batalkan
   - Pilih Guru Lain
   - Pilih Waktu Lain
2. Siswa dapat submit tanggal/jam baru untuk guru BK awal.
3. Guru BK awal bisa approve/reject usulan waktu dari dashboard.
4. Approve mengubah status ke `approved`.
5. Reject mengembalikan status ke `awaiting_student` dan siswa dapat memilih ulang.
6. Tidak merusak alur delegasi guru yang sudah ada.

---

## 13) Rekomendasi Incremental Rollout

1. Rilis backend + schema dulu.
2. Rilis UI siswa (opsi dan modal negosiasi).
3. Rilis UI guru untuk respons negosiasi.
4. Aktifkan monitoring log pada endpoint baru selama 3-7 hari.

Dengan urutan ini, jika ada bug UI, data model dan API tetap stabil untuk rollback cepat di layer frontend.
