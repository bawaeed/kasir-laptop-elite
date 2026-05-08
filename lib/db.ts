import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Kita buat instance dengan pengecekan ketat untuk Prisma 7
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        // ✅ "as string" memastikan TypeScript tidak protes baris 12
        url: process.env.DATABASE_URL as string,
      },
    },
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * 📝 FUNGSI CATAT LOG AKTIFITAS
 */
export async function catatLog(userId: any, aktivitas: string, keterangan: string) {
  try {
    // ✅ Pastikan userId adalah angka sebelum dikirim ke database
    const idAngka = userId ? parseInt(userId) : null;
    const finalUserId = isNaN(idAngka as number) ? null : idAngka;

    await prisma.logAktifitas.create({
      data: {
        // ✅ Baris 33 sekarang aman karena finalUserId sudah pasti number | null
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