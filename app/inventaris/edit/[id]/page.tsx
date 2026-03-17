import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { pool, catatLog } from "@/lib/db"; 
import Link from "next/link";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth"; 

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditStokPage({ params, searchParams }: Props) {
  // Menyesuaikan dengan standar Next.js 15+ (Promise)
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const id = resolvedParams.id;
  const errorMsg = resolvedSearchParams?.error;

  // 1. Ambil data laptop yang mau diedit
  const result = await pool.query('SELECT * FROM "Laptop" WHERE id = $1', [id]);
  
  // Jika laptop tidak ditemukan, kembalikan ke daftar
  if (result.rows.length === 0) {
    redirect("/inventaris");
  }
  
  const laptop = result.rows[0];
  const formattedDate = new Date(laptop.date_in).toISOString().split("T")[0];

  // 2. Fungsi Server Action untuk proses Edit
  async function updateLaptop(formData: FormData) {
    "use server";
    
    const session = await auth();
    const activeUser = session?.user?.name || "Sistem/Tidak Diketahui";

    const sku_code = formData.get("sku_code") as string;
    
    // ==========================================
    // 🛡️ CEK DUPLIKAT SKU (Kecuali milik dia sendiri)
    // ==========================================
    const cekSku = await pool.query('SELECT id FROM "Laptop" WHERE sku_code = $1 AND id != $2', [sku_code, id]);
    if (cekSku.rows.length > 0) {
      redirect(`/inventaris/edit/${id}?error=sku_duplikat`);
    }

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
    let image_url = laptop.image_url; // Default: Gunakan foto lama jika tidak ada upload baru

    // Jika ada foto baru yang diupload
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
      // UPDATE DATA KE DATABASE
      await pool.query(
        `UPDATE "Laptop" SET 
          date_in = $1, 
          sku_code = $2, 
          brand = $3, 
          model = $4, 
          specs = $5, 
          condition_notes = $6, 
          cost_price = $7, 
          repair_cost = $8, 
          sparepart_cost = $9, 
          target_price = $10, 
          image_url = $11, 
          updated_at = NOW()
        WHERE id = $12`,
        [date_in, sku_code, brand, model, specs, condition_notes, cost_price, repair_cost, sparepart_cost, target_price, image_url, id]
      );

      const deskripsi = `Mengubah data unit: ${brand} ${model} (SKU: ${sku_code})`;
      await catatLog(activeUser, "EDIT STOK", deskripsi);

    } catch (error) {
      console.error("Gagal mengupdate data:", error);
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
        <h1 className="text-2xl font-bold text-gray-800">Edit Data Laptop</h1>
      </div>

      {errorMsg === "sku_duplikat" && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r shadow-sm flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-bold">Gagal Menyimpan!</h3>
            <p className="text-sm mt-1">Kode SKU yang Anda masukkan <strong>sudah digunakan oleh laptop lain</strong>. Silakan gunakan kode lain.</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <form action={updateLaptop} className="flex flex-col gap-4">
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-bold text-blue-800 mb-2">📷 Ganti Foto Fisik Laptop (Opsional)</label>
              <input 
                type="file" 
                name="image" 
                accept="image/*" 
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
              <p className="text-xs text-blue-600 mt-2">*Biarkan kosong jika tidak ingin mengubah foto saat ini.</p>
            </div>
            {/* Tampilkan thumbnail foto lama jika ada */}
            {laptop.image_url && (
              <div className="ml-4 w-20 h-20 rounded bg-gray-200 border overflow-hidden flex-shrink-0">
                <img src={laptop.image_url} alt="Foto Lama" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Tanggal Masuk</label>
              <input 
                type="date" 
                name="date_in" 
                defaultValue={formattedDate} 
                required 
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">SKU Code</label>
              <input type="text" name="sku_code" defaultValue={laptop.sku_code} required className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none ${errorMsg === "sku_duplikat" ? "border-red-500 ring-1 ring-red-500 bg-red-50" : ""}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Brand</label>
              <input type="text" name="brand" defaultValue={laptop.brand} required className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Model Laptop</label>
              <input type="text" name="model" defaultValue={laptop.model} required className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Spesifikasi Singkat</label>
            <textarea name="specs" defaultValue={laptop.specs} className="w-full border rounded p-2 h-20 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Catatan Kondisi / Minus</label>
            <textarea name="condition_notes" defaultValue={laptop.condition_notes} className="w-full border rounded p-2 h-20 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Informasi Modal & Harga (Rp)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Beli Awal</label>
                <input type="number" name="cost_price" defaultValue={laptop.cost_price} required className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Biaya Servis</label>
                <input type="number" name="repair_cost" defaultValue={laptop.repair_cost} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Biaya Sparepart</label>
                <input type="number" name="sparepart_cost" defaultValue={laptop.sparepart_cost || 0} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">Harga Jual Target</label>
                <input type="number" name="target_price" defaultValue={laptop.target_price} required className="w-full border border-blue-300 bg-blue-50 rounded p-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>

          <button type="submit" className="mt-4 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition shadow-md flex justify-center items-center gap-2">
            <span>💾 Simpan Perubahan</span>
          </button>
        </form>
      </div>
    </div>
  );
}