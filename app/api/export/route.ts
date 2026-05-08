import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Ambil semua data menggunakan Prisma
    const laptops = await prisma.laptop.findMany({
      select: {
        sku_code: true,
        brand: true,
        model: true,
        condition_notes: true,
        cost_price: true,
        repair_cost: true,
        target_price: true,
        status: true,
      },
      orderBy: {
        id: 'desc'
      }
    });

    // 2. Buat Judul Kolom (Header) CSV
    let csvContent = "SKU,Merek,Model,Kondisi,Modal Awal,Biaya Servis,Total Modal,Harga Jual,Est. Profit,Status\n";

    // 3. Masukkan data baris demi baris
    laptops.forEach((l) => {
      const modalAwal = Number(l.cost_price) || 0;
      const servis = Number(l.repair_cost) || 0;
      const totalModal = modalAwal + servis;
      const hargaJual = Number(l.target_price) || 0;
      const profit = hargaJual - totalModal;

      // Bersihkan teks dari koma atau enter agar kolom tidak berantakan
      const kondisi = l.condition_notes ? `"${l.condition_notes.replace(/"/g, '""').replace(/\n/g, ' ')}"` : '"Normal"';
      const model = `"${l.model.replace(/"/g, '""')}"`;

      // Gabungkan ke dalam baris CSV
      csvContent += `${l.sku_code},${l.brand},${model},${kondisi},${modalAwal},${servis},${totalModal},${hargaJual},${profit},${l.status}\n`;
    });

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="Laporan_Stok_Laptop_EliteGear.csv"',
      },
    });
  } catch (error) {
    console.error("Gagal export CSV via Prisma:", error);
    return new NextResponse("Gagal membuat file laporan", { status: 500 });
  }
}