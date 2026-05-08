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
        const options = { maxSizeMB: 0.4, maxWidthOrHeight: 1200, useWebWorker: true };
        const compressedFile = await imageCompression(selectedFile, options);
        const imgbbData = new FormData();
        imgbbData.append("image", compressedFile);
        
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
          method: "POST",
          body: imgbbData,
        });

        const result = await res.json();
        if (result.success) finalImageUrl = result.data.url;
      } catch (err) {
        setErrorMsg("Gagal upload foto ke ImgBB.");
        setIsLoading(false);
        return;
      }
    }

    const response = await updateLaptopDb(laptop.id, formData, finalImageUrl);

    if (response?.success) {
      window.location.href = "/inventaris";
    } else {
      setErrorMsg(response?.error === "sku_duplikat" ? "SKU sudah digunakan!" : "Gagal simpan ke database.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Link href="/inventaris" className="flex items-center gap-2 text-gray-500 mb-6 w-fit">
        <ArrowLeft size={18} /> Kembali
      </Link>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-lg">
          <AlertCircle size={20} /> <p className="font-bold">{errorMsg}</p>
        </div>
      )}

      <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50">
          <h1 className="text-2xl font-bold">Edit Laptop: {laptop.brand}</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="relative border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-2xl p-6 flex flex-col items-center justify-center h-52 overflow-hidden">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="h-full object-contain z-10" />
            ) : (
              <ImageIcon className="text-blue-300" size={48} />
            )}
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
            <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-[10px] font-bold text-blue-600 z-30">Klik untuk Ganti Foto</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="date" name="date_in" defaultValue={laptop.date_in?.toISOString().split("T")[0]} required className="border rounded-xl p-3" />
            <input type="text" name="sku_code" defaultValue={laptop.sku_code} required className="border rounded-xl p-3" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="brand" defaultValue={laptop.brand} required className="border rounded-xl p-3" />
            <input type="text" name="model" defaultValue={laptop.model} required className="border rounded-xl p-3" />
          </div>

          <textarea name="specs" defaultValue={laptop.specs} className="border rounded-xl p-3 h-24" />
          <textarea name="condition_notes" defaultValue={laptop.condition_notes} className="border rounded-xl p-3 h-20" />

          <div className="bg-slate-50 p-6 rounded-2xl border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input type="number" name="cost_price" defaultValue={Number(laptop.cost_price)} className="border rounded-lg p-2" />
              <input type="number" name="repair_cost" defaultValue={Number(laptop.repair_cost)} className="border rounded-lg p-2" />
              <input type="number" name="sparepart_cost" defaultValue={Number(laptop.sparepart_cost)} className="border rounded-lg p-2" />
              <input type="number" name="target_price" defaultValue={Number(laptop.target_price)} required className="bg-blue-600 text-white rounded-lg p-2 font-bold" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all">
            {isLoading ? <Loader2 className="animate-spin" /> : <Save />} Simpan Perubahan
          </button>
        </form>
      </div>
    </>
  );
}