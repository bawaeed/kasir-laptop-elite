import { pool } from "@/lib/db";
import { History, Clock, User, Activity, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LogAktifitasPage() {
  let logs: any[] = [];

  try {
    // Mengambil 100 log terakhir, diurutkan dari yang paling baru
    const result = await pool.query(
      'SELECT * FROM "ActivityLog" ORDER BY created_at DESC LIMIT 100'
    );
    logs = result.rows;
  } catch (error) {
    console.error("Gagal mengambil log:", error);
  }

  // Fungsi untuk mengubah waktu mesin menjadi waktu yang mudah dibaca (Format Indonesia)
  const formatWaktu = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  // Fungsi untuk memberi warna berbeda untuk setiap aksi
  const getBadgeColor = (action: string) => {
    if (action === "TAMBAH STOK") return "bg-blue-100 text-blue-700 border-blue-200";
    if (action === "EDIT STOK") return "bg-amber-100 text-amber-700 border-amber-200";
    if (action === "PENJUALAN") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (action === "HAPUS STOK") return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-slate-900 p-3 rounded-xl shadow-lg shadow-slate-300">
          <History size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Riwayat Log Aktifitas</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau semua pergerakan dan perubahan data di dalam sistem.</p>
        </div>
      </div>

      {/* TABEL LOG */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={14} /> Waktu
                </th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2"><User size={14} /> Pengguna</div>
                </th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2"><Activity size={14} /> Jenis Aksi</div>
                </th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider w-full">
                  <div className="flex items-center gap-2"><FileText size={14} /> Deskripsi Detail</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <History size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Belum ada aktifitas yang tercatat.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {formatWaktu(log.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                        @{log.username}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider border ${getBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-normal min-w-[300px]">
                      {log.description}
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