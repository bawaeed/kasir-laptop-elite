import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "../auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true, // INI WAJIB UNTUK DOCKER & CASAOS! 🛡️
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials;

        try {
          const result = await pool.query('SELECT * FROM "Users" WHERE username = $1', [username]);
          const user = result.rows[0];

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
          console.error("🚨 DATABASE ERROR:", error);
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role; 
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  }
});