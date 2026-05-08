"use server";

import { auth } from "@/auth";
import { prisma, catatLog } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function gantiSandiAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Tidak diizinkan" };

  const oldPassword = formData.get("old_password") as string;
  const newPassword = formData.get("new_password") as string;

  try {
    // 1. Ambil data user dari DB
    const user = await prisma.user.findUnique({
      where: { id: Number((session.user as any).id) }
    });

    if (!user) return { error: "User tidak ditemukan" };

    // 2. Verifikasi Password Lama
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return { error: "Kata sandi lama salah!" };

    // 3. Hash Password Baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update Database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // 5. Catat Log
    await catatLog(user.id, "GANTI_SANDI", `User ${user.username} mengubah sandinya sendiri`);

    return { success: true };
  } catch (error) {
    return { error: "Gagal memproses permintaan" };
  }
}