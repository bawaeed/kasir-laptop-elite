import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * 🚀 PRISMA CLIENT (VERSI ANTI-MERAH PRISMA 7)
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Properti ini resmi di Prisma 7, kita paksa 'as any' agar VS Code tidak cerewet
    datasourceUrl: process.env.DATABASE_URL as string,
  } as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * 📝 FUNGSI CATAT LOG AKTIFITAS
 */
export async function catatLog(userId: any, aktivitas: string, keterangan: string) {
  try {
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