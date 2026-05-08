import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. Buat koneksi pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Bungkus dengan Adapter (WAJIB di Prisma 7)
const adapter = new PrismaPg(pool);

// 3. Singleton Pattern
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // 🔥 INILAH YANG DIMINTA OLEH ERROR TADI!
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function catatLog(userId: number | string | undefined, aktivitas: string, keterangan: string) {
  try {
    await prisma.logAktifitas.create({
      data: {
        user_id: userId?.toString() || null,
        aktivitas: aktivitas,
        keterangan: keterangan,
        waktu: new Date(),
      },
    });
  } catch (error) {
    console.error("🚨 Gagal mencatat log via Prisma:", error);
  }
}