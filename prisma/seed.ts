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

  // Buat super admin
  const superAdmin = await prisma.admin.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      name: "Super Admin",
      username: "superadmin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  // Buat admin biasa 1
  const admin1 = await prisma.admin.upsert({
    where: { username: "admin1" },
    update: {},
    create: {
      name: "Admin Satu",
      username: "admin1",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Buat admin biasa 2
  const admin2 = await prisma.admin.upsert({
    where: { username: "admin2" },
    update: {},
    create: {
      name: "Admin Dua",
      username: "admin2",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Seeding completed!");
  console.log("👤 Created admins:");
  console.log(`   - ${superAdmin.name} (${superAdmin.username}) - ${superAdmin.role}`);
  console.log(`   - ${admin1.name} (${admin1.username}) - ${admin1.role}`);
  console.log(`   - ${admin2.name} (${admin2.username}) - ${admin2.role}`);
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
