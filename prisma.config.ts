// File: prisma.config.ts
import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  datasource: {
    // 🚀 GANTI DARI DATABASE_URL KE DIRECT_URL UNTUK PUSH
    url: process.env.DIRECT_URL, 
  },
});