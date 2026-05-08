import { defineConfig } from '@prisma/config';
import fs from 'fs';
import path from 'path';

/**
 * LOGIKA PENCARIAN DIRECT URL (KHUSUS SUPABASE)
 * Memastikan CLI Prisma menggunakan jalur Direct (Port 5432) 
 * untuk keperluan Push/Migrate tabel ke Supabase.
 */
let directUrl = process.env.DIRECT_URL;

if (!directUrl) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      // 🔥 MENCARI DIRECT_URL BUKAN DATABASE_URL
      const match = envContent.match(/DIRECT_URL=["']?(.+?)["']?(\s|$)/);
      if (match) {
        directUrl = match[1];
      }
    }
  } catch (e) {
    // Diamkan saja jika gagal membaca file
  }
}

export default defineConfig({
  datasource: {
    /* * Menggunakan URL DIRECT dari .env, atau default ke database lokal 
     * jika variabel tidak ditemukan.
     */
    url: directUrl || "postgresql://postgres:rahasia@localhost:5433/db_kasir_laptop",
  },
});