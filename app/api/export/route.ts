import { pool } from "@/lib/db"; // Sesuaikan ../ jika ada error merah
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Ambil semua data dari database
    const result = await pool.query(
      'SELECT sku_code, brand, model, condition_notes, cost_price, repair_cost, target_price, status FROM "Laptop" ORDER BY id DESC'
    );
    const laptops = result.rows;

    // 2. Buat Judul Kolom (Header) Excel
    let csvContent = "SKU,Merek,Model,Kondisi,Modal Awal,Biaya Servis,Total Modal,Harga Jual,Est. Profit,Status\n";

    // 3. Masukkan data baris demi baris
    laptops.forEach((l) => {
      const modalAwal = Number(l.cost_price) || 0;
      const servis = Number(l.repair_cost) || 0;
      const totalModal = modalAwal + servis;
      const hargaJual = Number(l.target_price) || 0;
      const profit = hargaJual - totalModal;

      // Bersihkan teks dari koma atau enter agar kolom Excel tidak berantakan
      const kondisi = l.condition_notes ? `"${l.condition_notes.replace(/"/g, '""').replace(/\n/g, ' ')}"` : '"Normal"';
      const model = `"${l.model.replace(/"/g, '""')}"`;

      // Gabungkan ke dalam baris CSV
      csvContent += `${l.sku_code},${l.brand},${model},${kondisi},${modalAwal},${servis},${totalModal},${hargaJual},${profit},${l.status}\n`;
    });

    // 4. Kirim sebagai File yang siap di-download
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="Laporan_Stok_Laptop_EliteGear.csv"',
      },
    });
  } catch (error) {
    console.error("Gagal export Excel:", error);
    return new NextResponse("Gagal membuat file laporan", { status: 500 });
  }
}