/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma, catatLog } from "@/lib/db"; // ✅ DIUBAH: Menggunakan prisma Singleton
import Link from "next/link"; 
import { revalidatePath } from "next/cache";
import { Plus, Download, Search, Edit, Trash2, Image as ImageIcon, RotateCcw, PackageSearch } from "lucide-react";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function InventarisPage({ searchParams }: Props) {
  // 1. CEK SESSION & ROLE PENGGUNA
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "admin";

  const params = await searchParams;
  const q = params?.q || "";
  const statusFilter = params?.status || "Semua";
  const currentPage = Number(params?.page) || 1;
  const ITEMS_PER_PAGE = 10; 

  let laptops: any[] = [];
  let totalPages = 1;
  let totalItems = 0;
  
  try {
    // 📡 2. BANGUN FILTER PENCARIAN PRISMA (WHERE CLAUSE)
    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { sku_code: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (statusFilter !== "Semua") {
      whereClause.status = statusFilter;
    }

    // 🧮 3. MENGHITUNG TOTAL DATA & PAGINASI VIA PRISMA
    totalItems = await prisma.laptop.count({
      where: whereClause
    });
    totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    
    // 💾 4. MENGAMBIL DATA DATA LAPTOP
    laptops = await prisma.laptop.findMany({
      where: whereClause,
      orderBy: { id: 'desc' },
      skip: offset,
      take: ITEMS_PER_PAGE,
    });
    
  } catch (error) {
    console.error("🔍 PESAN ERROR PRISMA:", error); 
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatTanggal = (dateString: string | Date | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  };

  // 🗑️ SERVER ACTION: HAPUS DATA VIA PRISMA
  async function hapusLaptop(formData: FormData) {
    "use server";
    const id = Number(formData.get("id")); // Prisma butuh tipe Number
    const session = await auth();
    const activeUser = session?.user?.name || "Sistem";
    const role = (session?.user as any)?.role;

    // 🔒 PROTEKSI TINGKAT TINGGI: Hanya admin yang boleh eksekusi hapus
    if (role !== "admin") return;

    try {
      // Cari data laptop dulu untuk dicatat di log
      const laptopToDelete = await prisma.laptop.findUnique({
        where: { id: id },
        select: { sku_code: true, brand: true, model: true }
      });

      if (laptopToDelete) {
        // Eksekusi Hapus
        await prisma.laptop.delete({
          where: { id: id }
        });
        
        const deskripsi = `Menghapus unit: ${laptopToDelete.brand} ${laptopToDelete.model} (SKU: ${laptopToDelete.sku_code})`;
        await catatLog(activeUser, "HAPUS STOK", deskripsi);
      }
      revalidatePath("/inventaris"); 
    } catch (error) {
      console.error("Gagal menghapus data:", error);
    }
  }

  const createPageURL = (pageNumber: number) => {
    const urlParams = new URLSearchParams();
    if (q) urlParams.set('q', q);
    if (statusFilter !== "Semua") urlParams.set('status', statusFilter);
    urlParams.set('page', pageNumber.toString());
    return `/inventaris?${urlParams.toString()}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Stok Laptop</h1>
          <p className="text-sm text-gray-500 mt-1">
            Mode Akses: <span className={`font-bold ${isAdmin ? 'text-red-600' : 'text-blue-600'}`}>{isAdmin ? 'Administrator' : 'Kasir'}</span>
          </p>
        </div>
        
        <div className="flex gap-3">
          {/* Export Excel hanya untuk Admin */}
          {isAdmin && (
            <a href="/api/export" className="bg-white text-emerald-600 border border-emerald-200 px-4 py-2.5 rounded-lg hover:bg-emerald-50 font-medium flex items-center gap-2">
              <Download size={18} /> Export
            </a>
          )}
          
          <Link href="/inventaris/tambah" className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
            <Plus size={18} /> Tambah Stok
          </Link>
        </div>
      </div>

      {/* FILTER SEARCH */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
        <form method="GET" className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[240px]">
            <input type="text" name="q" defaultValue={q} placeholder="Cari SKU, Merek, atau Model..." className="w-full border rounded-lg py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-48">
            <select name="status" defaultValue={statusFilter} className="w-full border rounded-lg p-2.5 bg-white">
              <option value="Semua">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Terjual">Terjual</option>
            </select>
          </div>
          <button type="submit" className="bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium">Cari</button>
        </form>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100 mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-center">Foto</th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Laptop</th>
                {/* 🔒 SENSOR: Hanya tampil jika Admin */}
                {isAdmin && <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Total Modal</th>}
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Harga Jual</th>
                {isAdmin && <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Est. Profit</th>}
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {laptops.map((laptop: any) => {
                const totalModal = (Number(laptop.cost_price) || 0) + (Number(laptop.repair_cost) || 0);
                const hargaJual = Number(laptop.target_price) || 0;
                const estimasiProfit = hargaJual - totalModal;

                return (
                  <tr key={laptop.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3 text-center">
                      {laptop.image_url ? (
                        <img src={laptop.image_url} alt={laptop.model} className="w-12 h-12 object-cover rounded-lg border mx-auto" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto text-slate-300"><ImageIcon size={20} /></div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm">{laptop.brand} {laptop.model}</div>
                      <div className="text-[10px] text-gray-400 font-mono uppercase">{laptop.sku_code}</div>
                    </td>
                    
                    {/* 🔒 SENSOR MODAL */}
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="font-semibold text-orange-600 text-sm">{formatRupiah(totalModal)}</div>
                      </td>
                    )}

                    <td className="px-6 py-4 font-bold text-blue-600 text-sm">{formatRupiah(hargaJual)}</td>

                    {/* 🔒 SENSOR PROFIT */}
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="font-bold text-emerald-600 text-sm">{formatRupiah(estimasiProfit)}</div>
                      </td>
                    )}

                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div>M: {formatTanggal(laptop.date_in)}</div>
                      {laptop.status === "Terjual" && <div>K: {formatTanggal(laptop.updated_at)}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                        laptop.status === "Tersedia" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}>{laptop.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center opacity-70 group-hover:opacity-100">
                        <Link href={`/inventaris/edit/${laptop.id}`} className="p-2 bg-slate-100 text-slate-600 rounded hover:bg-amber-100 hover:text-amber-700" title="Edit"><Edit size={14} /></Link>
                        
                        {/* 🔒 HANYA ADMIN YANG BISA LIHAT TOMBOL HAPUS */}
                        {isAdmin && (
                          <form action={hapusLaptop}>
                            <input type="hidden" name="id" value={laptop.id} />
                            <button type="submit" className="p-2 bg-slate-100 text-slate-600 rounded hover:bg-red-100 hover:text-red-700" title="Hapus"><Trash2 size={14} /></button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}