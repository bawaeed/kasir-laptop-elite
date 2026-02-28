/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Kita ubah ke Client Component agar bisa pakai Toast

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast"; // Import toast
import { 
  ShoppingCart, 
  Banknote, 
  LaptopMinimal, 
  CheckCircle, 
  PackageOpen, 
  User, 
  Phone,
  Loader2
} from "lucide-react";

// Helper format rupiah (Client side)
const formatKeRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

// Kita butuh Server Action yang terpisah (atau kita buat inline tapi dipanggil via handle)
import { prosesTransaksiAction, getStokTersediaAction } from "./actions";

export default function TransaksiPage() {
  const router = useRouter();
  const [laptopTersedia, setLaptopTersedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Ambil data stok saat pertama kali buka halaman
  useEffect(() => {
    async function loadData() {
      const data = await getStokTersediaAction();
      setLaptopTersedia(data);
      setFetching(false);
    }
    loadData();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await prosesTransaksiAction(formData);
      
      if (result.success) {
        toast.success(result.message || "Transaksi Berhasil!");
        // Beri jeda sebentar agar user bisa baca toast-nya
        setTimeout(() => {
          router.push("/inventaris");
          router.refresh();
        }, 1500);
      } else {
        toast.error(result.message || "Gagal memproses transaksi");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
      setLoading(false);
    }
  }

  if (fetching) return <div className="p-8 text-center text-gray-500">Memuat data stok...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center mb-8 gap-5">
        <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <ShoppingCart size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Kasir Penjualan</h1>
          <p className="text-gray-500 mt-1 text-sm">Proses transaksi unit yang laku terjual hari ini.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl p-8 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 to-emerald-600"></div>

        {laptopTersedia.length === 0 ? (
          <div className="text-center py-12">
            <PackageOpen size={48} className="mx-auto text-slate-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Stok Kosong</h2>
            <Link href="/inventaris/tambah" className="text-blue-600 underline mt-2 inline-block">Tambah Stok Dulu</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                <LaptopMinimal size={18} className="text-slate-500" /> 1. Pilih Unit Laptop
              </label>
              <select name="laptop_id" required className="w-full border border-slate-300 rounded-lg p-3.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium">
                <option value="">-- Pilih Laptop --</option>
                {laptopTersedia.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.sku_code} | {l.brand} {l.model} ({formatKeRupiah(Number(l.target_price))})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider text-xs">
                  <User size={16} className="text-slate-500" /> Nama Pembeli
                </label>
                <input type="text" name="nama_pembeli" placeholder="Nama Lengkap..." className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider text-xs">
                  <Phone size={16} className="text-slate-500" /> No. WhatsApp
                </label>
                <input type="text" name="hp_pembeli" placeholder="0812..." className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
              <label className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-3 uppercase tracking-wider">
                <Banknote size={18} className="text-emerald-600" /> 3. Harga Kesepakatan (Deal)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-emerald-600 font-bold">Rp</span>
                <input type="number" name="deal_price" required placeholder="Harga Final..." className="w-full border border-emerald-200 rounded-lg py-3.5 pl-12 pr-4 text-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`mt-2 text-white font-bold text-lg py-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-md ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : <CheckCircle size={22} />}
              {loading ? "Memproses..." : "Konfirmasi Penjualan Sekarang"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}