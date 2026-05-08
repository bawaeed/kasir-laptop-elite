import { PrismaClient } from "@prisma/client";

// Mencegah Prisma membuat koneksi baru berkali-kali saat proses development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * 📝 FUNGSI CATAT LOG AKTIFITAS
 * Mengamankan konversi ID dari String (Session) ke Int (Database)
 */
export async function catatLog(userId: any, aktivitas: string, keterangan: string) {
  try {
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