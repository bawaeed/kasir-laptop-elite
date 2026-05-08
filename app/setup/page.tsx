import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import Link from "next/link";

export default async function SetupPage() {
  // 1. Cek apakah sudah ada user di database
  const count = await prisma.user.count();
  
  if (count > 0) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">🚨 Operasi Dibatalkan!</h1>
        <p>Akun Admin sudah ada di dalam database Supabase.</p>
        <Link href="/login" className="text-blue-600 underline mt-4 block">Kembali ke Login</Link>
      </div>
    );
  }

  // 2. Jika kosong, buatkan akun Admin Master
  const hashedPw = await bcrypt.hash("admin123", 10); // Password default: admin123
  
  await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPw,
      role: "admin"
    }
  });

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Operasi Berhasil!</h1>
      <p className="text-lg">Akun Admin berhasil disuntikkan ke Supabase.</p>
      <div className="bg-gray-100 inline-block p-4 rounded-lg mt-4 text-left">
        <p><strong>Username:</strong> admin</p>
        <p><strong>Password:</strong> admin123</p>
      </div>
      <br />
      <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-6 inline-block font-bold">
        Lanjut Login ke Dashboard →
      </Link>
    </div>
  );
}
