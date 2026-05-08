import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, catatLog } from "@/lib/db";
import Link from "next/link";
import { auth } from "@/auth";
import { ArrowLeft, Save, ImageIcon, AlertCircle } from "lucide-react";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function TambahStokPage({ searchParams }: Props) {
  const params = await searchParams;
  const errorMsg = params?.error;
  const today = new Date().toISOString().split("T")[0];

  // --- SERVER ACTION ---
  async function simpanLaptop(formData: FormData) {
    "use server";
    
    const session = await auth();
    const activeUser = session?.user?.name || "Sistem";
    const sku_code = formData.get("sku_code") as string;
    
    // 1. CEK SKU DUPLIKAT
    const cekSku = await prisma.laptop.findUnique({
      where: { sku_code: sku_code }
    });

    if (cekSku) {
      redirect('/inventaris/tambah?error=sku_duplikat');
    }

    // 2. AMBIL DATA FORM
    const file = formData.get("image") as File;
    let image_url = null; 

    // 🚀 3. PROSES UPLOAD KE SUPABASE STORAGE (Penyimpanan Abadi)
    if (file && file.size > 0) {
      try {
        const { uploadFotoLaptop } = await import("@/lib/supabase-storage");
        image_url = await uploadFotoLaptop(file);
      } catch (err) {
        console.error("Gagal upload ke Supabase:", err);
      }
    }

    // 4. SIMPAN KE DATABASE
    try {
      await prisma.laptop.create({
        data: {
          date_in: new Date(formData.get("date_in") as string),
          sku_code: sku_code,
          brand: formData.get("brand") as string,
          model: formData.get("model") as string,
          specs: formData.get("specs") as string,
          condition_notes: formData.get("condition_notes") as string,
          cost_price: parseFloat(formData.get("cost_price") as string) || 0,
          repair_cost: parseFloat(formData.get("repair_cost") as string) || 0,
          sparepart_cost: parseFloat(formData.get("sparepart_cost") as string) || 0,
          target_price: parseFloat(formData.get("target_price") as string) || 0,
          image_url: image_url,
          status: "Tersedia",
        }
      });

      await catatLog(activeUser, "TAMBAH STOK", `Unit baru: ${formData.get("brand")} ${formData.get("model")} (SKU: ${sku_code})`);
    } catch (error) {
      console.error("Gagal menyimpan ke DB:", error);
      // Jika error database, kita hentikan di sini agar tidak redirect
      return; 
    }

    // 5. REDIRECT (Wajib di luar try-catch agar tidak memicu Server Exception)
    revalidatePath("/inventaris");
    redirect("/inventaris");
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/inventaris" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors w-fit">
        <ArrowLeft size={18} />
        <span className="font-medium">Kembali ke Inventaris</span>
      </Link>

      {errorMsg === "sku_duplikat" && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl shadow-sm flex items-center gap-3">
          <AlertCircle size={20} />
          <div>
            <p className="font-bold">SKU Duplikat!</p>
            <p className="text-sm">Kode SKU sudah terdaftar di sistem.</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <form action={simpanLaptop} className="flex flex-col gap-6">
          
          {/* UPLOAD BOX */}
          <div className="p-6 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-2xl text-center group hover:border-blue-400 transition-colors relative">
            <ImageIcon className="mx-auto text-blue-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
            <label className="block text-sm font-bold text-blue-900 cursor-pointer">
              Klik untuk Pilih Foto Unit
            </label>
            <p className="text-[10px] text-blue-500 mt-1">PNG, JPG, atau WEBP (Maks 2MB)</p>
            <input type="file" name="image" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tanggal Masuk</label>
              <input type="date" name="date_in" defaultValue={today} required className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Kode SKU</label>
              <input type="text" name="sku_code" required placeholder="Contoh: EG-2026-001" className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Merek (Brand)</label>
              <input type="text" name="brand" required placeholder="Dell, HP, Lenovo..." className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Model / Tipe</label>
              <input type="text" name="model" required placeholder="ThinkPad, Latitude..." className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <textarea name="specs" placeholder="Spesifikasi (Prosesor, RAM, SSD...)" className="w-full border rounded-xl p-3 h-24 outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea name="condition_notes" placeholder="Catatan Kondisi Fisik & Minus" className="w-full border rounded-xl p-3 h-20 outline-none focus:ring-2 focus:ring-blue-500" />

          {/* FINANCIAL SECTION */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">💰 Kalkulasi Modal & Harga</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input type="number" name="cost_price" placeholder="Harga Beli" className="border rounded-lg p-2.5 text-sm" />
              <input type="number" name="repair_cost" placeholder="Biaya Servis" className="border rounded-lg p-2.5 text-sm" />
              <input type="number" name="sparepart_cost" placeholder="Sparepart" className="border rounded-lg p-2.5 text-sm" />
              <input type="number" name="target_price" placeholder="Harga Jual" className="border rounded-lg p-2.5 text-sm font-bold bg-blue-600 text-white placeholder:text-blue-200" />
            </div>
          </div>

          <button type="submit" className="bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-2 transition-all">
            <Save size={20} />
            Simpan ke Inventaris
          </button>
        </form>
      </div>
    </div>
  );
}