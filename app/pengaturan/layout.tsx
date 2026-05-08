// app/pengaturan/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PengaturanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 🛡️ HANYA CEK APAKAH USER SUDAH LOGIN
  if (!session) {
    redirect("/login");
  }

  // JANGAN cek role admin di sini! 
  // Biarkan halaman di dalamnya yang menentukan siapa yang boleh masuk.
  
  return <>{children}</>;
}