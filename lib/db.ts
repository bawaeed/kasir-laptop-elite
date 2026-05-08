import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 🚀 Konfigurasi Prisma 7 Murni
// Vercel & Prisma akan otomatis membaca dari prisma.config.ts
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * 📝 FUNGSI CATAT LOG AKTIFITAS
 */
export async function catatLog(userId: any, aktivitas: string, keterangan: string) {
  try {
    // Memastikan konversi ke Int (Angka) aman agar tidak crash
    const idAngka = userId ? parseInt(userId) : null;
    const finalUserId = isNaN(idAngka as number) ? null : idAngka;

    await prisma.logAktifitas.create({
      data: {
        user_id: finalUserId,
        aktivitas: aktivitas,
        keterangan: keterangan,
        waktu: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Gagal mencatat log:", error);
  }
}