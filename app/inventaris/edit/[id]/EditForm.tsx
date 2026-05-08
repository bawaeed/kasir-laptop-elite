"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { updateLaptopDb } from "./action";

export default function EditForm({ laptop }: { laptop: any }) {
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(laptop.image_url);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Menangani perubahan foto dan menampilkan preview instan
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    let finalImageUrl = laptop.image_url;

    // 1. PROSES UPLOAD IMGBB (Hanya jika pengguna memilih foto baru)
    if (selectedFile) {
      try {
        const options = { maxSizeMB: 0.4, maxWidthOrHeight: 1200, useWebWorker: true };
        const compressedFile = await imageCompression(selectedFile, options);
        
        const imgbbData = new FormData();
        imgbbData.append("image", compressedFile);
        
        const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: imgbbData,
        });

        const result = await res.json();
        if (result.success) {
          finalImageUrl = result.data.url;
        } else {
          throw new Error("Gagal mengunggah ke ImgBB");
        }
      } catch (err) {
        setErrorMsg("Gagal upload foto baru. Periksa koneksi internet.");
        setIsLoading(false);
        return;
      }
    }

    // 2. KIRIM DATA KE SERVER DATABASE
    const response = await updateLaptopDb(laptop.id, formData, finalImageUrl);

    if (response?.success) {
      // Navigasi manual yang paling stabil untuk menghindari White Screen
      window.location.href = "/inventaris";
    } else {
      setErrorMsg(response?.error === "sku_duplikat" ? "SKU sudah digunakan laptop lain!" : "Terjadi kesalahan saat menyimpan data.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Link href="/inventaris" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors w-fit">
        <ArrowLeft size={18} />
        <span className="font-medium">Kembali ke Inventaris</span>
      </Link>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-center gap-3 shadow-sm">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-bold">{errorMsg}</p>
        </div>
      )}

      <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b bg-slate-50/50">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Data Laptop</h1>
          <p className="text-xs text-gray-500">Model: {laptop.brand} {laptop.model}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          {/* AREA PREVIEW FOTO */}
          <div className="group relative border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-blue-300 transition-all overflow-hidden h-56">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={preview} 
                alt="Preview" 
                className="h-full w-full object-contain z-10" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  setPreview(null);
                }}
              />
            ) : (
              <>
                <ImageIcon className="text-blue-200 mb-3" size={48} />
                <label className="text-sm font-bold text-blue-900">Belum Ada Foto</label>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            <div className="absolute bottom-3 bg-white/90 px-4 py-1.5 rounded-full text-[10px] font-black text-blue-600 shadow-sm z-30 uppercase tracking-widest border border-blue-50">
              Klik untuk Ganti Foto
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Tanggal Masuk</label>
              <input type="date" name="date_in" defaultValue={laptop.date_in?.split("T")[0]} required className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">SKU Code</label>
              <input type="text" name="sku_code" defaultValue={laptop.sku_code} required className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="brand" defaultValue={laptop.brand} placeholder="Merek" required className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" name="model" defaultValue={laptop.model} placeholder="Model" required className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <textarea name="specs" defaultValue={laptop.specs} placeholder="Spesifikasi..." className="w-full border rounded-xl p-3 h-24 outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea name="condition_notes" defaultValue={laptop.condition_notes} placeholder="Catatan Kondisi..." className="w-full border rounded-xl p-3 h-20 outline-none focus:ring-2 focus:ring-blue-500" />

          <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">💰 Update Finansial</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input type="number" name="cost_price" defaultValue={laptop.cost_price} placeholder="Beli" className="w-full border rounded-lg p-2.5 text-sm" />
              <input type="number" name="repair_cost" defaultValue={laptop.repair_cost} placeholder="Servis" className="w-full border rounded-lg p-2.5 text-sm" />
              <input type="number" name="sparepart_cost" defaultValue={laptop.sparepart_cost} placeholder="Sparepart" className="w-full border rounded-lg p-2.5 text-sm" />
              <input type="number" name="target_price" defaultValue={laptop.target_price} placeholder="Jual" required className="w-full bg-blue-600 text-white rounded-lg p-2.5 text-sm font-bold placeholder:text-blue-300" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white py-4 rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-3 ${
              isLoading ? "bg-emerald-400 cursor-not-allowed shadow-none" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Sedang Menyimpan...
              </>
            ) : (
              <>
                <Save size={20} />
                Simpan Perubahan
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}