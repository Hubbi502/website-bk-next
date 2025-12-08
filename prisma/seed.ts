import { PrismaClient } from "@prisma/client";
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
      role: "Guru BK Senior",
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
      role: "Guru BK",
    },
  });

  console.log("✅ Seeding completed!");
  console.log("👤 Created admins:");
  console.log(`   - ${superAdmin.name} (${superAdmin.username})`);
  console.log(`   - ${admin.name} (${admin.username})`);
  console.log("\n🔑 Default password: guru123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
