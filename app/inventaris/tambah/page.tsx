import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { pool, catatLog } from "@/lib/db"; 
import Link from "next/link";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth"; 

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function TambahStokPage({ searchParams }: Props) {
  // Menangkap pesan error dari URL (jika ada)
  const params = await searchParams;
  const errorMsg = params?.error;
  
  const today = new Date().toISOString().split("T")[0];

  async function simpanLaptop(formData: FormData) {
    "use server";
    
    const session = await auth();
    const activeUser = session?.user?.name || "Sistem/Tidak Diketahui";

    const sku_code = formData.get("sku_code") as string;
    
    // ==========================================
    // 🛡️ SISTEM ANTI-BOCOR: CEK DUPLIKAT SKU
    // ==========================================
    const cekSku = await pool.query('SELECT id FROM "Laptop" WHERE sku_code = $1', [sku_code]);
    if (cekSku.rows.length > 0) {
      // Jika SKU sudah ada, batalkan proses dan kembalikan ke halaman tambah dengan pesan error!
      redirect('/inventaris/tambah?error=sku_duplikat');
    }

    // Jika aman, lanjut ambil data lainnya
    const date_in = formData.get("date_in") as string; 
    const brand = formData.get("brand") as string;
    const model = formData.get("model") as string;
    const specs = formData.get("specs") as string;
    const condition_notes = formData.get("condition_notes") as string;

    const cost_price = parseFloat(formData.get("cost_price") as string) || 0;
    const repair_cost = parseFloat(formData.get("repair_cost") as string) || 0;
    const sparepart_cost = parseFloat(formData.get("sparepart_cost") as string) || 0; // BIAYA SPAREPART BARU
    const target_price = parseFloat(formData.get("target_price") as string) || 0;

    const file = formData.get("image") as File;
    let image_url = null; 

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      await mkdir(uploadDir, { recursive: true }); 
      
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      image_url = `/uploads/${filename}`;
    }

    try {
      await pool.query(
        `INSERT INTO "Laptop" 
        (date_in, sku_code, brand, model, specs, condition_notes, cost_price, repair_cost, sparepart_cost, target_price, image_url, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
        [date_in, sku_code, brand, model, specs, condition_notes, cost_price, repair_cost, sparepart_cost, target_price, image_url]
      );

      const deskripsi = `Menambahkan unit baru: ${brand} ${model} (SKU: ${sku_code})`;
      await catatLog(activeUser, "TAMBAH STOK", deskripsi);

    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    }

    revalidatePath("/inventaris");
    redirect("/inventaris");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center mb-6 gap-4">
        <Link href="/inventaris" className="text-gray-500 hover:text-gray-800">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Tambah Stok Laptop Bekas</h1>
      </div>

      {/* TAMPILAN ERROR JIKA SKU DUPLIKAT */}
      {errorMsg === "sku_duplikat" && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r shadow-sm flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-bold">Gagal Menyimpan!</h3>
            <p className="text-sm mt-1">Kode SKU yang Anda masukkan <strong>sudah ada di database</strong>. Kode SKU harus unik untuk setiap laptop. Silakan gunakan kode lain.</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <form action={simpanLaptop} className="flex flex-col gap-4">
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-bold text-blue-800 mb-2">📷 Upload Foto Fisik Laptop (Opsional)</label>
            <input 
              type="file" 
              name="image" 
              accept="image/*" 
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Tanggal Masuk</label>
              <input 
                type="date" 
                name="date_in" 
                defaultValue={today} 
                required 
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">SKU Code (Wajib Unik)</label>
              <input type="text" name="sku_code" required placeholder="Contoh: LNV-001" className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none ${errorMsg === "sku_duplikat" ? "border-red-500 ring-1 ring-red-500 bg-red-50" : ""}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Brand</label>
              <input type="text" name="brand" required placeholder="Contoh: Lenovo" className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Model Laptop</label>
              <input type="text" name="model" required placeholder="Contoh: ThinkPad T480s" className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Spesifikasi Singkat</label>
            <textarea name="specs" placeholder="Contoh: Core i5 Gen 8, RAM 16GB, SSD 512GB" className="w-full border rounded p-2 h-20 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Catatan Kondisi / Minus</label>
            <textarea name="condition_notes" placeholder="Contoh: Baterai drop, lecet pemakaian, keyboard ada 1 tombol mati" className="w-full border rounded p-2 h-20 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Informasi Modal & Harga (Rp)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Beli Awal</label>
                <input type="number" name="cost_price" required placeholder="3000000" className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Biaya Servis</label>
                <input type="number" name="repair_cost" defaultValue="0" placeholder="0" className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Biaya Sparepart</label>
                <input type="number" name="sparepart_cost" defaultValue="0" placeholder="0" className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">Harga Jual Target</label>
                <input type="number" name="target_price" required placeholder="4200000" className="w-full border border-blue-300 bg-blue-50 rounded p-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>

          <button type="submit" className="mt-4 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md flex justify-center items-center gap-2">
            <span>💾 Simpan Data Laptop</span>
          </button>
        </form>
      </div>
    </div>
  );
}