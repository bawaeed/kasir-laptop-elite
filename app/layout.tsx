import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "react-hot-toast"; 
// Menambahkan ikon Users untuk menu Manajemen Karyawan
import { LayoutDashboard, Laptop, ShoppingCart, Laptop2, KeyRound, History, Users } from "lucide-react"; 

import LogoutButton from "@/components/LogoutButton";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Kasir Laptop Second",
  description: "Aplikasi Manajemen Jual Beli Laptop",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const session = await auth();
  
  // Memeriksa apakah user yang login memiliki role 'admin'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <html lang="id">
      <body className="flex h-screen bg-gray-50 antialiased text-gray-800">
        
        <Toaster position="top-right" reverseOrder={false} />

        {session && (
          <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg shadow-inner">
                <Laptop2 size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-wider text-blue-400">Elite Gear</h2>
                <p className="text-xs text-slate-400 mt-1">Sistem Kasir & Stok</p>
              </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 text-slate-300 font-medium">
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
                <>
                  <Link href="/log" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 group">
                    <History size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                    Riwayat Log Aktifitas
                  </Link>
                  <Link href="/pengaturan/karyawan" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 group">
                    <Users size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                    Manajemen Karyawan
                  </Link>
                </>
              )}
              {/* ------------------------- */}

              <Link href="/pengaturan" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 group">
                <KeyRound size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                Pengaturan Keamanan
              </Link>
            </nav>

            <div className="p-4 border-t border-slate-800">
              <LogoutButton />
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          {children}
        </main>
        
      </body>
    </html>
  );
}