/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma, catatLog } from "@/lib/db";
import Link from "next/link"; 
import { revalidatePath } from "next/cache";
import { Plus, ImageIcon, Edit, Trash2, PackageSearch } from "lucide-react";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function InventarisPage({ searchParams }: Props) {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "admin";

  const params = await searchParams;
  const q = params?.q || "";
  const statusFilter = params?.status || "Semua";
  const currentPage = Number(params?.page) || 1;
  const ITEMS_PER_PAGE = 10; 

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

  const totalItems = await prisma.laptop.count({ where: whereClause });
  const laptops = await prisma.laptop.findMany({
    where: whereClause,
    orderBy: { id: 'desc' },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Stok Laptop</h1>
          <p className="text-sm text-gray-500 mt-1">Mengelola inventaris unit laptop aktif.</p>
        </div>
        <Link href="/inventaris/tambah" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all">
          <Plus size={20} /> Tambah Unit Baru
        </Link>
      </div>

      {/* SEARCH BOX */}
      <div className="bg-white p-4 rounded-xl border mb-6 shadow-sm flex gap-4">
         <input type="text" placeholder="Cari SKU, Brand, atau Model..." className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
         <button className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium">Cari</button>
      </div>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase text-center">Foto</th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase">Unit Laptop</th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase">Harga Jual</th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {laptops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                    <PackageSearch size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Belum ada unit laptop di inventaris.</p>
                  </td>
                </tr>
              ) : (
                laptops.map((laptop: any) => (
                  <tr key={laptop.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-center">
                      {laptop.image_url ? (
                        <img src={laptop.image_url} alt={laptop.model} className="w-14 h-14 object-cover rounded-xl border mx-auto shadow-sm" />
                      ) : (
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto text-slate-300"><ImageIcon size={24} /></div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-base">{laptop.brand} {laptop.model}</div>
                      <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{laptop.sku_code}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600 text-base">{formatRupiah(Number(laptop.target_price))}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${laptop.status === "Tersedia" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{laptop.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <Link href={`/inventaris/edit/${laptop.id}`} className="p-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-amber-100 hover:text-amber-700 transition-colors"><Edit size={16} /></Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}