import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // 1. Cek status login (auth?.user akan berisi data jika sudah login)
      const isLoggedIn = !!auth?.user;
      
      // 2. Tentukan proteksi jalur
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnPengaturan = nextUrl.pathname.startsWith("/pengaturan");

      // LOGIKA PENJAGA GERBANG
      if (isOnDashboard || isOnPengaturan) {
        if (isLoggedIn) return true; // Izinkan jika sudah login
        return false; // Otomatis redirect ke /login jika belum login
      }
      
      // Jika user sudah login dan mencoba akses /login, lempar ke dashboard
      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Diisi di file auth.ts agar tidak bentrok dengan Edge Runtime
} satisfies NextAuthConfig; // 👈 KUNCI UTAMA: Menghilangkan error merah