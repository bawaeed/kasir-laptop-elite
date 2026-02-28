/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth, signOut } from "@/auth";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";

export async function gantiPasswordAction(prevState: any, formData: FormData) {
  const passwordLama = formData.get("passwordLama") as string;
  const passwordBaru = formData.get("passwordBaru") as string;
  
  const session = await auth();
  const username = session?.user?.name;

  if (!username) return { success: false, message: "Sesi habis, silakan login ulang." };

  try {
    const result = await pool.query('SELECT * FROM "Users" WHERE username = $1', [username]);
    const user = result.rows[0];

    // Cek password lama
    const isValid = await bcrypt.compare(passwordLama, user.password);
    
    if (!isValid) {
      return { success: false, message: "Password lama salah! Coba lagi." };
    }

    // Hash password baru dan simpan
    const newHashedPassword = await bcrypt.hash(passwordBaru, 10);
    await pool.query('UPDATE "Users" SET password = $1 WHERE username = $2', [newHashedPassword, username]);
    
    // Sukses: Redirect keluar
    await signOut({ redirectTo: "/login" });
    return { success: true, message: "Password berhasil diubah!" };

  } catch (error) {
    return { success: false, message: "Terjadi kesalahan pada server." };
  }
}