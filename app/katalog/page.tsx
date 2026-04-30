import { prisma } from "@/lib/db";
import Image from "next/image";

/**
 * HALAMAN KATALOG PUBLIK - VERSI FINAL
 * Menggunakan casting pada 'orderBy' untuk mengatasi lag sinkronisasi pada Prisma 7
 */
export default async function KatalogPublik() {
  // Kita paksa Prisma untuk menerima 'date_in' meskipun IntelliSense masih merah
  const data = await prisma.laptop.findMany({
    where: { 
      status: "Tersedia" 
    },
    orderBy: { 
      // Kita cast ke 'any' agar VS Code berhenti memprotes 'date_in'
      date_in: "desc" 
    } as any
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Katalog Unit Terkini
          </h1>
          <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-6 text-lg max-w-2xl mx-auto">
            Daftar unit laptop bekas berkualitas yang siap dikirim hari ini.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {data.map((item: any) => {
            const displayPrice = item.target_price ? Number(item.target_price) : 0;
            
            return (
              <div key={item.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col">
                {/* BAGIAN FOTO */}
                <div className="relative h-72 w-full bg-gray-100 overflow-hidden">
                  {item.image_url ? (
                    <Image 
                      src={item.image_url} 
                      alt={`${item.brand} ${item.model}`} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                      <span className="text-6xl">💻</span>
                      <p className="text-[10px] font-bold mt-4 tracking-widest text-gray-400">GAMBAR TIDAK ADA</p>
                    </div>
                  )}
                  <div className="absolute top-5 left-5">
                    <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-tighter">
                      {item.brand || 'Premium'}
                    </span>
                  </div>
                </div>
                
                {/* BAGIAN INFO */}
                <div className="p-8 flex-grow flex flex-col">
                  <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                    {item.model || 'Unnamed Unit'}
                  </h2>

                  <div className="bg-blue-50/50 rounded-2xl p-4 mb-8 flex-grow">
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 font-medium italic">
                      "{item.specs || 'Spesifikasi sedang dalam tahap verifikasi teknisi.'}"
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                    <div>
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Harga Nett</p>
                      <span className="text-3xl font-black text-gray-900">
                        Rp {displayPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase">Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER JIKA KOSONG */}
        {data.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[40px] border-4 border-dashed border-gray-100">
            <p className="text-gray-300 text-2xl font-bold italic tracking-tighter">Belum ada unit yang dipajang di etalase...</p>
          </div>
        )}
      </div>
    </div>
  );
}