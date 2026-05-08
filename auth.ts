import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma, catatLog } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("-----------------------------------------");
        console.log("🚀 [AUTH_PROCESS] Username:", credentials?.username);

        // 🛡️ 1. KUNCI MASTER DARURAT (Bypass DB)
        if (credentials?.username === "admin" && credentials?.password === "sapujagat") {
          console.log("🔓 [AUTH] KUNCI MASTER TERDETEKSI! Langsung masuk...");
          return { id: "999", name: "Administrator", role: "admin" };
        }

        // 🔍 2. PROSES NORMAL (Cek Database)
        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username as string },
          });

          if (!user) {
            console.log("❌ [AUTH] User tidak ditemukan di DB Lokal.");
            return null;
          }

          const isMatch = await bcrypt.compare(credentials.password as string, user.password);
          
          if (isMatch) {
            console.log("✅ [AUTH] Password DB Cocok!");
            await catatLog(user.id, "LOGIN_SUKSES", "Login via database lokal");
            return { id: user.id.toString(), name: user.username, role: user.role };
          }

          console.log("❌ [AUTH] Password DB Salah.");
          return null;
        } catch (err) {
          console.error("🚨 [AUTH] Database Error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});