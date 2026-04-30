import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

const adapter = new PrismaPg(pool);
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function catatLog(userId: number | string | undefined, aktivitas: string, keterangan: string) {
  try {
    await pool.query(
      'INSERT INTO "LogAktifitas" (user_id, aktivitas, keterangan, waktu) VALUES ($1, $2, $3, NOW())',
      [userId || null, aktivitas, keterangan]
    );
  } catch (error) {
    console.error("🚨 Gagal mencatat log:", error);
  }
}

export { pool };