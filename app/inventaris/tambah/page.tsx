"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { simpanLaptopDb } from "./action"; // Memanggil pasukan belakang

export default function TambahStokPage() {
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const today = new Date().toISOString().split("T")[0];

  // Fungsi untuk menampilkan preview foto saat dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // Tampilkan gambar di layar
    }
  };

  // Fungsi saat tombol "Simpan" ditekan
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    let finalImageUrl = null;

    // 1. KOMPRESI & UPLOAD KE IMGBB
    if (selectedFile) {
      try {
        // Pengecilan Foto (Target: ~300KB)
        const options = {
          maxSizeMB: 0.3, 
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(selectedFile, options);

        // Peluncuran ke markas ImgBB
        const imgbbData = new FormData();
        imgbbData.append("image", compressedFile);
        
        const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: imgbbData,
        });

        const result = await res.json();
        if (result.success) {
          finalImageUrl = result.data.url; // Berhasil dapat link URL!
        } else {
          throw new Error("Gagal upload ke ImgBB");
        }
      } catch (error) {
        console.error("Upload Error:", error);
        setErrorMsg("Gagal mengunggah foto. Pastikan koneksi stabil.");
        setIsLoading(false);
        return; // Hentikan operasi jika foto gagal
      }
    }

    // 2. KIRIM KE SERVER DATABASE
    const response = await simpanLaptopDb(formData, finalImageUrl);

    // 3. CEK HASIL DARI SERVER
    if (response?.error === "sku_duplikat") {
      setErrorMsg("SKU sudah terdaftar! Gunakan kode lain.");
      setIsLoading(false);
    } else if (response?.error) {
      setErrorMsg("Terjadi kesalahan pada server database.");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tambah Unit Laptop</h1>
          <p className="text-xs text-gray-500">Data ini akan langsung tampil di etalase depan.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          {/* KOTAK UPLOAD FOTO (Dilengkapi Preview) */}
          <div className="group relative border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-blue-300 transition-all overflow-hidden h-48">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="h-full w-full object-contain z-10" />
            ) : (
              <>
                <ImageIcon className="text-blue-600 mb-3 group-hover:scale-110 transition-transform" size={32} />
                <label className="block text-sm font-bold text-blue-900 cursor-pointer">Pilih Foto Fisik Laptop</label>
                <p className="text-[10px] text-blue-400 mt-1">Otomatis dikompres & hemat kuota</p>
              </>
            )}
            {/* Input file disembunyikan menutupi seluruh area */}
            <input 
              type="file" 
              name="image" 
              accept="image/*" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
            />
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

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white py-4 rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-3 ${
              isLoading ? "bg-blue-400 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Memproses Foto & Menyimpan...
              </>
            ) : (
              <>
                <Save size={20} />
                Simpan ke Inventaris
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}