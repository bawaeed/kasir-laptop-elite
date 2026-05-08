import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, catatLog } from "@/lib/db"; 
import Link from "next/link";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth"; 

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditStokPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const id = Number(resolvedParams.id); // Prisma butuh ID dalam bentuk Number
  const errorMsg = resolvedSearchParams?.error;

  // 1. Ambil data laptop via Prisma
  const laptop = await prisma.laptop.findUnique({
    where: { id: id }
  });
  
  if (!laptop) {
    redirect("/inventaris");
  }
  
  const formattedDate = laptop.date_in ? new Date(laptop.date_in).toISOString().split("T")[0] : "";

  // 2. Server Action untuk Update
  async function updateLaptop(formData: FormData) {
    "use server";
    
    const session = await auth();
    const activeUser = session?.user?.name || "Sistem";

    const sku_code = formData.get("sku_code") as string;
    
    // 🛡️ CEK DUPLIKAT SKU (Kecuali ID ini sendiri)
    const duplikat = await prisma.laptop.findFirst({
      where: {
        sku_code: sku_code,
        NOT: { id: id }
      }
    });

    if (duplikat) {
      redirect(`/inventaris/edit/${id}?error=sku_duplikat`);
    }

    const date_in = new Date(formData.get("date_in") as string); 
    const brand = formData.get("brand") as string;
    const model = formData.get("model") as string;
    const specs = formData.get("specs") as string;
    const condition_notes = formData.get("condition_notes") as string;

    const cost_price = parseFloat(formData.get("cost_price") as string) || 0;
    const repair_cost = parseFloat(formData.get("repair_cost") as string) || 0;
    const sparepart_cost = parseFloat(formData.get("sparepart_cost") as string) || 0;
    const target_price = parseFloat(formData.get("target_price") as string) || 0;

    const file = formData.get("image") as File;
    let image_url = laptop?.image_url || "";

    // Upload Foto (Hanya bekerja lokal, di Vercel butuh Storage tambahan nanti)
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
      await prisma.laptop.update({
        where: { id: id },
        data: {
          date_in,
          sku_code,
          brand,
          model,
          specs,
          condition_notes,
          cost_price,
          repair_cost,
          sparepart_cost,
          target_price,
          image_url,
        }
      });

      await catatLog(activeUser, "EDIT STOK", `Mengubah data unit: ${brand} ${model} (${sku_code})`);

    } catch (error) {
      console.error("Gagal update via Prisma:", error);
    }

    revalidatePath("/inventaris");
    redirect("/inventaris");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center mb-6 gap-4">
        <Link href="/inventaris" className="text-gray-500 hover:text-gray-800">← Kembali</Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Data Laptop</h1>
      </div>

      {errorMsg === "sku_duplikat" && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-bold">Gagal Menyimpan!</h3>
            <p className="text-sm">SKU sudah digunakan laptop lain.</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <form action={updateLaptop} className="flex flex-col gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-bold text-blue-800 mb-2">📷 Ganti Foto Fisik</label>
              <input type="file" name="image" accept="image/*" className="w-full text-sm" />
            </div>
            {laptop?.image_url && (
              <div className="ml-4 w-20 h-20 rounded bg-gray-200 border overflow-hidden flex-shrink-0">
                <img src={laptop.image_url} alt="Foto Lama" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Tanggal Masuk</label>
              <input type="date" name="date_in" defaultValue={formattedDate} required className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">SKU Code</label>
              <input type="text" name="sku_code" defaultValue={laptop?.sku_code || ""} required className="w-full border rounded p-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Brand</label>
              <input type="text" name="brand" defaultValue={laptop?.brand || ""} required className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Model Laptop</label>
              <input type="text" name="model" defaultValue={laptop?.model || ""} required className="w-full border rounded p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Spesifikasi</label>
            <textarea name="specs" defaultValue={laptop?.specs || ""} className="w-full border rounded p-2 h-20" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Catatan Kondisi</label>
            <textarea name="condition_notes" defaultValue={laptop?.condition_notes || ""} className="w-full border rounded p-2 h-20" />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Informasi Modal & Harga (Rp)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Beli</label>
                <input type="number" name="cost_price" defaultValue={Number(laptop?.cost_price || 0)} required className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Servis</label>
                <input type="number" name="repair_cost" defaultValue={Number(laptop?.repair_cost || 0)} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Sparepart</label>
                <input type="number" name="sparepart_cost" defaultValue={Number(laptop?.sparepart_cost || 0)} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">Harga Jual</label>
                <input type="number" name="target_price" defaultValue={Number(laptop?.target_price || 0)} required className="w-full border border-blue-300 bg-blue-50 rounded p-2 text-sm font-semibold" />
              </div>
            </div>
          </div>

          <button type="submit" className="mt-4 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition shadow-md">
            💾 Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}