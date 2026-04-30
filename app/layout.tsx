import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Tambahkan kembali font agar elegan
import "./globals.css";
import Link from "next/link";
import { Toaster } from "react-hot-toast"; 
import { 
  LayoutDashboard, 
  Laptop, 
  ShoppingCart, 
  Laptop2, 
  KeyRound, 
  History, 
  Users 
} from "lucide-react"; 

import LogoutButton from "@/components/LogoutButton";
import { auth } from "@/auth";

// Inisialisasi font Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elite Gear - Kasir Laptop",
  description: "Aplikasi Manajemen Jual Beli Laptop Second",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const session = await auth();
  
  // Mengambil role dengan pengecekan aman tanpa 'any' jika memungkinkan, 
  // tapi kita simpan logika Anda agar tidak merombak file interface dulu.
  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <html lang="id">
      <body className={`${inter.className} flex h-screen bg-gray-50 antialiased text-gray-800`}>
        
        {/* Notifikasi melayang */}
        <Toaster position="top-right" reverseOrder={false} />

        {/* SIDEBAR: Hanya muncul jika session valid */}
        {session && (
          <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 shrink-0">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg shadow-inner">
                <Laptop2 size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-wider text-blue-400">Elite Gear</h2>
                <p className="text-xs text-slate-400 mt-1">Sistem Kasir & Stok</p>
              </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 text-slate-300 font-medium overflow-y-auto">
              <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 group">
                <LayoutDashboard size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                Dashboard
              </Link>
              
              <Link href="/inventaris" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 group">
                <Laptop size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                Data Stok Laptop
              </Link>
              
              <Link href="/transaksi" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 group">
                <ShoppingCart size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                Transaksi Penjualan
              </Link>
              
              {/* --- MENU KHUSUS ADMIN --- */}
              {isAdmin && (
                <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Admin Menu</p>
                  <Link href="/log" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 group">
                    <History size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                    Riwayat Log Aktifitas
                  </Link>
                  <Link href="/pengaturan/karyawan" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 group">
                    <Users size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                    Manajemen Karyawan
                  </Link>
                </div>
              )}
              {/* ------------------------- */}

              <div className="pt-4 mt-4 border-t border-slate-800">
                <Link href="/pengaturan" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 group">
                  <KeyRound size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                  Pengaturan Keamanan
                </Link>
              </div>
            </nav>

            <div className="p-4 border-t border-slate-800">
              <LogoutButton />
            </div>
          </aside>
        )}

        {/* AREA KONTEN UTAMA */}
        <main className={`flex-1 overflow-y-auto ${!session ? "bg-slate-900" : "bg-gray-50/50"}`}>
          {children}
        </main>
        
      </body>
    </html>
  );
}