import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  return NextResponse.next();
});

export const config = { 
  matcher: [
    /* 
     * KUNCI KEAMANAN:
     * Semua folder di bawah ini diwajibkan login.
     * Karena "/" tidak ada di dalam daftar ini, maka "/" (Katalog)
     * bisa diakses secara bebas oleh publik.
     */
    "/dashboard/:path*", 
    "/inventaris/:path*", 
    "/transaksi/:path*",
    "/log/:path*",
    "/pengaturan/:path*"
  ] 
};