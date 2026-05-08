"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ImageIcon, AlertCircle, Loader2, ClipboardList, Wallet, X, Plus } from "lucide-react";
import imageCompression from "browser-image-compression";
import { simpanLaptopDb } from "./action";

// 🛡️ Tipe data khusus untuk menampung banyak gambar beserta preview-nya
type ImageObj = { file: File; preview: string };

export default function TambahStokPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // 🔄 STATE BARU: Menggunakan Array untuk menampung banyak foto
  const [images, setImages] = useState<ImageObj[]>([]);

  // 🛡️ CLEANUP: Menghindari kebocoran memori saat komponen ditutup atau foto dihapus
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Tangkap semua file yang dipilih (bisa lebih dari satu)
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validImages: ImageObj[] = [];
    let hasError = false;

    files.forEach((file) => {
      // Validasi: pastikan format gambar
      if (file.type.startsWith("image/")) {
        validImages.push({
          file,
          preview: URL.createObjectURL(file), // Buat preview instan per file
        });
      } else {
        hasError = true;
      }
    });

    if (hasError) {
      setErrorMsg("Beberapa file diabaikan karena bukan format gambar (JPG/PNG/WEBP).");
    } else {
      setErrorMsg("");
    }

    // Tambahkan foto baru ke daftar foto yang sudah ada (tidak menimpa yang lama)
    setImages((prev) => [...prev, ...validImages]);

    // Reset input file agar sistem bisa memicu onChange jika file yang sama dipilih lagi
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[indexToRemove].preview); // Bersihkan memori browser
      newImages.splice(indexToRemove, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    const formData = new FormData(e.currentTarget);

    // ⚠️ PENTING: Bersihkan input file bawaan form, lalu suntikkan dari State Array kita
    formData.delete("image"); // Hapus bawaan jika ada
    formData.delete("images"); // Hapus bawaan jika ada
    
    images.forEach((img) => {
      formData.append("images", img.file); // Nama kuncinya menjadi "images" (jamak)
    });

    try {
      const result = await simpanLaptopDb(formData);
      if (result?.error) {
        setErrorMsg(result.error);
        setIsLoading(false);
      } else {
        router.push("/inventaris");
        router.refresh();
      }
    } catch (error) {
      setErrorMsg("Sistem gagal menyimpan data. Periksa koneksi atau database.");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-slate-100 min-h-screen text-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/inventaris" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors">
            <ArrowLeft className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">TAMBAH UNIT LAPTOP</h1>
            <p className="text-slate-500 text-sm font-medium">Input data stok baru ke sistem inventaris.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r-xl flex items-center gap-3 animate-pulse">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KOLOM KIRI: FORM DATA */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">SKU / Serial Number</label>
                  <input name="sku_code" type="text" required placeholder="Contoh: LNV-T480-01" className="w-full border-2 border-slate-100 rounded-xl p-3.5 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Merek</label>
                  <input name="brand" type="text" required placeholder="Lenovo / ASUS" className="w-full border-2 border-slate-100 rounded-xl p-3.5 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Model / Tipe</label>
                  <input name="model" type="text" required placeholder="ThinkPad T480" className="w-full border-2 border-slate-100 rounded-xl p-3.5 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Spesifikasi Singkat</label>
                  <textarea name="specs" rows={2} placeholder="Core i5 Gen 8, RAM 16GB, SSD 256GB..." className="w-full border-2 border-slate-100 rounded-xl p-3.5 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <ClipboardList size={14} /> Catatan Kondisi
                  </label>
                  <textarea name="condition_notes" rows={2} placeholder="Kemulusan 95%, baterai oke..." className="w-full border-2 border-slate-100 rounded-xl p-3.5 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-black text-slate-800 mb-5 flex items-center gap-2">
                  <Wallet size={18} className="text-green-600" /> HARGA & MODAL
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Harga Beli (Modal)</label>
                    <input name="cost_price" type="number" required placeholder="0" className="w-full border-2 border-slate-100 rounded-xl p-3.5 font-bold outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Harga Jual</label>
                    <input name="target_price" type="number" required placeholder="0" className="w-full border-2 border-blue-100 rounded-xl p-3.5 bg-blue-50 text-blue-700 font-black outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-red-400 uppercase mb-2 tracking-widest">Biaya Servis</label>
                    <input name="repair_cost" type="number" defaultValue={0} className="w-full border-2 border-slate-100 rounded-xl p-3.5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-red-400 uppercase mb-2 tracking-widest">Biaya Sparepart</label>
                    <input name="sparepart_cost" type="number" defaultValue={0} className="w-full border-2 border-slate-100 rounded-xl p-3.5 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: FOTO & SIMPAN */}
            <div className="space-y-6">
              
              {/* PANEL MULTI GAMBAR */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <label className="block text-xs font-black text-slate-400 uppercase mb-4 tracking-widest text-center">
                  Galeri Foto ({images.length})
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Looping semua gambar yang dipilih */}
                  {images.map((img, index) => (
                    <div key={index} className="relative group rounded-2xl overflow-hidden border-2 border-slate-100 aspect-square bg-slate-50">
                      <img src={img.preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {/* TOMBOL TAMBAH FOTO (Bisa pilih multiple) */}
                  <label className="cursor-pointer border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center aspect-square bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all text-slate-400 hover:text-blue-500">
                    <Plus size={28} className="mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-center px-2">Tambah Foto</span>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      multiple // 👈 INI KUNCI UTAMA AGAR BISA PILIH BANYAK FILE
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Status Unit</label>
                <select name="status" className="w-full border-2 border-slate-100 rounded-xl p-3.5 font-bold text-slate-700 outline-none focus:border-blue-500 transition-all">
                  <option value="Tersedia">READY (SIAP JUAL)</option>
                  <option value="Servis">PROSES SERVIS</option>
                  <option value="Booking">TERBOOKING</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-5 rounded-3xl font-black text-white flex items-center justify-center gap-3 transition-all tracking-widest ${
                  isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-2xl active:scale-95 shadow-blue-200 shadow-xl"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save size={22} />
                )}
                SIMPAN STOK
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}