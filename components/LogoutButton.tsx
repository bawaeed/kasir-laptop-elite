"use client"; // Ini adalah kunci ajaibnya! Menjadikannya komponen yang interaktif di sisi user

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      // Menggunakan fungsi signOut khusus sisi klien (Client-side)
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 group text-slate-400 font-medium"
    >
      <LogOut size={20} className="group-hover:text-white transition-colors" />
      Keluar
    </button>
  );
}