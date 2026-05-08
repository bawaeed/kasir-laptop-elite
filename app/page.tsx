import { prisma } from "@/lib/db"; // ✅ Pastikan mengarah ke Singleton kita
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { 
  Store, LogIn, LayoutDashboard, Search, Laptop, CheckCircle2, 
  MapPin, Clock, ShieldCheck
} from "lucide-react"; 

// 📱 Nomor WhatsApp Toko Komandan (0 diganti 62 agar format URL valid)
const WA_NUMBER = "6289619093366"; 

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  // 1. Ambil parameter pencarian dan pengurutan (Next.js 15+ Pattern)
  const params = await searchParams;
  const query = params.q || "";
  const sort = params.sort || "terbaru";

  // 2. Logika Pengurutan (Sorting)
  let orderByClause: any = { date_in: "desc" }; 
  if (sort === "termurah") {
    orderByClause = { target_price: "asc" };
  } else if (sort === "termahal") {
    orderByClause = { target_price: "desc" };
  }

  // 3. Ambil data dari database via Prisma
  const session = await auth(); 
  
  // 🛡️ Blok ini akan memicu error jika .env belum benar
  const data = await prisma.laptop.findMany({
    where: {
      status: "Tersedia",
      OR: [
        { brand: { contains: query, mode: 'insensitive' } },
        { model: { contains: query, mode: 'insensitive' } },
        { specs: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: orderByClause,
  });

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* ================= NAVBAR ================= */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-inner">
                <Laptop size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Elite Gear</h1>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Premium Secondhand</p>
              </div>
            </div>

            <div>
              {session ? (
                <Link href="/dashboard" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-600 transition-all group">
                  <LayoutDashboard size={18} className="text-blue-400 group-hover:text-white transition-colors" />
                  Dashboard Staf
                </Link>
              ) : (
                <Link href="/login" className="flex items-center gap-2 bg-white text-gray-600 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-blue-600 transition-all">
                  <LogIn size={18} />
                  Login Karyawan
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ================= HERO & PENCARIAN ================= */}
      <div className="bg-gradient-to-b from-white to-gray-50 pt-16 pb-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
            Temukan Laptop Impian Anda <br className="hidden md:block"/> dengan Harga Terbaik
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto font-medium">
            Katalog unit laptop bekas berkualitas, melewati Quality Control ketat, dan siap pakai.
          </p>

          <form action="/" method="GET" className="max-w-3xl mx-auto flex flex-col md:flex-row gap-3 relative">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input 
                type="text" name="q" defaultValue={query}
                placeholder="Cari merk atau spesifikasi..."
                className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-gray-100 shadow-sm focus:ring-0 focus:border-blue-500 outline-none text-gray-800 font-medium"
              />
            </div>
            
            <div className="flex gap-3">
              <select 
                name="sort" 
                defaultValue={sort}
                className="px-4 py-4 rounded-2xl border-2 border-gray-100 shadow-sm focus:ring-0 focus:border-blue-500 outline-none text-gray-700 font-medium cursor-pointer bg-white"
              >
                <option value="terbaru">Terbaru Masuk</option>
                <option value="termurah">Harga Termurah</option>
                <option value="termahal">Harga Termahal</option>
              </select>
              <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 font-bold shadow-md transition-colors whitespace-nowrap">
                Terapkan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= GRID PRODUK ================= */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Store className="text-blue-600" size={24} />
            {query ? `Hasil Pencarian: "${query}"` : "Etalase Unit Ready"}
          </h3>
          <span className="text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full shadow-sm">
            {data.length} Unit Tersedia
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((item: any) => {
            const displayPrice = item.target_price ? Number(item.target_price) : 0;
            
            const message = encodeURIComponent(
              `Halo Elite Gear, saya tertarik dengan unit ini:\n\n` +
              `*Unit:* ${item.brand} ${item.model}\n` +
              `*SKU:* ${item.sku_code || '-'}\n` +
              `*Harga:* ${formatRupiah(displayPrice)}\n\n` +
              `Apakah unit ini masih tersedia?`
            );
            const waLink = `https://wa.me/${WA_NUMBER}?text=${message}`;

            return (
              <div key={item.id} className="group bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                
                {/* Image Section */}
                <div className="relative h-64 w-full bg-gray-100 overflow-hidden border-b border-gray-100">
                  {item.image_urls && item.image_urls.length > 0 ? (
                    <Image 
                      src={item.image_urls[0]} alt={`${item.brand} ${item.model}`} fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                      <Laptop size={48} className="mb-2 opacity-50" />
                      <p className="text-[10px] font-bold tracking-widest uppercase">No Image</p>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur text-gray-900 text-xs font-black px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">
                      {item.brand || 'Premium'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.model || 'Unnamed Unit'}
                  </h2>

                  {/* 🔄 PERBAIKAN: Spesifikasi Tampil Langsung (Tanpa Accordion/Klik) */}
                  <div className="bg-blue-50/50 rounded-xl p-4 mb-6 flex-grow border border-blue-100/50 flex flex-col">
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-3">
                      <ShieldCheck size={16}/> Spesifikasi Singkat
                    </div>
                    {/* line-clamp-4 digunakan agar jika teksnya terlalu panjang, tampilannya tidak merusak proporsi kartu */}
                    <div className="text-gray-600 text-sm leading-relaxed font-medium whitespace-pre-wrap line-clamp-4">
                      {item.specs || 'Hubungi admin untuk detail spesifikasi.'}
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-5">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Harga Nett</p>
                        <span className="text-2xl font-black text-gray-900">
                          {formatRupiah(displayPrice)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                        <CheckCircle2 size={14} className="text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-tight">Ready</span>
                      </div>
                    </div>

                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 rounded-xl shadow-md shadow-green-200 transition-all active:scale-95">
                      Tanya via WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-2xl mb-4">
              <Laptop size={24} className="text-blue-500" />
              Elite Gear
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pusat jual beli laptop second premium berkualitas. Semua unit telah melewati proses QC ketat.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Lokasi Kami</h4>
            <div className="flex items-start justify-center md:justify-start gap-3 text-sm">
              <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <span>Semarang, Jawa Tengah</span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Buka Setiap Hari</h4>
            <div className="flex items-center justify-center md:justify-start gap-3 text-sm">
              <Clock size={18} className="text-blue-500 shrink-0" />
              <span>09:00 - 20:00 WIB</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Elite Gear. All rights reserved.
        </div>
      </footer>
    </div>
  );
}