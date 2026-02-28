"use client";

import { Printer, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function FakturPage() {
  
  const handleSavePDF = () => {
    toast("💡 TIPS: Pada jendela yang muncul, ubah 'Tujuan' (Destination) menjadi 'Simpan sebagai PDF'.", {
      duration: 5000,
      position: "top-center",
      style: { background: '#3b82f6', color: '#fff', fontWeight: 'bold' }
    });
    
    setTimeout(() => {
      window.print();
    }, 800);
  };

  return (
    <>
      {/* KODE PAKSA: Menjamin orientasi kertas menjadi LANDSCAPE saat di-print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          aside { display: none !important; }
          .no-print { display: none !important; }
          body, main { background-color: white !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
          /* Mengatur ukuran kertas menjadi A4 Landscape */
          @page { margin: 10mm; size: A4 landscape; } 
        }
      `}} />

      {/* Tampilan layar diperlebar menjadi max-w-5xl agar proporsional dengan bentuk landscape */}
      <div className="flex flex-col items-center p-8 bg-slate-100 min-h-screen pb-20">
        
        {/* 1. MENU AKSI */}
        <div className="flex gap-4 mb-8 w-full max-w-5xl no-print">
          <Link 
            href="/transaksi" 
            className="bg-white text-slate-700 font-bold py-3 px-6 rounded-xl shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all border border-slate-200"
          >
            <ArrowLeft size={18} /> Kembali
          </Link>
          
          <div className="flex-1"></div>
          
          <button 
            onClick={handleSavePDF} 
            className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-md flex items-center gap-2 hover:bg-emerald-700 transition-all"
          >
            <Download size={18} /> Simpan PDF
          </button>

          <button 
            onClick={() => window.print()} 
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-md flex items-center gap-2 hover:bg-blue-700 transition-all"
          >
            <Printer size={18} /> Print Faktur
          </button>
        </div>

        {/* 2. KERTAS FAKTUR LANDSCAPE */}
        <div className="bg-white w-full max-w-5xl p-12 text-slate-800 shadow-2xl border border-gray-200">
          
          {/* Header Faktur */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">ELITE GEAR</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Spesialis Laptop Second Premium</p>
              <p className="text-sm text-slate-600 mt-2">Jl. Teknologi Cerdas No. 99, Semarang<br/>Jawa Tengah, Indonesia 50123</p>
              <p className="text-sm text-slate-600">Telp: 0812-3456-7890</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">INVOICE</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mt-4 text-left border border-slate-200 p-4 rounded-lg bg-slate-50">
                <span className="text-slate-500 font-medium">No. Faktur:</span>
                <span className="font-bold">INV-20260227-001</span>
                
                <span className="text-slate-500 font-medium">Tanggal:</span>
                <span className="font-bold">27 Februari 2026</span>
                
                <span className="text-slate-500 font-medium">Kasir:</span>
                <span className="font-bold">Admin</span>
              </div>
            </div>
          </div>

          {/* Tabel Barang (Kini memiliki ruang lebih lebar) */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-y-2 border-slate-800 text-slate-800 text-sm">
                <th className="py-3 px-4 text-left font-bold w-12 border-r border-slate-200">No</th>
                <th className="py-3 px-4 text-left font-bold border-r border-slate-200">Deskripsi Barang</th>
                <th className="py-3 px-4 text-center font-bold w-24 border-r border-slate-200">Qty</th>
                <th className="py-3 px-4 text-right font-bold w-48 border-r border-slate-200">Harga Satuan</th>
                <th className="py-3 px-4 text-right font-bold w-48">Subtotal</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-slate-200">
                <td className="py-4 px-4 text-slate-600 border-r border-slate-200">1</td>
                <td className="py-4 px-4 font-semibold text-slate-800 border-r border-slate-200">
                  Asus ROG Zephyrus G14 (2022) <br/>
                  <span className="text-xs text-slate-500 font-normal">SN: 89347293847 • Mulus 98% • Garansi Resmi OFF</span>
                </td>
                <td className="py-4 px-4 text-center text-slate-600 border-r border-slate-200">1</td>
                <td className="py-4 px-4 text-right text-slate-600 border-r border-slate-200">Rp 14.500.000</td>
                <td className="py-4 px-4 text-right font-bold text-slate-800">Rp 14.500.000</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-4 px-4 text-slate-600 border-r border-slate-200">2</td>
                <td className="py-4 px-4 font-semibold text-slate-800 border-r border-slate-200">
                  Mouse Logitech G Pro X Superlight <br/>
                  <span className="text-xs text-slate-500 font-normal">Warna: Hitam • Kondisi: Like New</span>
                </td>
                <td className="py-4 px-4 text-center text-slate-600 border-r border-slate-200">1</td>
                <td className="py-4 px-4 text-right text-slate-600 border-r border-slate-200">Rp 1.500.000</td>
                <td className="py-4 px-4 text-right font-bold text-slate-800">Rp 1.500.000</td>
              </tr>
            </tbody>
          </table>

          {/* Ringkasan Total */}
          <div className="flex justify-end mb-12">
            <div className="w-1/2 md:w-1/3 border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex justify-between py-1 text-sm">
                <span className="text-slate-500">Total Harga:</span>
                <span className="font-bold">Rp 16.000.000</span>
              </div>
              <div className="flex justify-between py-1 text-sm border-b border-slate-200 mb-2 pb-2">
                <span className="text-slate-500">Diskon:</span>
                <span className="font-bold text-red-500">- Rp 0</span>
              </div>
              <div className="flex justify-between py-2 text-xl font-bold border-b-2 border-slate-800 text-blue-700">
                <span>GRAND TOTAL:</span>
                <span>Rp 16.000.000</span>
              </div>
              <div className="flex justify-between py-1 text-sm mt-2">
                <span className="text-slate-500">Dibayar (Tunai):</span>
                <span className="font-bold text-emerald-600">Rp 16.000.000</span>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <span className="text-slate-500">Kembalian:</span>
                <span className="font-bold">Rp 0</span>
              </div>
            </div>
          </div>

          {/* Footer / Syarat Ketentuan & Tanda Tangan */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 text-sm">
            <div className="w-2/3 pr-8">
              <p className="font-bold text-slate-800 mb-2">Syarat & Ketentuan Garansi:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-xs">
                <li>Garansi toko berlaku 30 hari sejak tanggal pembelian pada invoice ini.</li>
                <li>Garansi VOID (batal) apabila segel rusak, terkena air, atau akibat kesalahan pengguna (human error).</li>
                <li>Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan dengan uang tunai.</li>
                <li>Harap bawa invoice fisik/digital ini untuk proses klaim garansi.</li>
              </ul>
            </div>
            <div className="text-center w-56 flex flex-col justify-end">
              <p className="mb-16 text-slate-800">Hormat Kami,</p>
              <div className="border-b-2 border-slate-800 mb-1"></div>
              <p className="font-bold text-slate-800">Admin Elite Gear</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}