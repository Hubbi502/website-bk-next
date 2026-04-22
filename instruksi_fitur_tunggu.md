# Instruksi Implementasi Fitur "Tunggu" (Wait for Visit)

Dokumen ini berisi panduan tahap demi tahap untuk menambahkan fitur "Tunggu" (Wait) pada pengajuan kunjungan (Visit), di mana guru dapat menginstruksikan siswa untuk menunggu selama waktu yang ditentukan, dan akan otomatis batal jika waktu tersebut telah habis.

## 1. Pembaruan Skema Database (Prisma)
Pertama, kita perlu memperbarui `prisma/schema.prisma` agar sistem dapat menyimpan status tunggu beserta batas waktunya.

1. **Tambahkan Status pada Enum**
   Tambahkan nilai `WAITING` (atau nama lain yang sesuai, misalnya `ON_HOLD_BY_TEACHER`) pada enum `VisitStatus`.
   ```prisma
   enum VisitStatus {
     PENDING
     WAITING // <-- Tambahkan ini
     AWAITING_STUDENT
     PENDING_TIME_NEGOTIATION
     PENDING_DELEGATION
     APPROVED
     FORWARDED
     COMPLETED
     CANCELLED
   }
   ```

2. **Tambahkan Field Batas Waktu pada Model `Visit`**
   Tambahkan field untuk menyimpan kapan waktu tunggu ini berakhir (kedaluwarsa).
   ```prisma
   model Visit {
     // ... field lain yang sudah ada
     waitDurationMinutes Int?      // Durasi awal menunggu (opsional, untuk kalkulasi persentase bar)
     waitExpiredAt       DateTime? // Waktu kadaluwarsa "Tunggu"
     // ...
   }
   ```

3. **Terapkan Perubahan Database**
   Jalankan command ini di terminal:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 2. Pembaruan Endpoint API
Perbarui endpoint yang digunakan oleh Guru untuk merespons kunjungan (misalnya di `app/api/visits/[id]/route.ts` atau endpoint respons lainnya).

1. **Terima parameter status dan durasi tunggu**
   ```typescript
   // Di dalam blok penanganan request Guru terkait persetujuan
   const { status, waitDurationMinutes } = await req.json();

   if (status === 'WAITING') {
     const duration = parseInt(waitDurationMinutes) || 15; // default 15 menit
     const waitExpiredAt = new Date(Date.now() + duration * 60000);

     await prisma.visit.update({
       where: { id },
       data: {
         status: 'WAITING',
         waitDurationMinutes: duration,
         waitExpiredAt: waitExpiredAt,
       }
     });
   }
   ```

2. **Sistem Auto Cancel (Pengecekan Kedaluwarsa)**
   Karena sistem harus secara otomatis mendeteksi jika waktu sudah habis, pendekatan paling efisien tanpa menggunakan cron job di backend Next.js adalah mengecek status kunjungan saat siswa me-request `GET /api/visits` atau saat mengakses `/schedule`.
   Jika `visit.status === 'WAITING'` dan `new Date() > visit.waitExpiredAt`, maka update otomatis ke status `CANCELLED`.

## 3. Pembaruan Antarmuka (UI) Dashboard Guru
Di halaman atau komponen yang digunakan guru untuk menyetujui kunjungan:
1. **Tambahi Tombol Tunggu**
   Tambahkan tombol **"Tunggu"** (misalnya dengan warna Kuning/Jingga) berdampingan dengan tombol "Setujui" dan "Tolak".
2. **Modal / Form Input Durasi**
   Saat tombol "Tunggu" diklik, munculkan modal (dialog) yang menanyakan "Berapa lama siswa harus menunggu?". Guru kemudian memasukkan angka (contoh: 15 menit) lalu submit.
3. **Kirim Data ke API**
   Panggil fetch API ke endpoint respons dengan payload `{ status: 'WAITING', waitDurationMinutes: 15 }`.

## 4. Pembaruan Antarmuka (UI) Jadwal Siswa (`/schedule`)
Di dalam `app/schedule/page.tsx` atau komponen kartu detail yang digunakan oleh siswa:

1. **Komponen Modal Detail Kunjungan**
   Ketika siswa meng-klik card kunjungan (Lihat Detail), cek apabila kunjungan tersebut berstatus `WAITING` dan batas waktunya belum lewat.
   
2. **Implementasikan Fitur Countdown Bar**
   Buat komponen fungsional yang berjalan secara client-side (`"use client"`) untuk menghitung mundur sisa waktu dari `waitExpiredAt`.

   *Contoh implementasi:*
   ```tsx
   "use client";
   import { useEffect, useState } from "react";

   export default function WaitCountdownBar({ waitDurationMinutes, waitExpiredAt, onExpired }) {
     const [timeLeft, setTimeLeft] = useState(
       new Date(waitExpiredAt).getTime() - Date.now()
     );

     useEffect(() => {
       if (timeLeft <= 0) {
         onExpired(); // Trigger fungsi ini bila waktu habis
         return;
       }

       const interval = setInterval(() => {
         const newTimeLeft = new Date(waitExpiredAt).getTime() - Date.now();
         setTimeLeft(newTimeLeft);
         
         if (newTimeLeft <= 0) {
           clearInterval(interval);
           onExpired();
         }
       }, 1000);

       return () => clearInterval(interval);
     }, [waitExpiredAt, timeLeft, onExpired]);

     // Kalkulasi progress persentase (100% sampai 0%)
     const totalWaitMs = waitDurationMinutes * 60 * 1000;
     const percentage = Math.max(0, Math.min(100, (timeLeft / totalWaitMs) * 100));

     // Format waktu untuk tampilan (MM:SS)
     const minutes = Math.floor(timeLeft / 60000);
     const seconds = Math.floor((timeLeft % 60000) / 1000);

     return (
       <div className="w-full mt-4">
         <div className="flex justify-between items-center mb-1 text-sm font-medium text-orange-600">
           <span>Mohon tunggu konfirmasi guru...</span>
           <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
         </div>
         <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
           <div 
             className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000 ease-linear" 
             style={{ width: `${percentage}%` }}
           ></div>
         </div>
       </div>
     );
   }
   ```

3. **Menangani Kedaluwarsa di Frontend**
   Melalui argumen `onExpired`, Anda dapat mengubah state frontend secara instan menjadi *Batal*, sembari Optionally membuat fetch API Request untuk memberitahu server bahwa statusnya sudah diubah ke Cancelled akibat waktu habis, atau Anda bisa mengandalkan mekanisme backend checks dari poin **(2.2)**.
