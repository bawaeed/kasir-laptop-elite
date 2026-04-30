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
  const params = await searchParams;
  const errorMsg = params?.error;
  const today = new Date().toISOString().split("T")[0];

  async function simpanLaptop(formData: FormData) {
    "use server";
    
    const session = await auth();
    const activeUser = session?.user?.name || "Sistem";
    const sku_code = formData.get("sku_code") as string;
    
    const cekSku = await pool.query('SELECT id FROM "Laptop" WHERE sku_code = $1', [sku_code]);
    if (cekSku.rows.length > 0) {
      redirect('/inventaris/tambah?error=sku_duplikat');
    }

    const date_in = formData.get("date_in") as string; 
    const brand = formData.get("brand") as string;
    const model = formData.get("model") as string;
    const specs = formData.get("specs") as string;
    const condition_notes = formData.get("condition_notes") as string;

    const cost_price = parseFloat(formData.get("cost_price") as string) || 0;
    const repair_cost = parseFloat(formData.get("repair_cost") as string) || 0;
    const sparepart_cost = parseFloat(formData.get("sparepart_cost") as string) || 0;
    const target_price = parseFloat(formData.get("target_price") as string) || 0;

    const file = formData.get("image") as File;
    let image_url = null; 

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = Date.now() + "_" + file.name.replace(/\s+/g, "_");
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

      await catatLog(activeUser, "TAMBAH STOK", `Unit baru: ${brand} ${model} (SKU: ${sku_code})`);

    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    }

    revalidatePath("/inventaris");
    redirect("/inventaris");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center mb-6 gap-4">
        <Link href="/inventaris" className="text-gray-500 hover:text-gray-800">← Kembali</Link>
        <h1 className="text-2xl font-bold text-gray-800">Tambah Unit Laptop Bekas</h1>
      </div>

      {errorMsg === "sku_duplikat" && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
          <p className="font-bold">⚠️ SKU Duplikat!</p>
          <p className="text-sm">Kode SKU sudah terdaftar, gunakan kode lain.</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <form action={simpanLaptop} className="flex flex-col gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-bold text-blue-800 mb-2">📷 Foto Unit</label>
            <input type="file" name="image" accept="image/*" className="w-full text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="date" name="date_in" defaultValue={today} required className="border rounded p-2" />
            <input type="text" name="sku_code" required placeholder="SKU Code" className="border rounded p-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="brand" required placeholder="Brand" className="border rounded p-2" />
            <input type="text" name="model" required placeholder="Model" className="border rounded p-2" />
          </div>

          <textarea name="specs" placeholder="Spesifikasi" className="border rounded p-2 h-20" />
          <textarea name="condition_notes" placeholder="Minus / Kondisi Fisik" className="border rounded p-2 h-20" />

          <div className="p-4 bg-gray-50 rounded-lg border grid grid-cols-2 md:grid-cols-4 gap-4">
            <input type="number" name="cost_price" placeholder="Harga Beli" className="border rounded p-2 text-sm" />
            <input type="number" name="repair_cost" placeholder="Servis" className="border rounded p-2 text-sm" />
            <input type="number" name="sparepart_cost" placeholder="Sparepart" className="border rounded p-2 text-sm" />
            <input type="number" name="target_price" placeholder="Harga Jual" className="border rounded p-2 text-sm font-bold bg-blue-50" />
          </div>

          <button type="submit" className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg">
            💾 Simpan Data Unit
          </button>
        </form>
      </div>
    </div>
  );
}