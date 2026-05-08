import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // @ts-ignore
    datasources: {
      db: {
        url: process.env.DATABASE_URL as string,
      },
    },
  } as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function catatLog(userId: any, aktivitas: string, keterangan: string) {
  try {
    const idAngka = userId ? parseInt(userId) : null;
    await (prisma as any).logAktifitas.create({
      data: {
        user_id: isNaN(idAngka as number) ? null : idAngka,
        aktivitas,
        keterangan,
        waktu: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Log Error:", error);
  }
}