import { PrismaClient } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config();

// Use direct URL for seeding
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["query", "error", "warn"],
});

async function main() {
  console.log("🌱 Seeding database...");

  // Hash passwords
  const adminPassword = await bcrypt.hash("guru123", 10);
  const studentPassword = await bcrypt.hash("siswa123", 10);

  // ===== CREATE ADMINS =====
  console.log("👤 Creating admins...");
  
  const superAdmin = await prisma.admin.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      name: "Super Admin BK",
      username: "superadmin",
      password: adminPassword,
      role: "SUPER_ADMIN",
      assignedClasses: [],
    },
  });

  const admin1 = await prisma.admin.upsert({
    where: { username: "guru.bk1" },
    update: {},
    create: {
      name: "Ibu Siti Nurhaliza",
      username: "guru.bk1",
      password: adminPassword,
      role: "ADMIN",
      assignedClasses: ["10A", "10B", "10C"],
    },
  });

  const admin2 = await prisma.admin.upsert({
    where: { username: "guru.bk2" },
    update: {},
    create: {
      name: "Bapak Ahmad Maulana",
      username: "guru.bk2",
      password: adminPassword,
      role: "ADMIN",
      assignedClasses: ["11A", "11B", "11C"],
    },
  });

  const admin3 = await prisma.admin.upsert({
    where: { username: "guru.bk3" },
    update: {},
    create: {
      name: "Ibu Dewi Lestari",
      username: "guru.bk3",
      password: adminPassword,
      role: "ADMIN",
      assignedClasses: ["12A", "12B", "12C"],
    },
  });

  // ===== CREATE STUDENTS =====
  console.log("👨‍🎓 Creating students...");
  
  const students = await Promise.all([
    prisma.student.upsert({
      where: { nisn: "0012345678" },
      update: {},
      create: {
        name: "Andi Pratama",
        nisn: "0012345678",
        password: studentPassword,
        class: "10A",
        phone: "081234567890",
      },
    }),
    prisma.student.upsert({
      where: { nisn: "0012345679" },
      update: {},
      create: {
        name: "Budi Santoso",
        nisn: "0012345679",
        password: studentPassword,
        class: "10B",
        phone: "081234567891",
      },
    }),
    prisma.student.upsert({
      where: { nisn: "0012345680" },
      update: {},
      create: {
        name: "Citra Dewi",
        nisn: "0012345680",
        password: studentPassword,
        class: "11A",
        phone: "081234567892",
      },
    }),
    prisma.student.upsert({
      where: { nisn: "0012345681" },
      update: {},
      create: {
        name: "Dinda Putri",
        nisn: "0012345681",
        password: studentPassword,
        class: "11B",
        phone: "081234567893",
      },
    }),
    prisma.student.upsert({
      where: { nisn: "0012345682" },
      update: {},
      create: {
        name: "Eko Wijaya",
        nisn: "0012345682",
        password: studentPassword,
        class: "12A",
        phone: "081234567894",
      },
    }),
  ]);

  // ===== CREATE ARTICLES =====
  console.log("📝 Creating articles...");
  
  const articles = await Promise.all([
    prisma.article.create({
      data: {
        title: "Mengenal Bimbingan Konseling di Sekolah",
        excerpt: "Bimbingan konseling adalah layanan bantuan untuk siswa agar dapat mengenal dan mengembangkan potensi diri secara optimal.",
        content: `# Mengenal Bimbingan Konseling di Sekolah

Bimbingan konseling merupakan layanan yang sangat penting bagi perkembangan siswa. Melalui layanan ini, siswa dapat:

## Tujuan Bimbingan Konseling
- Membantu siswa mengenal diri sendiri
- Mengembangkan potensi secara optimal
- Mengatasi masalah pribadi, sosial, dan akademik
- Merencanakan masa depan dengan baik

## Layanan yang Tersedia
1. **Konseling Individual**: Siswa dapat berkonsultasi secara pribadi dengan guru BK
2. **Konseling Kelompok**: Belajar bersama dalam kelompok kecil
3. **Bimbingan Klasikal**: Layanan bimbingan di kelas
4. **Konsultasi**: Berkonsultasi tentang berbagai permasalahan

Jangan ragu untuk mengunjungi ruang BK jika membutuhkan bantuan!`,
        image: "/uploads/articles/bk-introduction.jpg",
        category: "Informasi",
        readTime: "5 min read",
        authorId: admin1.id,
      },
    }),
    prisma.article.create({
      data: {
        title: "Tips Mengatasi Kecemasan Menghadapi Ujian",
        excerpt: "Ujian memang bisa menimbulkan kecemasan. Berikut tips praktis untuk mengatasinya agar bisa menghadapi ujian dengan lebih tenang.",
        content: `# Tips Mengatasi Kecemasan Menghadapi Ujian

Kecemasan saat menghadapi ujian adalah hal yang wajar dialami siswa. Namun, kecemasan berlebihan dapat mengganggu performa. Berikut tips mengatasinya:

## Persiapan Mental
- **Persiapkan diri dengan baik**: Belajar secara teratur jauh sebelum ujian
- **Istirahat cukup**: Tidur minimal 7-8 jam sebelum ujian
- **Sarapan sehat**: Jangan melewatkan sarapan di hari ujian

## Teknik Relaksasi
1. **Bernapas dalam-dalam**: Tarik napas perlahan, tahan beberapa detik, lalu hembuskan
2. **Afirmasi positif**: Katakan pada diri sendiri "Saya sudah siap"
3. **Visualisasi**: Bayangkan diri berhasil mengerjakan soal dengan baik

## Saat Mengerjakan Ujian
- Baca soal dengan teliti
- Kerjakan soal yang mudah terlebih dahulu
- Jangan panik jika ada soal sulit
- Kelola waktu dengan bijak

Ingat, ujian hanya mengukur pengetahuan, bukan menentukan nilai dirimu!`,
        image: "/uploads/articles/exam-anxiety.jpg",
        category: "Tips & Trik",
        readTime: "7 min read",
        authorId: admin2.id,
      },
    }),
    prisma.article.create({
      data: {
        title: "Pentingnya Kesehatan Mental Remaja",
        excerpt: "Kesehatan mental sama pentingnya dengan kesehatan fisik. Yuk, kenali tanda-tanda dan cara menjaga kesehatan mental!",
        content: `# Pentingnya Kesehatan Mental Remaja

Di masa remaja, banyak perubahan yang terjadi - baik fisik maupun emosional. Kesehatan mental menjadi sangat penting untuk diperhatikan.

## Tanda-Tanda Masalah Kesehatan Mental
- Perubahan mood yang drastis
- Menarik diri dari pergaulan
- Penurunan prestasi akademik
- Gangguan tidur atau pola makan
- Kehilangan minat pada aktivitas favorit

## Cara Menjaga Kesehatan Mental
1. **Komunikasi terbuka**: Ceritakan perasaanmu pada orang yang dipercaya
2. **Aktivitas fisik**: Olahraga teratur membantu mengurangi stress
3. **Hobi positif**: Lakukan hal yang kamu sukai
4. **Istirahat cukup**: Jaga pola tidur yang teratur
5. **Mindfulness**: Latih kesadaran akan pikiran dan perasaan

## Kapan Harus Mencari Bantuan?
Jika kamu merasa:
- Sedih berkepanjangan tanpa alasan jelas
- Sulit konsentrasi dan menyelesaikan tugas
- Memiliki pikiran untuk menyakiti diri
- Merasa sangat cemas hampir setiap hari

**Segera hubungi guru BK atau konselor profesional!**

Remember: Meminta bantuan adalah tanda kekuatan, bukan kelemahan!`,
        image: "/uploads/articles/mental-health.jpg",
        category: "Kesehatan Mental",
        readTime: "8 min read",
        authorId: admin1.id,
      },
    }),
    prisma.article.create({
      data: {
        title: "Cara Membangun Komunikasi Efektif dengan Teman",
        excerpt: "Komunikasi yang baik adalah kunci hubungan pertemanan yang sehat. Pelajari cara berkomunikasi yang efektif!",
        content: `# Cara Membangun Komunikasi Efektif dengan Teman

Komunikasi adalah jembatan dalam setiap hubungan, termasuk pertemanan. Komunikasi yang efektif membuat hubungan lebih harmonis.

## Prinsip Komunikasi Efektif
- **Mendengar aktif**: Dengarkan dengan sungguh-sungguh, bukan hanya menunggu giliran bicara
- **Empati**: Coba pahami perasaan dan sudut pandang teman
- **Jujur tapi sopan**: Sampaikan pendapat dengan jujur namun tetap menghormati
- **Non-verbal**: Perhatikan bahasa tubuh dan ekspresi wajah

## Tips Berkomunikasi
1. **Pilih waktu yang tepat**: Jangan membicarakan hal serius saat teman sedang sibuk atau marah
2. **Gunakan "I statement"**: Contoh: "Aku merasa..." bukan "Kamu selalu..."
3. **Hindari asumsi**: Tanyakan langsung daripada menebak-nebak
4. **Berikan feedback positif**: Apresiasi hal-hal baik yang dilakukan teman

## Mengatasi Konflik
- Tetap tenang dan jangan emosional
- Fokus pada masalah, bukan menyerang pribadi
- Cari solusi win-win
- Belajar meminta maaf dan memaafkan

Ingat, komunikasi yang baik perlu latihan dan kesabaran!`,
        image: "/uploads/articles/communication.jpg",
        category: "Sosial",
        readTime: "6 min read",
        authorId: admin3.id,
      },
    }),
    prisma.article.create({
      data: {
        title: "Merencanakan Karir: Kenali Passion dan Bakatmu",
        excerpt: "Bingung mau kuliah atau kerja di bidang apa? Mari kenali passion dan bakat untuk merencanakan masa depan!",
        content: `# Merencanakan Karir: Kenali Passion dan Bakatmu

Merencanakan karir sejak dini akan membantumu lebih siap menghadapi masa depan. Langkah pertama adalah mengenali diri sendiri.

## Mengenali Passion
Passion adalah hal yang kamu sukai dan membuatmu bersemangat. Tanyakan pada diri:
- Apa yang membuatku excited?
- Kegiatan apa yang tidak terasa berat?
- Topik apa yang sering aku pelajari tanpa dipaksa?

## Mengidentifikasi Bakat
Bakat adalah kemampuan alami yang kamu miliki. Cara mengidentifikasi:
- Apa yang sering dipuji orang lain dari dirimu?
- Skill apa yang kamu kuasai dengan cepat?
- Di bidang apa kamu lebih unggul dari teman?

## Eksplorasi Karir
1. **Riset berbagai profesi**: Pelajari berbagai bidang pekerjaan
2. **Job shadowing**: Ikuti profesional dalam kesehariannya
3. **Magang**: Coba pengalaman kerja nyata
4. **Konsultasi**: Bicara dengan guru BK atau konselor karir

## Langkah Perencanaan
- Tentukan tujuan jangka pendek dan panjang
- Buat rencana pendidikan (SMA, kuliah, kursus)
- Kembangkan skill yang dibutuhkan
- Bangun networking sejak dini
- Tetap fleksibel dan terbuka dengan perubahan

Guru BK siap membantumu dalam konsultasi perencanaan karir!`,
        image: "/uploads/articles/career-planning.jpg",
        category: "Karir",
        readTime: "10 min read",
        authorId: admin2.id,
      },
    }),
  ]);

  // ===== CREATE COMMENTS =====
  console.log("💬 Creating comments...");
  
  await Promise.all([
    // Comments on first article
    prisma.comment.create({
      data: {
        content: "Artikel yang sangat bermanfaat! Jadi lebih paham tentang BK.",
        articleId: articles[0].id,
        studentId: students[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "Terima kasih atas infonya Bu. Saya jadi tidak ragu lagi untuk ke ruang BK.",
        articleId: articles[0].id,
        studentId: students[1].id,
      },
    }),
    // Anonymous comment
    prisma.comment.create({
      data: {
        content: "Sangat membantu untuk siswa baru seperti saya.",
        articleId: articles[0].id,
        name: "Siswa Baru",
        email: "siswa@example.com",
      },
    }),
    // Comments on second article
    prisma.comment.create({
      data: {
        content: "Tips yang praktis! Akan saya coba saat UTS nanti.",
        articleId: articles[1].id,
        studentId: students[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "Teknik bernapas dalam-dalam sangat membantu saya. Terima kasih!",
        articleId: articles[1].id,
        studentId: students[3].id,
      },
    }),
    // Comments on mental health article
    prisma.comment.create({
      data: {
        content: "Artikel ini mengingatkan saya untuk lebih peduli pada kesehatan mental. Thanks!",
        articleId: articles[2].id,
        studentId: students[4].id,
      },
    }),
  ]);

  // ===== CREATE VISITS =====
  console.log("📅 Creating visits...");
  
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  await Promise.all([
    // Pending visit
    prisma.visit.create({
      data: {
        visitDate: tomorrow,
        visitTime: "10:00",
        reason: "Saya ingin berkonsultasi mengenai masalah dengan teman sekelas.",
        status: "PENDING",
        studentId: students[0].id,
        targetTeacherId: admin1.id,
      },
    }),
    // Approved visit
    prisma.visit.create({
      data: {
        visitDate: nextWeek,
        visitTime: "13:00",
        reason: "Konsultasi mengenai pemilihan jurusan kuliah.",
        status: "APPROVED",
        notes: "Silakan datang tepat waktu. Bawa nilai raport semester terakhir.",
        studentId: students[2].id,
        targetTeacherId: admin2.id,
        approvedBy: admin2.id,
      },
    }),
    // Completed visit
    prisma.visit.create({
      data: {
        visitDate: new Date(now.setDate(now.getDate() - 3)),
        visitTime: "09:00",
        reason: "Saya merasa stress karena tekanan belajar.",
        status: "COMPLETED",
        notes: "Sudah diberikan teknik manajemen stress dan relaksasi. Follow-up 2 minggu lagi.",
        studentId: students[3].id,
        targetTeacherId: admin1.id,
        approvedBy: admin1.id,
      },
    }),
    // Forwarded to coordinator
    prisma.visit.create({
      data: {
        visitDate: new Date(now.setDate(now.getDate() + 2)),
        visitTime: "14:00",
        reason: "Masalah perundungan yang saya alami di sekolah.",
        status: "FORWARDED",
        forwardedToCoordinator: true,
        forwardReason: "Kasus perundungan memerlukan penanganan koordinator BK.",
        studentId: students[1].id,
        targetTeacherId: admin1.id,
        approvedBy: admin1.id,
        delegatedToTeacherId: superAdmin.id,
        delegationStatus: "PENDING",
      },
    }),
    // Anonymous visit
    prisma.visit.create({
      data: {
        visitDate: new Date(now.setDate(now.getDate() + 5)),
        visitTime: "11:00",
        reason: "Ingin curhat tentang masalah keluarga.",
        status: "PENDING",
        studentName: "Siswa Anonymous",
        class: "11C",
        email: "anonymous@student.com",
        phone: "081234567899",
        targetTeacherId: admin3.id,
      },
    }),
    // Delegated visit
    prisma.visit.create({
      data: {
        visitDate: new Date(now.setDate(now.getDate() + 4)),
        visitTime: "15:00",
        reason: "Konsultasi tentang masalah motivasi belajar.",
        status: "FORWARDED",
        studentId: students[4].id,
        targetTeacherId: admin2.id,
        approvedBy: admin2.id,
        delegatedToTeacherId: admin3.id,
        delegationStatus: "ACCEPTED",
        delegationNotes: "Akan ditangani dengan pendekatan motivasi intrinsik.",
      },
    }),
  ]);

  // ===== SUMMARY =====
  console.log("\n✅ Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log("─────────────────────────────────────────");
  console.log("👤 Admins:");
  console.log(`   - ${superAdmin.name} (${superAdmin.username}) - ${superAdmin.role}`);
  console.log(`   - ${admin1.name} (${admin1.username}) - ${admin1.role} - Kelas: ${admin1.assignedClasses.join(", ")}`);
  console.log(`   - ${admin2.name} (${admin2.username}) - ${admin2.role} - Kelas: ${admin2.assignedClasses.join(", ")}`);
  console.log(`   - ${admin3.name} (${admin3.username}) - ${admin3.role} - Kelas: ${admin3.assignedClasses.join(", ")}`);
  
  console.log("\n👨‍🎓 Students:");
  students.forEach(s => {
    console.log(`   - ${s.name} (NISN: ${s.nisn}) - Kelas: ${s.class}`);
  });
  
  console.log("\n📝 Articles:");
  articles.forEach(a => {
    console.log(`   - ${a.title} (${a.category})`);
  });
  
  console.log("\n💬 Comments: 6 comments created");
  console.log("📅 Visits: 6 visits created with various statuses");
  
  console.log("\n🔑 Default Passwords:");
  console.log("   - Admin/Guru: guru123");
  console.log("   - Siswa: siswa123");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
