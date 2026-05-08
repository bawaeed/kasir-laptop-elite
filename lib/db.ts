import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * 📝 FUNGSI CATAT LOG AKTIFITAS
 * Disesuaikan dengan skema Prisma 7 (user_id adalah Int)
 */
export async function catatLog(userId: any, aktivitas: string, keterangan: string) {
  try {
    // 💡 Kita konversi userId ke Number agar cocok dengan skema database (Int)
    // Jika userId tidak ada atau bukan angka, kita set null
    const idAngka = userId ? Number(userId) : null;

    await prisma.logAktifitas.create({
      data: {
        user_id: isNaN(idAngka as number) ? null : idAngka, // Pastikan benar-benar angka
        aktivitas: aktivitas,
        keterangan: keterangan,
        waktu: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Gagal mencatat log:", error);
  }
}