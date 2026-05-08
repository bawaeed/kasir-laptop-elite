// app/pengaturan/page.tsx
import { redirect } from "next/navigation";

export default function PengaturanEntryPage() {
  // Semua user (Admin & Karyawan) boleh ganti sandi.
  // Jadi, lempar mereka ke sana secara otomatis.
  redirect("/pengaturan/sandi");
}