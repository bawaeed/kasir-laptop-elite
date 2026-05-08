import { PrismaClient } from "@prisma/client";

/**
 * 🏗️ SINGLETON PATTERN
 * Menjamin hanya ada 1 koneksi database yang aktif di laptop Anda.
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["error", "warn"],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

/**
 * 📝 FUNGSI CATAT LOG AKTIFITAS
 * Mencatat setiap gerak-gerik user ke tabel LogAktifitas secara otomatis.
 * @param userId - ID dari session (bisa string atau null)
 * @param aktivitas - Judul kegiatan (contoh: "LOGIN", "TAMBAH_LAPTOP")
 * @param keterangan - Detail kegiatan
 */
export async function catatLog(
  userId: string | number | null | undefined, 
  aktivitas: string, 
  keterangan: string
) {
  try {
    // 🛡️ Validasi ID: Paksa menjadi angka (Int) atau null jika gagal
    const parsedId = userId ? parseInt(userId.toString(), 10) : null;
    const finalUserId = isNaN(parsedId as number) ? null : parsedId;

    await prisma.logAktifitas.create({
      data: {
        user_id: finalUserId,
        aktivitas: aktivitas,
        keterangan: keterangan,
        waktu: new Date(), // Menggunakan jam laptop saat ini
      },
    });

    console.log(`📡 [LOG]: ${aktivitas} berhasil dicatat.`);
  } catch (error) {
    // Kita tidak ingin aplikasi berhenti hanya karena gagal mencatat log
    console.error("❌ [LOG_ERROR]: Gagal mencatat aktivitas ke database:", error);
  }
}