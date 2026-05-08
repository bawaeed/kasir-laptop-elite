import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * 🚀 PRISMA CLIENT (VERSI FIX PRISMA 7)
 * Kita gunakan "datasourceUrl" (bukan datasources)
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * 📝 FUNGSI CATAT LOG AKTIFITAS
 */
export async function catatLog(userId: any, aktivitas: string, keterangan: string) {
  try {
    // Konversi ke angka untuk Int
    const idAngka = userId ? parseInt(userId) : null;
    const finalId = isNaN(idAngka as number) ? null : idAngka;

    await (prisma as any).logAktifitas.create({
      data: {
        user_id: finalId,
        aktivitas: aktivitas,
        keterangan: keterangan,
        waktu: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Gagal mencatat log:", error);
  }
}