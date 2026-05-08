import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, catatLog } from "@/lib/db";
import Link from "next/link";
import { auth } from "@/auth";
import { ArrowLeft, Save, ImageIcon } from "lucide-react";

export default async function TambahStokPage() {
  // Server Action untuk memproses data
  async function addLaptop(formData: FormData) {
    "use server";
    const session = await auth();
    const activeUser = session?.user?.name || "Admin";

    const file = formData.get("image") as File;
    let image_url = "";

    // 🚀 PROSES UPLOAD KE SUPABASE STORAGE
    if (file && file.size > 0) {
      try {
        // Import dinamis agar tidak berat di awal
        const { uploadFotoLaptop } = await import("@/lib/supabase-storage");
        image_url = await uploadFotoLaptop(file);
      } catch (err) {
        console.error("Gagal upload foto ke Supabase:", err);
      }
    }

    // 💾 SIMPAN DATA KE DATABASE VIA PRISMA
    try {
      await prisma.laptop.create({
        data: {
          date_in: new Date(formData.get("date_in") as string),
          sku_code: formData.get("sku_code") as string,
          brand: formData.get("brand") as string,
          model: formData.get("model") as string,
          specs: formData.get("specs") as string,
          condition_notes: formData.get("condition_notes") as string,
          cost_price: parseFloat(formData.get("cost_price") as string) || 0,
          repair_cost: parseFloat(formData.get("repair_cost") as string) || 0,
          sparepart_cost: parseFloat(formData.get("sparepart_cost") as string) || 0,
          target_price: parseFloat(formData.get("target_price") as string) || 0,
          image_url: image_url, // Link URL dari Supabase
          status: "Tersedia",
        },
      });

      await catatLog(activeUser, "TAMBAH STOK", `Menambah unit baru: ${formData.get("brand")} ${formData.get("model")} (SKU: ${formData.get("sku_code")})`);
    } catch (error) {
      console.error("Gagal simpan database:", error);
    }

    revalidatePath("/inventaris");
    redirect("/inventaris");
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Tombol Kembali */}
      <Link href="/inventaris" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors w-fit">
        <ArrowLeft size={18} />
        <span className="font-medium">Kembali ke Inventaris</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50">
          <h1 className="text-2xl font-bold text-gray-900">Tambah Unit Laptop</h1>
          <p className="text-sm text-gray-500">Pastikan data modal dan spesifikasi terisi dengan akurat.</p>
        </div>

        <form action={addLaptop} className="p-6 flex flex-col gap-6">
          
          {/* AREA UPLOAD FOTO */}
          <div className="group relative border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-xl p-8 flex flex-col items-center justify-center hover:border-blue-300 transition-all">
            <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <ImageIcon className="text-blue-600" size={28} />
            </div>
            <label className="block text-sm font-bold text-blue-900 mb-1 cursor-pointer">
              Unggah Foto Fisik Laptop
            </label>
            <p className="text-xs text-blue-500 mb-4">Format: JPG, PNG, atau WEBP (Maks. 2MB)</p>
            <input 
              type="file" 
              name="image" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* INFORMASI DASAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tanggal Masuk</label>
              <input type="date" name="date_in" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">SKU Code</label>
              <input type="text" name="sku_code" placeholder="Contoh: ELITE-2026-001" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Brand</label>
              <input type="text" name="brand" placeholder="Dell, HP, Lenovo, dll" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Model Laptop</label>
              <input type="text" name="model" placeholder="ThinkPad X1 Carbon G9" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Spesifikasi Singkat</label>
            <textarea name="specs" placeholder="Core i7, RAM 16GB, SSD 512GB..." className="w-full border rounded-lg p-2.5 h-24 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Catatan Kondisi / Minus</label>
            <textarea name="condition_notes" placeholder="Mulus 95%, baret halus di casing bawah..." className="w-full border rounded-lg p-2.5 h-20 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* HARGA DAN MODAL */}
          <div className="bg-slate-50 p-5 rounded-xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              💰 Kalkulasi Harga (IDR)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Harga Beli</label>
                <input type="number" name="cost_price" placeholder="0" required className="w-full border rounded-lg p-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Biaya Servis</label>
                <input type="number" name="repair_cost" placeholder="0" className="w-full border rounded-lg p-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Sparepart</label>
                <input type="number" name="sparepart_cost" placeholder="0" className="w-full border rounded-lg p-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-600 uppercase">Harga Jual</label>
                <input type="number" name="target_price" placeholder="0" required className="w-full border border-blue-200 bg-blue-50 rounded-lg p-2 text-sm font-bold text-blue-700" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
            <Save size={20} />
            Simpan ke Inventaris
          </button>
        </form>
      </div>
    </div>
  );
}