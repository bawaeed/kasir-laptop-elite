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

  async function simpanLaptop(formData: FormData) {
    "use server";
    
    const session = await auth();
    const activeUser = session?.user?.name || "Admin";
    const sku_code = formData.get("sku_code") as string;
    
    // 1. Cek SKU Duplikat
    const cekSku = await prisma.laptop.findUnique({
      where: { sku_code: sku_code }
    });

    if (cekSku) {
      redirect('/inventaris/tambah?error=sku_duplikat');
    }

    const file = formData.get("image") as File;
    let image_url = null; 

    // 2. Upload ke Supabase Storage
    if (file && file.size > 0) {
      try {
        const { uploadFotoLaptop } = await import("@/lib/supabase-storage");
        image_url = await uploadFotoLaptop(file);
      } catch (err) {
        console.error("Gagal upload foto:", err);
      }
    }

    // 3. Simpan ke Database
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

      await catatLog(activeUser, "TAMBAH STOK", `Unit: ${formData.get("brand")} ${formData.get("model")} (SKU: ${sku_code})`);
    } catch (error) {
      console.error("Database Error:", error);
      return; // Stop jika error DB
    }

    // 4. Redirect (Di luar try-catch sesuai standar Next.js 15)
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
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">SKU sudah terdaftar! Gunakan kode lain.</p>
        </div>
      )}

      <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b bg-slate-50/50">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tambah Unit Laptop</h1>
          <p className="text-xs text-gray-500">Data ini akan langsung tampil di etalase depan.</p>
        </div>

        <form action={simpanLaptop} className="p-8 flex flex-col gap-6">
          {/* UPLOAD FOTO */}
          <div className="group relative border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-2xl p-10 flex flex-col items-center justify-center hover:border-blue-300 transition-all">
            <ImageIcon className="text-blue-600 mb-3 group-hover:scale-110 transition-transform" size={32} />
            <label className="block text-sm font-bold text-blue-900 cursor-pointer">Pilih Foto Fisik Laptop</label>
            <p className="text-[10px] text-blue-400 mt-1">Maksimal 2MB (JPG/PNG)</p>
            <input type="file" name="image" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" name="date_in" defaultValue={today} required className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" name="sku_code" placeholder="SKU Code" required className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="brand" placeholder="Merek (Dell, HP, Apple)" required className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" name="model" placeholder="Model (ThinkPad X1, MacBook Air)" required className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <textarea name="specs" placeholder="Spesifikasi Singkat..." className="w-full border rounded-xl p-3 h-24 outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea name="condition_notes" placeholder="Catatan Kondisi / Minus..." className="w-full border rounded-xl p-3 h-20 outline-none focus:ring-2 focus:ring-blue-500" />

          <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">💰 Kalkulasi Finansial</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input type="number" name="cost_price" placeholder="Harga Beli" className="w-full border rounded-lg p-2.5 text-sm" />
              <input type="number" name="repair_cost" placeholder="Servis" className="w-full border rounded-lg p-2.5 text-sm" />
              <input type="number" name="sparepart_cost" placeholder="Sparepart" className="w-full border rounded-lg p-2.5 text-sm" />
              <input type="number" name="target_price" placeholder="Harga Jual" required className="w-full border-blue-200 bg-blue-600 text-white rounded-lg p-2.5 text-sm font-bold placeholder:text-blue-300" />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3">
            <Save size={20} />
            Simpan ke Inventaris
          </button>
        </form>
      </div>
    </div>
  );
}