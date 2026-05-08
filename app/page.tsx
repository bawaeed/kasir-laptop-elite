import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { 
  Store, LogIn, LayoutDashboard, Search, Laptop, CheckCircle2, 
  MapPin, Clock, ShieldCheck, ChevronDown
} from "lucide-react"; 

const WA_NUMBER = "6281234567890"; // Ganti dengan nomor WhatsApp Toko

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  // 1. Ambil parameter pencarian dan pengurutan
  const params = await searchParams;
  const query = params.q || "";
  const sort = params.sort || "terbaru";

  // 2. Logika Pengurutan (Sorting)
  let orderByClause: any = { date_in: "desc" }; // Default: Terbaru
  if (sort === "termurah") {
    orderByClause = { target_price: "asc" };
  } else if (sort === "termahal") {
    orderByClause = { target_price: "desc" };
  }

  // 3. Ambil data dari database
  const session = await auth(); 
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

          {/* Form Pencarian & Sorting */}
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
            const formattedPrice = displayPrice.toLocaleString('id-ID');
            
            const message = encodeURIComponent(
              `Halo Elite Gear, saya tertarik dengan unit ini:\n\n` +
              `*Unit:* ${item.brand} ${item.model}\n` +
              `*SKU:* ${item.sku_code || '-'}\n` +
              `*Harga:* Rp ${formattedPrice}\n\n` +
              `Apakah unit ini masih tersedia dan bisa lihat fotonya lebih banyak?`
            );
            const waLink = `https://wa.me/${WA_NUMBER}?text=${message}`;

            return (
              <div key={item.id} className="group bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                
                {/* Image */}
                <div className="relative h-64 w-full bg-gray-100 overflow-hidden border-b border-gray-100">
                  {item.image_url ? (
                    <Image 
                      src={item.image_url} alt={`${item.brand} ${item.model}`} fill 
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

                  {/* Accordion Spesifikasi Lengkap (Pure HTML/CSS) */}
                  <div className="bg-blue-50/50 rounded-xl p-4 mb-6 flex-grow border border-blue-100/50">
                    <details className="group/details">
                      <summary className="cursor-pointer text-sm font-bold text-blue-600 hover:text-blue-700 list-none flex justify-between items-center select-none">
                        <span className="flex items-center gap-2"><ShieldCheck size={16}/> Spesifikasi Lengkap</span>
                        <ChevronDown size={16} className="transition-transform duration-300 group-open/details:rotate-180" />
                      </summary>
                      <div className="mt-4 pt-4 border-t border-blue-100 text-gray-600 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                        {item.specs || 'Spesifikasi detail belum diinput oleh teknisi kami.'}
                      </div>
                    </details>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-5">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Harga Nett</p>
                        <span className="text-2xl font-black text-gray-900">
                          Rp {formattedPrice}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                        <CheckCircle2 size={14} className="text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-tight">Ready</span>
                      </div>
                    </div>

                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 rounded-xl shadow-md shadow-green-200 transition-all active:scale-95">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48 2.242 2.242 3.48 5.227 3.48 8.403 0 6.556-5.332 11.888-11.888 11.888-2.003 0-3.96-.503-5.711-1.458l-6.371 1.784zm6.24-4.086l.447.265c1.466.872 3.158 1.334 4.896 1.334 5.177 0 9.388-4.211 9.388-9.388 0-2.509-.977-4.867-2.751-6.641-1.774-1.774-4.132-2.75-6.64-2.75-5.176 0-9.388 4.212-9.388 9.388 0 1.879.554 3.715 1.601 5.316l.29.444-1.101 4.016 4.114-1.152zm10.334-7.043c-.303-.151-1.791-.882-2.068-.982-.277-.1-.478-.151-.68.151-.202.302-.782.982-.958 1.183-.176.201-.351.226-.654.076-.303-.151-1.28-.472-2.438-1.504-.901-.804-1.508-1.797-1.685-2.099-.177-.302-.019-.465.132-.614.136-.134.303-.353.454-.529.151-.177.202-.302.303-.504.101-.202.05-.378-.025-.529-.075-.151-.68-1.638-.932-2.243-.245-.595-.494-.515-.68-.525-.176-.01-.377-.01-.578-.01-.201 0-.528.075-.804.378-.277.302-1.057 1.033-1.057 2.52 0 1.486 1.082 2.923 1.232 3.125.151.202 2.13 3.253 5.16 4.561.721.311 1.282.497 1.719.637.724.23 1.384.197 1.905.119.58-.086 1.791-.73 2.043-1.437.252-.706.252-1.312.176-1.437-.076-.126-.277-.202-.58-.353z"/></svg>
                      Tanya via WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ================= FOOTER (TRUST SIGNALS) ================= */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Kolom 1: Branding */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-2xl mb-4">
              <Laptop size={24} className="text-blue-500" />
              Elite Gear
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Pusat jual beli laptop second premium berkualitas. Semua unit telah melewati proses Quality Control (QC) ketat oleh teknisi berpengalaman.
            </p>
          </div>

          {/* Kolom 2: Kontak & Lokasi */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <span>Jl. Simpang Lima No. 1, Pusat Kota Semarang, Jawa Tengah</span>
              </li>
              <li className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-500 shrink-0"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48 2.242 2.242 3.48 5.227 3.48 8.403 0 6.556-5.332 11.888-11.888 11.888-2.003 0-3.96-.503-5.711-1.458l-6.371 1.784z"/></svg>
                <span>+62 812-3456-7890</span>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Jam Operasional */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Jam Operasional</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-2"><Clock size={16} className="text-blue-500"/> Senin - Jumat</span>
                <span className="font-medium text-white">09:00 - 20:00 WIB</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-2"><Clock size={16} className="text-blue-500"/> Sabtu</span>
                <span className="font-medium text-white">09:00 - 17:00 WIB</span>
              </li>
              <li className="flex items-center justify-between text-red-400">
                <span className="flex items-center gap-2"><Clock size={16} /> Minggu</span>
                <span className="font-medium">Tutup / Libur</span>
              </li>
            </ul>
          </div>

        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Elite Gear. All rights reserved.
        </div>
      </footer>
      
    </div>
  );
}