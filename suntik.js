const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = "admin"; // GANTI USERNAME DI SINI
  const password = "admin123"; // GANTI PASSWORD DI SINI

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        // Jika di schema ada field 'role', tambahkan di bawah ini:
        // role: "ADMIN" 
      },
    });
    console.log("✅ BERHASIL: User Admin telah disuntik!");
    console.log("Username:", username);
    console.log("Password:", password);
  } catch (error) {
    console.error("❌ GAGAL:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
