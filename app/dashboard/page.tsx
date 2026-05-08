import { pool } from "@/lib/db"; 
import Link from "next/link";
import { auth } from "@/auth"; 
import { redirect } from "next/navigation"; 
import { 
  TrendingUp, Zap, Wallet, Package, CheckCircle, Wrench, Plus 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = (session?.user as any)?.role === "admin";

  let totalTersedia = 0;
  let totalTerjual = 0;
  let totalDiperbaiki = 0;
  
  let potensiLaba = 0; 
  let labaRealisasi = 0; 
  let totalAset = 0; 

  try {
    const result = await pool.query('SELECT status, cost_price, repair_cost, target_price FROM "Laptop"');
    const laptops = result.rows;

    laptops.forEach((laptop) => {
      const modal = (Number(laptop.cost_price) || 0) + (Number(laptop.repair_cost) || 0);
      const jual = Number(laptop.target_price) || 0;
      const profit = jual - modal;

      if (laptop.status === "Tersedia") {
        totalTersedia++;
        potensiLaba += profit;
        totalAset += modal; 
      } else if (laptop.status === "Terjual") {
        totalTerjual++;
        labaRealisasi += profit;
      } else if (laptop.status === "Diperbaiki" || laptop.status === "Sedang Diperbaiki") {
        totalDiperbaiki++;
        totalAset += modal; 
      }
    });
  } catch (error) {
    console.error("🚨 Gagal memuat data dashboard:", error);
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Utama</h1>
          <p className="text-gray-500 mt-1 text-sm">Selamat bekerja, <span className="font-semibold text-blue-600">{session.user?.name}</span>!</p>
        </div>
        <Link 
          href="/inventaris/tambah" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Stok
        </Link>
      </div>

      {/* 💰 BAGIAN KEUANGAN */}
      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-semibold text-gray-500">Laba Bersih (Realisasi)</h3>
              <div className="p-2 bg-green-50 rounded-lg text-green-600 group-hover:scale-110 transition-transform">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{formatRupiah(labaRealisasi)}</div>
            <p className="text-xs text-gray-500 font-medium">Dari <span className="text-green-600 font-bold">{totalTerjual} unit</span> terjual</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-semibold text-gray-500">Potensi Laba (Gudang)</h3>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                <Zap size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{formatRupiah(potensiLaba)}</div>
            <p className="text-xs text-gray-500 font-medium">Estimasi profit jika semua laku</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-semibold text-gray-500">Total Nilai Aset</h3>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:scale-110 transition-transform">
                <Wallet size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{formatRupiah(totalAset)}</div>
            <p className="text-xs text-gray-500 font-medium">Modal yang berputar di stok</p>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white shadow-lg">
          <h2 className="text-xl font-bold mb-1">Elite Gear Dashboard 🛡️</h2>
          <p className="text-blue-100 text-sm opacity-90">Gunakan menu di samping untuk mengelola stok atau membuat transaksi baru.</p>
        </div>
      )}

      {/* 📦 STATUS GUDANG */}
      <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Status Gudang</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/inventaris?status=Tersedia" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md hover:border-blue-200 transition-all duration-300 group block">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Stok Tersedia</h3>
              <div className="text-3xl font-bold text-gray-900">{totalTersedia} <span className="text-sm font-medium text-gray-400">Unit</span></div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package size={24} />
            </div>
          </div>
        </Link>

        <Link href="/inventaris?status=Terjual" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md hover:border-green-200 transition-all duration-300 group block">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Total Terjual</h3>
              <div className="text-3xl font-bold text-gray-900">{totalTerjual} <span className="text-sm font-medium text-gray-400">Unit</span></div>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <CheckCircle size={24} />
            </div>
          </div>
        </Link>

        <Link href="/inventaris?status=Diperbaiki" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md hover:border-amber-200 transition-all duration-300 group block">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Sedang Diservis</h3>
              <div className="text-3xl font-bold text-gray-900">{totalDiperbaiki} <span className="text-sm font-medium text-gray-400">Unit</span></div>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Wrench size={24} />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}