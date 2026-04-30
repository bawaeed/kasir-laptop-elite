import { defineConfig } from '@prisma/config';
import fs from 'fs';
import path from 'path';

/**
 * LOGIKA PENCARIAN DATABASE URL
 * Memastikan CLI Prisma bisa menemukan alamat database di Windows 
 * meskipun environment variable tidak terdeteksi otomatis.
 */
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/DATABASE_URL=["']?(.+?)["']?(\s|$)/);
      if (match) {
        dbUrl = match[1];
      }
    }
  } catch (e) {
    // Diamkan saja jika gagal membaca file
  }
}

export default defineConfig({
  datasource: {
    /* 
     * Menggunakan URL dari .env, atau default ke database lokal Docker 
     * jika variabel tidak ditemukan.
     */
    url: dbUrl || "postgresql://postgres:rahasia@localhost:5433/db_kasir_laptop",
  },
});