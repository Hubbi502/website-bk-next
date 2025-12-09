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

  // Buat admin super admin
  const superAdmin = await prisma.admin.upsert({
    where: { username: "super.admin" },
    update: {},
    create: {
      name: "Super Admin",
      username: "super.admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  // Buat admin biasa
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Admin",
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Hash password untuk murid
  const studentPassword = await bcrypt.hash("murid123", 10);

  // Buat murid-murid
  const student1 = await prisma.student.upsert({
    where: { nisn: "1234567890" },
    update: {},
    create: {
      name: "Budi Santoso",
      nisn: "1234567890",
      password: studentPassword,
      class: "XII IPA 1",
      phone: "081234567890",
    },
  });

  const student2 = await prisma.student.upsert({
    where: { nisn: "1234567891" },
    update: {},
    create: {
      name: "Siti Nurhaliza",
      nisn: "1234567891",
      password: studentPassword,
      class: "XII IPS 2",
      phone: "081234567891",
    },
  });

  const student3 = await prisma.student.upsert({
    where: { nisn: "1234567892" },
    update: {},
    create: {
      name: "Ahmad Fauzi",
      nisn: "1234567892",
      password: studentPassword,
      class: "XI IPA 3",
      phone: "081234567892",
    },
  });

  const student4 = await prisma.student.upsert({
    where: { nisn: "1234567893" },
    update: {},
    create: {
      name: "Dewi Lestari",
      nisn: "1234567893",
      password: studentPassword,
      class: "XI IPS 1",
      phone: "081234567893",
    },
  });

  const student5 = await prisma.student.upsert({
    where: { nisn: "1234567894" },
    update: {},
    create: {
      name: "Rian Pratama",
      nisn: "1234567894",
      password: studentPassword,
      class: "X MIPA 2",
      phone: "081234567894",
    },
  });

  console.log("✅ Seeding completed!");
  console.log("\n👤 Created admins:");
  console.log(`   - ${superAdmin.name} (${superAdmin.username})`);
  console.log(`   - ${admin.name} (${admin.username})`);
  console.log("   🔑 Password: guru123");
  
  console.log("\n🎓 Created students:");
  console.log(`   - ${student1.name} (NISN: ${student1.nisn}) - ${student1.class}`);
  console.log(`   - ${student2.name} (NISN: ${student2.nisn}) - ${student2.class}`);
  console.log(`   - ${student3.name} (NISN: ${student3.nisn}) - ${student3.class}`);
  console.log(`   - ${student4.name} (NISN: ${student4.nisn}) - ${student4.class}`);
  console.log(`   - ${student5.name} (NISN: ${student5.nisn}) - ${student5.class}`);
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
