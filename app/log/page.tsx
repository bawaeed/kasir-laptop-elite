import { pool } from "@/lib/db";
import Link from "next/link";

/**
 * HALAMAN LOG AKTIVITAS
 * Menampilkan histori tindakan yang dilakukan di sistem
 */
export default async function LogAktifitasPage() {
  let logs = [];

  try {
    // 1. Sinkronisasi Nama Tabel: "LogAktifitas"
    // 2. Sinkronisasi Kolom Waktu: "waktu"
    const result = await pool.query(
      'SELECT * FROM "LogAktifitas" ORDER BY waktu DESC LIMIT 100'
    );
    logs = result.rows;
  } catch (error) {
    console.error("🚨 Gagal mengambil log:", error);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Log Aktivitas</h1>
          <p className="text-gray-500 mt-1">Memantau 100 tindakan terakhir di sistem</p>
        </div>
        <Link 
          href="/dashboard" 
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-500">Waktu</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-500">User</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-500">Aktivitas</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-500">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm text-gray-600 whitespace-nowrap font-mono">
                    {new Date(log.waktu).toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                      {log.user_id || "System"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-black px-2 py-1 rounded uppercase ${
                      log.aktivitas.includes('TAMBAH') ? 'bg-green-100 text-green-700' : 
                      log.aktivitas.includes('HAPUS') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {log.aktivitas}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {log.keterangan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 italic">Belum ada catatan aktivitas di database.</p>
          </div>
        )}
      </div>
    </div>
  );
}