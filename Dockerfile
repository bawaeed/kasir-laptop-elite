# Tahap 1: Instalasi dependencies
FROM node:20-alpine AS deps
# Tambahkan openssl karena Prisma membutuhkannya di lingkungan Alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Tahap 2: Building aplikasi
FROM node:20-alpine AS builder
# Tambahkan juga openssl di sini untuk proses generate
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# BANGUN MESIN PRISMA SEBELUM BUILD NEXT.JS!
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Tahap 3: Runner (Produksi)
FROM node:20-alpine AS runner
# Tambahkan openssl di runner agar koneksi database stabil
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# Folder standalone hasil build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]