import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ===== DATA KELAS =====
const grades = ["X", "XI", "XII", "XIII"];
const majors = ["RPL", "DKV", "SIJA"];
const classNumbers = [1, 2];

// Generate semua kelas: X RPL 1, X RPL 2, X DKV 1, ... XII SIJA 2
const allClasses = [];
for (const grade of grades) {
  for (const major of majors) {
    for (const num of classNumbers) {
      allClasses.push(`${grade} ${major} ${num}`);
    }
  }
}

// ===== DATA NAMA MURID (120 nama unik, 5 per kelas) =====
const studentNames = [
  // X RPL 1
  "Andi Pratama", "Bella Safitri", "Candra Wijaya", "Dina Maharani", "Eko Saputra",
  // X RPL 2
  "Fitri Handayani", "Galih Ramadhan", "Hana Pertiwi", "Irfan Maulana", "Julia Anggraini",
  // X DKV 1
  "Kevin Aditya", "Lestari Dewi", "Muhammad Rizki", "Nadia Putri", "Oscar Firmansyah",
  // X DKV 2
  "Putri Rahayu", "Qori Ahsan", "Rina Wulandari", "Satria Nugroho", "Tiara Kusuma",
  // X SIJA 1
  "Umar Faruq", "Vina Oktaviani", "Wahyu Hidayat", "Xena Puspita", "Yoga Pratama",
  // X SIJA 2
  "Zahra Amelia", "Arif Budiman", "Bunga Citra", "Cahyo Wibowo", "Devi Lestari",
  // XI RPL 1
  "Erwin Santoso", "Fani Rahmawati", "Gilang Adriansyah", "Hesti Novita", "Iwan Kurniawan",
  // XI RPL 2
  "Jasmine Putri", "Kurnia Adi", "Laras Sekar", "Muhamad Farel", "Nisa Aulia",
  // XI DKV 1
  "Oky Dermawan", "Puspita Sari", "Rangga Mahardika", "Siti Khadijah", "Taufik Hidayat",
  // XI DKV 2
  "Umi Kulsum", "Valdi Anggara", "Winda Permata", "Yusuf Hakim", "Zara Safira",
  // XI SIJA 1
  "Agus Setiawan", "Bintang Pramudya", "Cindy Aurellia", "Dimas Ardianto", "Eva Susanti",
  // XI SIJA 2
  "Fajar Nugraha", "Gita Nirmala", "Hendri Gunawan", "Intan Permatasari", "Joko Widodo",
  // XII RPL 1
  "Kartika Sari", "Lukman Hakim", "Maya Angelina", "Naufal Rafif", "Olivia Putri",
  // XII RPL 2
  "Pandu Wicaksono", "Qonita Azzahra", "Rendi Mahendra", "Sinta Dewi", "Tegar Priyambodo",
  // XII DKV 1
  "Ulfa Mariana", "Vino Bastian", "Wulan Dari", "Xavier Nugroho", "Yanti Rohani",
  // XII DKV 2
  "Zidan Alfarizi", "Anisa Rahma", "Bayu Segara", "Cantika Putri", "Damar Sasongko",
  // XII SIJA 1
  "Elsa Manurung", "Farhan Alawi", "Gina Maulida", "Hadi Pranoto", "Ika Nurjannah",
  // XII SIJA 2
  "Jihan Salsabila", "Krisna Murti", "Lina Marlina", "Mahesa Putra", "Nur Aini",
  // XIII RPL 1
  "Ophelia Kezia", "Pamela Wijaya", "Qadri Pratama", "Rossa Angelia", "Satya Kusuma",
  // XIII RPL 2
  "Tahira Maharani", "Umang Pratomo", "Venita Salsabila", "Wiguna Dharma", "Yuliana Kusuma",
  // XIII DKV 1
  "Zelda Aurora", "Abrar Muhyi", "Balqis Nur", "Chandra Kusuma", "Dinda Puspita",
  // XIII DKV 2
  "Erlina Sari", "Farida Kusuma", "Gema Pratama", "Hilda Maharani", "Ismail Nurjaman",
  // XIII SIJA 1
  "Jamila Lestari", "Kalila Putri", "Lutfi Ramadhan", "Melati Dewi", "Nandi Permana",
  // XIII SIJA 2
  "Octa Hartono", "Persada Wijaya", "Qisya Amelia", "Rasyid Pratama", "Sakti Nugraha",
];

async function main() {
  console.log("🌱 Seeding database...");
  console.log(`📚 Total kelas: ${allClasses.length}`);
  console.log(`👨‍🎓 Total murid: ${studentNames.length}`);

  // Hash password
  const adminPassword = await bcrypt.hash("guru123", 10);
  const studentPassword = await bcrypt.hash("murid123", 10);

  // ===== CREATE ADMINS =====
  console.log("\n👤 Creating admins/teachers...");

  const superAdmin = await prisma.admin.upsert({
    where: { username: "super.admin" },
    update: {},
    create: {
      name: "Super Admin",
      username: "super.admin",
      password: adminPassword,
      role: "SUPER_ADMIN",
      assignedClasses: [],
    },
  });

  // Guru BK 1 - Kelas X (RPL, DKV, SIJA)
  const guruBk1 = await prisma.admin.upsert({
    where: { username: "guru.bk1" },
    update: {},
    create: {
      name: "Ibu Siti Nurhasanah",
      username: "guru.bk1",
      password: adminPassword,
      role: "ADMIN",
      assignedClasses: allClasses.filter((c) => c.startsWith("X ")),
    },
  });

  // Guru BK 2 - Kelas XI (RPL, DKV, SIJA)
  const guruBk2 = await prisma.admin.upsert({
    where: { username: "guru.bk2" },
    update: {},
    create: {
      name: "Bapak Ahmad Hidayat",
      username: "guru.bk2",
      password: adminPassword,
      role: "ADMIN",
      assignedClasses: allClasses.filter((c) => c.startsWith("XI ")),
    },
  });

  // Guru BK 3 - Kelas XII (RPL, DKV, SIJA)
  const guruBk3 = await prisma.admin.upsert({
    where: { username: "guru.bk3" },
    update: {},
    create: {
      name: "Ibu Dewi Rahayu",
      username: "guru.bk3",
      password: adminPassword,
      role: "ADMIN",
      assignedClasses: allClasses.filter((c) => c.startsWith("XII ")),
    },
  });

  // ===== CREATE STUDENTS =====
  console.log("👨‍🎓 Creating students (5 per kelas)...");

  const students = [];
  let nisnCounter = 1;

  for (let classIdx = 0; classIdx < allClasses.length; classIdx++) {
    const className = allClasses[classIdx];
    for (let i = 0; i < 5; i++) {
      const studentIdx = classIdx * 5 + i;
      const nisn = `00${String(nisnCounter).padStart(8, "0")}`;
      const phone = `0812${String(nisnCounter).padStart(8, "0")}`;

      const student = await prisma.student.upsert({
        where: { nisn },
        update: {},
        create: {
          name: studentNames[studentIdx],
          nisn,
          password: studentPassword,
          class: className,
          phone,
        },
      });
      students.push(student);
      nisnCounter++;
    }
  }

  // ===== SUMMARY =====
  console.log("\n✅ Seeding completed!");
  console.log("\n👤 Created admins/teachers:");
  console.log(`   - ${superAdmin.name} (${superAdmin.username}) - Koordinator (semua kelas)`);
  console.log(`   - ${guruBk1.name} (${guruBk1.username}) - Kelas X [${guruBk1.assignedClasses.join(", ")}]`);
  console.log(`   - ${guruBk2.name} (${guruBk2.username}) - Kelas XI [${guruBk2.assignedClasses.join(", ")}]`);
  console.log(`   - ${guruBk3.name} (${guruBk3.username}) - Kelas XII [${guruBk3.assignedClasses.join(", ")}]`);
  console.log("   🔑 Password: guru123");

  console.log("\n🎓 Created students per class:");
  for (const className of allClasses) {
    const classStudents = students.filter((s) => s.class === className);
    console.log(`   📘 ${className}:`);
    classStudents.forEach((s) => {
      console.log(`      - ${s.name} (NISN: ${s.nisn})`);
    });
  }
  console.log("   🔑 Password: murid123");
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
