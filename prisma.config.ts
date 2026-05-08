import { defineConfig } from '@prisma/config';

/**
 * KONFIGURASI PRISMA UNIVERSAL
 * Mengutamakan DIRECT_URL dari Environment Variables (Vercel)
 * Tetap mendukung fallback ke database lokal jika tidak ditemukan.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    /* * process.env.DIRECT_URL akan otomatis terdeteksi di Vercel 
     * karena kita sudah memasukkannya di pengaturan Environment Variables.
     */
    url: process.env.DIRECT_URL || "postgresql://postgres:rahasia@localhost:5433/db_kasir_laptop",
  },
});