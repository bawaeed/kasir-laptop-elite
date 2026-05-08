import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "../auth.config";
import { prisma } from "@/lib/db"; // Mengambil Prisma Singleton dari lib/db.ts

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true, // KRUSIAL: Agar Vercel bisa mengenali domain secara otomatis 🛡️
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const { username, password } = credentials;

        try {
          // 📡 Mencari user di Supabase via Prisma
          const user = await prisma.user.findUnique({
            where: { username: username as string }
          });

          // 🔍 Validasi User & Password
          if (user) {
            const isValid = await bcrypt.compare(password as string, user.password);
            
            if (isValid) {
              return { 
                id: user.id.toString(), 
                name: user.username, 
                role: user.role
              };
            }
          }
        } catch (error) {
          // Memberikan laporan intelijen jika koneksi database terputus
          console.error("🚨 DATABASE ERROR PADA LOGIN:", error);
        }
        
        return null; // Login gagal
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role; // Menyimpan role ke dalam token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role; // Menyimpan role ke session browser
      }
      return session;
    }
  }
});