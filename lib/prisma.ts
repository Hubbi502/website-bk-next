import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  pool: Pool;
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // Production: Use connection pooling with pg adapter
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 1, // Limit connections for serverless
  });
  const adapter = new PrismaPg(pool);
  
  prisma = new PrismaClient({
    adapter,
    log: ["error"],
  });
} else {
  // Development: Also use adapter to avoid constructor validation error
  if (!globalForPrisma.prisma) {
    globalForPrisma.pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
    });
    const adapter = new PrismaPg(globalForPrisma.pool);
    
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: ["query", "error", "warn"],
    });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
export default prisma;
