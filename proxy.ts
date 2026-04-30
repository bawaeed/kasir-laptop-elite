import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * PROXY / MIDDLEWARE NEXT.JS 16
 * Di versi ini, kita menggunakan wrapper 'auth' secara langsung.
 * Ini jauh lebih stabil dan didukung penuh oleh Turbopack.
 */
export default auth((req) => {
  // Jika user sudah sampai sini dan tidak terblokir oleh 'authorized' di bawah,
  // maka izinkan request berlanjut.
  return NextResponse.next();
});

// KONFIGURASI JALUR PENGAMAN
export const config = { 
  /* 
   * Matcher ini akan mengunci folder dashboard, inventaris, dan pengaturan.
   * Halaman /katalog tetap terbuka untuk umum karena TIDAK masuk dalam list ini.
   */
  matcher: [
    "/dashboard/:path*", 
    "/inventaris/:path*", 
    "/pengaturan/:path*"
  ] 
};