"use server";

import { prisma, catatLog } from "@/lib/db"; // ✅ MENGGUNAKAN PRISMA
import { auth } from "@/auth";

export async function getStokTersediaAction() {
  // 📡 Mengambil data laptop via Prisma
  const result = await prisma.laptop.findMany({
    where: {
      status: 'Tersedia'
    },
    select: {
      id: true,
      sku_code: true,
      brand: true,
      model: true,
      target_price: true
    },
    orderBy: {
      id: 'desc'
    }
  });

  // Prisma mengembalikan target_price sebagai tipe Decimal.
  // Kita konversi ke Number agar aman dikirim ke komponen Frontend (Client)
  return result.map(item => ({
    ...item,
    target_price: Number(item.target_price || 0)
  }));
}

export async function prosesTransaksiAction(formData: FormData) {
  const session = await auth();
  const activeUser = session?.user?.name || "Kasir";

  // Prisma mewajibkan ID berbentuk Number, bukan String
  const laptop_id = Number(formData.get("laptop_id")); 
  const deal_price = parseFloat(formData.get("deal_price") as string) || 0;
  const nama_pembeli = formData.get("nama_pembeli") as string || "Pelanggan Umum";
  // const hp_pembeli = formData.get("hp_pembeli") as string || "-";

  try {
    // 🔍 1. Cek Ketersediaan Laptop
    const lpt = await prisma.laptop.findUnique({
      where: { id: laptop_id },
      select: { sku_code: true, brand: true, model: true }
    });

    if (!lpt) return { success: false, message: "Unit tidak ditemukan" };

    // 💾 2. Update Status Menjadi Terjual
    await prisma.laptop.update({
      where: { id: laptop_id },
      data: {
        status: 'Terjual',
        target_price: deal_price
        // updated_at otomatis diperbarui oleh Prisma
      }
    });

    // 📝 3. Catat Log Penjualan
    const hargaLog = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(deal_price);
    const deskripsi = `PENJUALAN: ${lpt.brand} ${lpt.model} (${lpt.sku_code}) terjual ke ${nama_pembeli} seharga ${hargaLog}`;
    await catatLog(activeUser, "PENJUALAN", deskripsi);

    return { success: true, message: "Transaksi berhasil dicatat!" };
  } catch (error) {
    console.error("🚨 Error transaksi via Prisma:", error);
    return { success: false, message: "Gagal memproses database" };
  }
}