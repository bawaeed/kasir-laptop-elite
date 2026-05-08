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

    if (selectedFile) {
      try {
        // 1. Kompresi Foto
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
        const compressedFile = await imageCompression(selectedFile, options);

        // 2. Peluncuran ke Cloudinary (Unsigned Upload)
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        
        const cloudData = new FormData();
        cloudData.append("file", compressedFile);
        cloudData.append("upload_preset", uploadPreset!);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: cloudData,
        });

        const result = await res.json();
        
        if (result.secure_url) {
          finalImageUrl = result.secure_url; // Mengambil link HTTPS Cloudinary
        } else {
          throw new Error("Gagal upload ke Cloudinary");
        }
      } catch (err) {
        console.error("Upload Error:", err);
        setErrorMsg("Gagal mengunggah foto ke Cloudinary. Cek Cloud Name & Preset.");
        setIsLoading(false);
        return;
      }
    }

    // 3. Simpan ke Database via Server Action
    const response = await updateLaptopDb(laptop.id, formData, finalImageUrl);

    if (response?.success) {
      window.location.href = "/inventaris";
    } else {
      setErrorMsg(response?.error === "sku_duplikat" ? "SKU sudah digunakan!" : "Gagal simpan database.");
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
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-bold">{errorMsg}</p>
        </div>
      )}

      <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b bg-slate-50/50">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Laptop (Cloudinary Mode)</h1>
          <p className="text-xs text-gray-500">Aman dari pemblokiran ISP Indonesia.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="group relative border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-blue-300 transition-all overflow-hidden h-56">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="h-full w-full object-contain z-10" />
            ) : (
              <ImageIcon className="text-blue-200" size={48} />
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            <div className="absolute bottom-3 bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-lg z-30 uppercase tracking-widest">
              Ganti Foto Fisik
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" name="date_in" defaultValue={laptop.date_in?.split("T")[0]} required className="w-full border rounded-xl p-3" />
            <input type="text" name="sku_code" defaultValue={laptop.sku_code} required className="w-full border rounded-xl p-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="brand" defaultValue={laptop.brand} placeholder="Merek" required className="w-full border rounded-xl p-3" />
            <input type="text" name="model" defaultValue={laptop.model} placeholder="Model" required className="w-full border rounded-xl p-3" />
          </div>

          <textarea name="specs" defaultValue={laptop.specs} placeholder="Spesifikasi..." className="w-full border rounded-xl p-3 h-24" />
          <textarea name="condition_notes" defaultValue={laptop.condition_notes} placeholder="Catatan Kondisi..." className="w-full border rounded-xl p-3 h-20" />

          <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input type="number" name="cost_price" defaultValue={laptop.cost_price} placeholder="Beli" className="w-full border rounded-lg p-2.5" />
              <input type="number" name="repair_cost" defaultValue={laptop.repair_cost} placeholder="Servis" className="w-full border rounded-lg p-2.5" />
              <input type="number" name="sparepart_cost" defaultValue={laptop.sparepart_cost} placeholder="Part" className="w-full border rounded-lg p-2.5" />
              <input type="number" name="target_price" defaultValue={laptop.target_price} placeholder="Jual" required className="w-full bg-blue-600 text-white rounded-lg p-2.5 font-bold" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3">
            {isLoading ? <Loader2 className="animate-spin" /> : <Save />} Simpan Perubahan
          </button>
        </form>
      </div>
    </>
  );
}