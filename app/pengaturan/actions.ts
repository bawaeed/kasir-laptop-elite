/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db"; // ✅ MENGGUNAKAN PRISMA
import bcrypt from "bcryptjs";

export async function gantiPasswordAction(prevState: any, formData: FormData) {
  const passwordLama = formData.get("passwordLama") as string;
  const passwordBaru = formData.get("passwordBaru") as string;
  
  const session = await auth();
  const username = session?.user?.name;

  if (!username) return { success: false, message: "Sesi habis, silakan login ulang." };

  try {
    // 📡 MENCARI USER VIA PRISMA
    const user = await prisma.user.findUnique({
      where: { username: username }
    });

    if (!user) {
      return { success: false, message: "Pengguna tidak ditemukan di database." };
    }

    // Cek kecocokan password lama
    const isValid = await bcrypt.compare(passwordLama, user.password);
    
    if (!isValid) {
      return { success: false, message: "Password lama salah! Coba lagi." };
    }

    // Hash password baru
    const newHashedPassword = await bcrypt.hash(passwordBaru, 10);
    
    // 💾 UPDATE PASSWORD VIA PRISMA
    await prisma.user.update({
      where: { username: username },
      data: { password: newHashedPassword }
    });
    
    // Sukses: Paksa user keluar agar login dengan password baru
    await signOut({ redirectTo: "/login" });
    return { success: true, message: "Password berhasil diubah!" };

  } catch (error) {
    console.error("Gagal mengganti password:", error);
    return { success: false, message: "Terjadi kesalahan pada server." };
  }
}
