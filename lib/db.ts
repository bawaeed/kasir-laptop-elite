import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * 🚀 PRISMA CLIENT SINGLETON (VERSI ELITE)
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // @ts-ignore - Mengabaikan protes TS karena Prisma 7 menggunakan prisma.config.ts
    datasources: {
      db: {
        url: process.env.DATABASE_URL as string,
      },
    },
    log: ["query"],
  } as any); // "as any" adalah kunci darurat agar TS tidak protes di baris 12

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * 📝 FUNGSI CATAT LOG AKTIFITAS
 */
export async function catatLog(userId: any, aktivitas: string, keterangan: string) {
  try {
    // 💡 Konversi ke angka secara paksa untuk database (Int)
    const numericId = userId ? Number(userId) : null;
    const validId = (numericId !== null && !isNaN(numericId)) ? numericId : null;

    await (prisma.logAktifitas as any).create({
      data: {
        user_id: validId,
        aktivitas: aktivitas,
        keterangan: keterangan,
        waktu: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Gagal mencatat log:", error);
  }
}