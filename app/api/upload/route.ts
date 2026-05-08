import { NextRequest, NextResponse } from "next/server"; // Perbaikan Import
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada file yang diunggah" },
        { status: 400 }
      );
    }

    // 1. Konversi file ke Buffer untuk diproses Sharp
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Tentukan Direktori Penyimpanan
    const uploadDir = path.join(process.cwd(), "public", "uploads", "laptops");
    
    // Pastikan folder ada (mencegah error folder not found)
    await mkdir(uploadDir, { recursive: true });

    // 3. Buat Nama File Unik (WebP agar ringan)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = `laptop-${uniqueSuffix}.webp`;
    const filePath = path.join(uploadDir, fileName);

    // 4. Optimasi Gambar dengan Sharp
    // Mengecilkan ukuran, mengubah format ke WebP, dan kompresi kualitas
    await sharp(buffer)
      .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(filePath);

    // 5. Berikan URL relatif yang akan disimpan ke Database Prisma
    const fileUrl = `/uploads/laptops/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: fileUrl 
    });

  } catch (error: any) {
    console.error("CRITICAL ERROR UPLOAD:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan file secara lokal: " + error.message },
      { status: 500 }
    );
  }
}