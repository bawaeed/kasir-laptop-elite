import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Memulai pembersihan dan pengisian data (Seeding)...");

  // 1. Hapus user lama agar tidak terjadi duplikasi username
  await prisma.user.deleteMany();

  // 2. Enkripsi password Kunci Master
  const hashedPassword = await bcrypt.hash("sapujagat", 10);

  // 3. Masukkan Akun Admin ke Database Lokal
  await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("=========================================");
  console.log("✅ SEEDING SELESAI!");
  console.log("👤 User: admin");
  console.log("🔑 Pass: sapujagat");
  console.log("=========================================");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("🚨 Error saat proses seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });