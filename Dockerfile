# Tahap 1: Mengumpulkan bahan (Install Dependencies)
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Tahap 2: Memasak kode (Build Aplikasi mode Standalone)
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Matikan pengumpulan data Google agar proses lebih cepat
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Tahap 3: Penyajian (Versi Produksi Super Ringan)
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Salin file publik dan hasil masakan standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Bikin folder uploads kosong dan atur izinnya agar bisa disuntik "Flashdisk" CasaOS
RUN mkdir -p /app/public/uploads && chown -R node:node /app/public/uploads

# Keamanan tambahan: Jalankan aplikasi bukan sebagai admin root
USER node

# Buka gerbang port 3000
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Perintah menjalankan aplikasi
CMD ["node", "server.js"]