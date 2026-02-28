import { Pool } from 'pg';

const globalForPg = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool =
  globalForPg.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;

// ==========================================
// 🛠️ SCRIPT DOKTER DATABASE (AUTO-FIX) 🛠️
// ==========================================
const fixDatabase = async () => {
  try {
    await pool.query(`
      ALTER TABLE "Laptop" 
      ADD COLUMN IF NOT EXISTS date_in DATE DEFAULT CURRENT_DATE,
      ADD COLUMN IF NOT EXISTS date_out DATE NULL;
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "ActivityLog" (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 🌟 BARU: Tambahkan kolom 'role' di tabel Users (Default sebagai kasir)
    await pool.query(`
      ALTER TABLE "Users" 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'kasir';
    `);

    // 🌟 BARU: Pastikan akun 'admin' yang sudah ada otomatis diberi pangkat 'admin'
    await pool.query(`UPDATE "Users" SET role = 'admin' WHERE username = 'admin'`);

    console.log("✅ DOKTER DATABASE: Tabel Log & Sistem Multi-Akun (Role) Siap Sedia!");
  } catch (err) {
    console.error("🚨 INFO DOKTER DATABASE:", err);
  }
};

fixDatabase();

export async function catatLog(username: string, action: string, description: string) {
  try {
    await pool.query(
      `INSERT INTO "ActivityLog" (username, action, description) VALUES ($1, $2, $3)`,
      [username, action, description]
    );
  } catch (error) {
    console.error("🚨 Gagal mencatat log aktifitas:", error);
  }
}