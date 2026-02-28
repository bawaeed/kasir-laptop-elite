import { pool, catatLog } from "@/lib/db"; 
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth"; // <-- IMPORT AUTH

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditLaptopPage({ params }: Props) {
  const { id } = await params;
  const today = new Date().toISOString().split("T")[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let laptop: any; 

  try {
    const result = await pool.query('SELECT * FROM "Laptop" WHERE id = $1', [id]);
    laptop = result.rows[0];
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }

  if (!laptop) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Data Tidak Ditemukan</h1>
        <Link href="/inventaris" className="text-blue-600 underline">Kembali ke Inventaris</Link>
      </div>
    );
  }

  const formatDateForInput = (dateString: string | Date | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  async function perbaruiLaptop(formData: FormData) {
    "use server";
    
    // CEK SIAPA YANG LOGIN
    const session = await auth();
    const activeUser = session?.user?.name || "Sistem";
    
    const sku_code = formData.get("sku_code") as string;
    const brand = formData.get("brand") as string;
    const model = formData.get("model") as string;
    const specs = formData.get("specs") as string;
    const condition_notes = formData.get("condition_notes") as string;
    const status = formData.get("status") as string;
    
    const cost_price = parseFloat(formData.get("cost_price") as string) || 0;
    const repair_cost = parseFloat(formData.get("repair_cost") as string) || 0;
    const target_price = parseFloat(formData.get("target_price") as string) || 0;

    let date_in = formData.get("date_in") as string | null;
    if (!date_in || date_in === "") date_in = new Date().toISOString().split("T")[0]; 

    let date_out = formData.get("date_out") as string | null;
    if (date_out === "") date_out = null; 

    // Logika Status Terjual
    if (status === "Terjual" && !date_out) date_out = new Date().toISOString().split("T")[0];
    if (status !== "Terjual") date_out = null;

    const file = formData.get("image") as File;
    let image_url = formData.get("existing_image") as string || null; 

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
        `UPDATE "Laptop" 
         SET sku_code=$1, brand=$2, model=$3, specs=$4, condition_notes=$5, 
             cost_price=$6, repair_cost=$7, target_price=$8, status=$9, image_url=$10, 
             date_in=$11, date_out=$12, updated_at=NOW() 
         WHERE id=$13`,
        [sku_code, brand, model, specs, condition_notes, cost_price, repair_cost, target_price, status, image_url, date_in, date_out, id]
      );

      // PENCATATAN LOG AKTIFITAS CERDAS 🎥
      const jenisAksi = status === "Terjual" ? "PENJUALAN" : "EDIT STOK";
      const deskripsiLog = status === "Terjual" 
        ? `Menjual unit: ${brand} ${model} (SKU: ${sku_code})`
        : `Mengubah data unit: ${brand} ${model} (SKU: ${sku_code})`;
        
      await catatLog(activeUser, jenisAksi, deskripsiLog);

    } catch (error) {
      console.error("🚨 GAGAL UPDATE DATA DB:", error);
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

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <form action={perbaruiLaptop} className="flex flex-col gap-4">
          
          <input type="hidden" name="existing_image" value={laptop?.image_url || ""} />

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-6 items-center">
            <div className="shrink-0">
              {laptop?.image_url ? (
                <img 
                  src={laptop.image_url} 
                  alt="Foto Laptop" 
                  className="w-24 h-24 object-cover rounded border-2 border-white shadow"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 border border-gray-300">
                  Belum ada foto
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-blue-800 mb-2">Ganti Foto Fisik Laptop?</label>
              <input 
                type="file" 
                name="image" 
                accept="image/*" 
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengganti foto lama.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Tanggal Masuk</label>
              <input 
                type="date" 
                name="date_in" 
                defaultValue={formatDateForInput(laptop?.date_in) || today} 
                required 
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Tanggal Keluar (Terjual)</label>
              <input 
                type="date" 
                name="date_out" 
                defaultValue={formatDateForInput(laptop?.date_out)} 
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none transition" 
              />
              <p className="text-[10px] text-gray-400 mt-1">Akan terisi otomatis saat status diubah menjadi Terjual.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">SKU Code</label>
              <input type="text" name="sku_code" defaultValue={laptop?.sku_code} required className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Status Barang</label>
              <select name="status" defaultValue={laptop?.status} className="w-full border rounded p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition">
                <option value="Tersedia">Tersedia</option>
                <option value="Terjual">Terjual</option>
                <option value="Diperbaiki">Sedang Diperbaiki</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Brand</label>
              <input type="text" name="brand" defaultValue={laptop?.brand} required className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Model Laptop</label>
              <input type="text" name="model" defaultValue={laptop?.model} required className="w-full border rounded p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Spesifikasi Singkat</label>
            <textarea name="specs" defaultValue={laptop?.specs || ""} className="w-full border rounded p-2 h-20" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Catatan Kondisi / Minus</label>
            <textarea name="condition_notes" defaultValue={laptop?.condition_notes || ""} className="w-full border rounded p-2 h-20" />
          </div>

          <div className="p-4 bg-gray-50 rounded border border-gray-200 mt-2">
            <h3 className="font-semibold text-gray-700 mb-4">Informasi Harga (Rp)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Beli Awal</label>
                <input type="number" name="cost_price" defaultValue={laptop?.cost_price} required className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Biaya Perbaikan</label>
                <input type="number" name="repair_cost" defaultValue={laptop?.repair_cost} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Jual Target</label>
                <input type="number" name="target_price" defaultValue={laptop?.target_price} required className="w-full border rounded p-2" />
              </div>
            </div>
          </div>

          <button type="submit" className="mt-4 bg-amber-500 text-white font-semibold py-3 rounded hover:bg-amber-600 transition shadow-md">
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}