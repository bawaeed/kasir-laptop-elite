"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, Loader2, X, Plus } from "lucide-react";
import { updateLaptopDb } from "./action";

type NewImageObj = { file: File; preview: string };

export default function EditForm({ laptop }: { laptop: any }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 🛡️ KOMPABILITAS MUNDUR: Menyelamatkan data lama & data baru
  const getInitialImages = () => {
    const images: string[] = [];
    // Jika ada data array baru (image_urls)
    if (laptop.image_urls && Array.isArray(laptop.image_urls)) {
      images.push(...laptop.image_urls);
    }
    // Jika masih ada data tunggal lama (image_url) yang belum sempat dikonversi
    if (laptop.image_url && typeof laptop.image_url === "string") {
      images.push(laptop.image_url);
    }
    // Hilangkan duplikat jika ada
    return Array.from(new Set(images));
  };

  const [existingImages, setExistingImages] = useState<string[]>(getInitialImages());
  const [newImages, setNewImages] = useState<NewImageObj[]>([]);

  // 📸 TAKTIK BARU: FileReader dengan Promise.all untuk Multi-Gambar
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let hasError = false;
    const validImages: NewImageObj[] = [];

    // Proses semua file secara paralel menjadi Base64
    await Promise.all(
      files.map((file) => {
        return new Promise<void>((resolve) => {
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
              validImages.push({
                file,
                preview: event.target?.result as string, // 👈 Menggunakan Base64 yang stabil
              });
              resolve();
            };
            reader.readAsDataURL(file);
          } else {
            hasError = true;
            resolve();
          }
        });
      })
    );

    if (hasError) setErrorMsg("Beberapa file diabaikan karena bukan format gambar.");
    else setErrorMsg("");

    // Masukkan ke state setelah semua selesai diproses
    setNewImages((prev) => [...prev, ...validImages]);
    
    // Reset input agar bisa pilih file lagi
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);

    // 1. Kirim Daftar Gambar Lama yang masih dipertahankan
    existingImages.forEach((url) => {
      formData.append("existing_images", url);
    });

    // 2. Kirim Daftar Gambar Baru yang ingin diupload
    newImages.forEach((img) => {
      formData.append("new_images", img.file);
    });

    // 3. Eksekusi ke Server Action
    const response = await updateLaptopDb(laptop.id, formData);

    if (response?.success) {
      window.location.href = "/inventaris";
    } else {
      setErrorMsg(response?.error === "sku_duplikat" ? "SKU sudah digunakan unit lain!" : "Gagal menyimpan perubahan ke database.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Link href="/inventaris" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors w-fit">
        <ArrowLeft size={18} />
        <span className="font-medium">Kembali ke Inventaris</span>
      </Link>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r-xl flex items-center gap-3 animate-pulse">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-bold">{errorMsg}</p>
        </div>
      )}

      <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100">
        <div className="p-6 border-b bg-slate-50">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">EDIT UNIT LAPTOP</h1>
          <p className="text-xs font-medium text-slate-500">Perbarui informasi dan galeri foto unit.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          
          {/* PANEL MULTI GAMBAR */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <label className="block text-xs font-black text-slate-400 uppercase mb-4 tracking-widest text-center">
              Galeri Foto ({existingImages.length + newImages.length})
            </label>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Render Gambar Lama dari Database */}
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 aspect-square bg-white shadow-sm">
                  <img src={url} alt={`Lama ${index}`} className="w-full h-full object-cover opacity-90" />
                  <div className="absolute top-0 left-0 bg-slate-900/80 text-white text-[9px] px-2 py-1 font-bold rounded-br-lg tracking-widest">LAMA</div>
                  <button 
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Render Gambar Baru (Base64) */}
              {newImages.map((img, index) => (
                <div key={`new-${index}`} className="relative group rounded-2xl overflow-hidden border-2 border-blue-200 aspect-square bg-white shadow-sm">
                  <img src={img.preview} alt={`Baru ${index}`} className="w-full h-full object-cover" />
                  <div className="absolute top-0 left-0 bg-blue-600/90 text-white text-[9px] px-2 py-1 font-bold rounded-br-lg tracking-widest">BARU</div>
                  <button 
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {/* TOMBOL TAMBAH FOTO MULTIPLE */}
              <label className="cursor-pointer border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center aspect-square bg-white hover:bg-blue-50 hover:border-blue-400 transition-all text-slate-400 hover:text-blue-600">
                <Plus size={28} className="mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">Tambah</span>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* FORM TEXT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Tanggal Masuk</label>
              <input type="date" name="date_in" defaultValue={laptop.date_in?.split("T")[0]} required className="w-full border-2 border-slate-100 rounded-xl p-3.5 outline-none focus:border-blue-500 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">SKU / Serial</label>
              <input type="text" name="sku_code" defaultValue={laptop.sku_code} required className="w-full border-2 border-slate-100 rounded-xl p-3.5 outline-none focus:border-blue-500 font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Merek</label>
              <input type="text" name="brand" defaultValue={laptop.brand} required className="w-full border-2 border-slate-100 rounded-xl p-3.5 outline-none focus:border-blue-500 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Model</label>
              <input type="text" name="model" defaultValue={laptop.model} required className="w-full border-2 border-slate-100 rounded-xl p-3.5 outline-none focus:border-blue-500 font-bold" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Spesifikasi</label>
              <textarea name="specs" defaultValue={laptop.specs} className="w-full border-2 border-slate-100 rounded-xl p-3.5 h-24 outline-none focus:border-blue-500 font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Catatan Kondisi</label>
              <textarea name="condition_notes" defaultValue={laptop.condition_notes} className="w-full border-2 border-slate-100 rounded-xl p-3.5 h-20 outline-none focus:border-blue-500 font-medium" />
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Rincian Finansial</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Beli (Modal)</label>
                <input type="number" name="cost_price" defaultValue={laptop.cost_price} className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-red-400 mb-1">Servis</label>
                <input type="number" name="repair_cost" defaultValue={laptop.repair_cost} className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-red-400 mb-1">Sparepart</label>
                <input type="number" name="sparepart_cost" defaultValue={laptop.sparepart_cost} className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-500 mb-1">Target Jual</label>
                <input type="number" name="target_price" defaultValue={laptop.target_price} required className="w-full border-2 border-blue-200 bg-blue-50 text-blue-700 rounded-xl p-3 outline-none font-black" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-3xl font-black shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-95 tracking-widest">
            {isLoading ? <Loader2 className="animate-spin" /> : <Save size={22} />} 
            SIMPAN PERUBAHAN
          </button>
        </form>
      </div>
    </>
  );
}