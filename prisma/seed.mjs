import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Hash password
  const hashedPassword = await bcrypt.hash("guru123", 10);

  // Buat admin super admin (koordinator - bisa tangani semua kelas)
  const superAdmin = await prisma.admin.upsert({
    where: { username: "super.admin" },
    update: {},
    create: {
      name: "Super Admin",
      username: "super.admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      assignedClasses: [], // Super Admin bisa tangani semua kelas
    },
  });

  // Buat guru BK untuk kelas X
  const guruBk1 = await prisma.admin.upsert({
    where: { username: "guru.bk1" },
    update: {},
    create: {
      name: "Ibu Siti Nurhasanah",
      username: "guru.bk1",
      password: hashedPassword,
      role: "ADMIN",
      assignedClasses: ["X RPL 1", "X RPL 2", "X SIJA 1", "X SIJA 2"],
    },
  });

  // Buat guru BK untuk kelas XI
  const guruBk2 = await prisma.admin.upsert({
    where: { username: "guru.bk2" },
    update: {},
    create: {
      name: "Bapak Ahmad Hidayat",
      username: "guru.bk2",
      password: hashedPassword,
      role: "ADMIN",
      assignedClasses: ["XI RPL 1", "XI RPL 2", "XI SIJA 1", "XI SIJA 2"],
    },
  });

  // Buat guru BK untuk kelas XII
  const guruBk3 = await prisma.admin.upsert({
    where: { username: "guru.bk3" },
    update: {},
    create: {
      name: "Ibu Dewi Rahayu",
      username: "guru.bk3",
      password: hashedPassword,
      role: "ADMIN",
      assignedClasses: ["XII RPL 1", "XII RPL 2", "XII SIJA 1", "XII SIJA 2"],
    },
  });

  // Hash password untuk murid
  const studentPassword = await bcrypt.hash("murid123", 10);

  // Buat murid-murid (kelas sesuai dengan assignedClasses guru)
  // Siswa Kelas X RPL
  const student1 = await prisma.student.upsert({
    where: { nisn: "0012345001" },
    update: {},
    create: {
      name: "Andi Pratama",
      nisn: "0012345001",
      password: studentPassword,
      class: "X RPL 1",
      phone: "081234500001",
    },
  });

  const student2 = await prisma.student.upsert({
    where: { nisn: "0012345002" },
    update: {},
    create: {
      name: "Bella Safitri",
      nisn: "0012345002",
      password: studentPassword,
      class: "X RPL 2",
      phone: "081234500002",
    },
  });

  // Siswa Kelas X SIJA
  const student3 = await prisma.student.upsert({
    where: { nisn: "0012345003" },
    update: {},
    create: {
      name: "Candra Wijaya",
      nisn: "0012345003",
      password: studentPassword,
      class: "X SIJA 1",
      phone: "081234500003",
    },
  });

  // Siswa Kelas XI RPL
  const student4 = await prisma.student.upsert({
    where: { nisn: "0012345004" },
    update: {},
    create: {
      name: "Dian Permata",
      nisn: "0012345004",
      password: studentPassword,
      class: "XI RPL 1",
      phone: "081234500004",
    },
  });

  const student5 = await prisma.student.upsert({
    where: { nisn: "0012345005" },
    update: {},
    create: {
      name: "Eko Saputra",
      nisn: "0012345005",
      password: studentPassword,
      class: "XI RPL 2",
      phone: "081234500005",
    },
  });

  // Siswa Kelas XI SIJA
  const student6 = await prisma.student.upsert({
    where: { nisn: "0012345006" },
    update: {},
    create: {
      name: "Fitri Handayani",
      nisn: "0012345006",
      password: studentPassword,
      class: "XI SIJA 1",
      phone: "081234500006",
    },
  });

  // Siswa Kelas XII RPL
  const student7 = await prisma.student.upsert({
    where: { nisn: "0012345007" },
    update: {},
    create: {
      name: "Galih Ramadhan",
      nisn: "0012345007",
      password: studentPassword,
      class: "XII RPL 1",
      phone: "081234500007",
    },
  });

  const student8 = await prisma.student.upsert({
    where: { nisn: "0012345008" },
    update: {},
    create: {
      name: "Hana Pertiwi",
      nisn: "0012345008",
      password: studentPassword,
      class: "XII RPL 2",
      phone: "081234500008",
    },
  });

  // Siswa Kelas XII SIJA
  const student9 = await prisma.student.upsert({
    where: { nisn: "0012345009" },
    update: {},
    create: {
      name: "Irfan Maulana",
      nisn: "0012345009",
      password: studentPassword,
      class: "XII SIJA 1",
      phone: "081234500009",
    },
  });

  const student10 = await prisma.student.upsert({
    where: { nisn: "0012345010" },
    update: {},
    create: {
      name: "Julia Anggraini",
      nisn: "0012345010",
      password: studentPassword,
      class: "XII SIJA 2",
      phone: "081234500010",
    },
  });

  console.log("✅ Seeding completed!");
  console.log("\n👤 Created admins/teachers:");
  console.log(`   - ${superAdmin.name} (${superAdmin.username}) - Koordinator (semua kelas)`);
  console.log(`   - ${guruBk1.name} (${guruBk1.username}) - Kelas X`);
  console.log(`   - ${guruBk2.name} (${guruBk2.username}) - Kelas XI`);
  console.log(`   - ${guruBk3.name} (${guruBk3.username}) - Kelas XII`);
  console.log("   🔑 Password: guru123");

  console.log("\n🎓 Created students:");
  const students = [student1, student2, student3, student4, student5, student6, student7, student8, student9, student10];
  students.forEach(s => {
    console.log(`   - ${s.name} (NISN: ${s.nisn}) - ${s.class}`);
  });
  console.log("   🔑 Password: murid123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
