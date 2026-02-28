"use server";

import { pool, catatLog } from "@/lib/db";
import { auth } from "@/auth";

export async function getStokTersediaAction() {
  const result = await pool.query(
    `SELECT id, sku_code, brand, model, target_price 
     FROM "Laptop" 
     WHERE status = 'Tersedia' 
     ORDER BY id DESC`
  );
  return result.rows;
}

export async function prosesTransaksiAction(formData: FormData) {
  const session = await auth();
  const activeUser = session?.user?.name || "Kasir";

  const laptop_id = formData.get("laptop_id");
  const deal_price = parseFloat(formData.get("deal_price") as string) || 0;
  const nama_pembeli = formData.get("nama_pembeli") as string || "Pelanggan Umum";
  const hp_pembeli = formData.get("hp_pembeli") as string || "-";

  try {
    const dataLaptop = await pool.query('SELECT sku_code, brand, model FROM "Laptop" WHERE id = $1', [laptop_id]);
    const lpt = dataLaptop.rows[0];

    if (!lpt) return { success: false, message: "Unit tidak ditemukan" };

    await pool.query(
      `UPDATE "Laptop" 
       SET status = 'Terjual', 
           target_price = $1, 
           date_out = CURRENT_DATE,
           updated_at = NOW() 
       WHERE id = $2`,
      [deal_price, laptop_id]
    );

    const hargaLog = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(deal_price);
    const deskripsi = `PENJUALAN: ${lpt.brand} ${lpt.model} (${lpt.sku_code}) terjual ke ${nama_pembeli} seharga ${hargaLog}`;
    await catatLog(activeUser, "PENJUALAN", deskripsi);

    return { success: true, message: "Transaksi berhasil dicatat!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memproses database" };
  }
}