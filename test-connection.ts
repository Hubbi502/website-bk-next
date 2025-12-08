import { config } from "dotenv";
import { Pool } from "pg";

config(); // Load .env file

const testConnection = async () => {
  // Test pooled connection (port 6543)
  const pooledUrl = process.env.DATABASE_URL;
  console.log("Testing pooled connection to:", pooledUrl?.split('@')[1]?.split('?')[0]);
  
  const pool = new Pool({ connectionString: pooledUrl });
  
  try {
    const client = await pool.connect();
    console.log("✅ Connection successful!");
    
    const result = await client.query("SELECT version()");
    console.log("PostgreSQL version:", result.rows[0].version);
    
    client.release();
  } catch (error) {
    console.error("❌ Connection failed:", error);
  } finally {
    await pool.end();
  }
};

testConnection();
