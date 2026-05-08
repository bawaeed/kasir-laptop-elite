"use server";

import { prisma, catatLog } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function simpanLaptopDb(formData: FormData) {
  const session = await auth();

  // 1. Ambil Data Teks dari FormData
  const sku_code = formData.get("sku_code") as string;
  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const specs = formData.get("specs") as string;
  const condition_notes = formData.get("condition_notes") as string;
  const status = formData.get("status") as string;

  const cost_price = formData.get("cost_price");
  const target_price = formData.get("target_price");
  const repair_cost = formData.get("repair_cost");
  const sparepart_cost = formData.get("sparepart_cost");

  // 📸 TANGKAP ARRAY FILE GAMBAR
  // Menggunakan getAll("images") karena dari UI kita mengirim banyak file dengan key yang sama
  const imageFiles = formData.getAll("images") as File[];
  const imageUrls: string[] = []; // Wadah untuk menampung semua alamat URL

  // 2. Validasi Sederhana
  if (!sku_code || !brand || !model) {
    return { error: "Data wajib (SKU, Brand, Model) harus diisi!" };
  }

  try {
    // 3. PROSES UPLOAD MULTI GAMBAR (Jika ada gambar yang diunggah)
    if (imageFiles && imageFiles.length > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads");

      // Pastikan foldernya ada, jika belum otomatis dibuat
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (dirError) {
        // Abaikan error jika folder sudah ada
      }

      // Gunakan Promise.all agar proses simpan gambar ke hard disk berjalan paralel & ngebut
      await Promise.all(
        imageFiles.map(async (file, index) => {
          if (file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Buat nama file unik (ditambahkan index agar tidak ada bentrok nama di milidetik yang sama)
            const uniqueSuffix = `${Date.now()}-${index}-${Math.round(Math.random() * 1E9)}`;
            const originalExt = file.name.split('.').pop() || "jpg";
            const filename = `laptop-${uniqueSuffix}.${originalExt}`;

            // Simpan file ke hard disk
            const filepath = path.join(uploadDir, filename);
            await writeFile(filepath, buffer);

            // Masukkan URL ke dalam array
            imageUrls.push(`/uploads/${filename}`);
          }
        })
      );
    }

    // 4. Simpan Semua Data ke Database Lokal
    const laptopBaru = await prisma.laptop.create({
      data: {
        sku_code,
        brand,
        model,
        specs,
        condition_notes,
        status: status || "Tersedia",
        
        image_urls: imageUrls, // 👈 Array dari kumpulan alamat gambar mendarat di sini
        
        cost_price: cost_price ? parseFloat(cost_price.toString()) : 0,
        target_price: target_price ? parseFloat(target_price.toString()) : 0,
        repair_cost: repair_cost ? parseFloat(repair_cost.toString()) : 0,
        sparepart_cost: sparepart_cost ? parseFloat(sparepart_cost.toString()) : 0,
      },
    });

    // 5. Catat Log Aktivitas
    if (session?.user?.id) {
      await catatLog(
        Number(session.user.id), 
        "TAMBAH_LAPTOP", 
        `Menambah unit: ${brand} ${model} (${sku_code}) dengan ${imageUrls.length} foto`
      );
    }

    // 6. Segarkan Data dan UI
    revalidatePath("/inventaris");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error: any) {
    console.error("🚨 [DB_ERROR]:", error);
    
    if (error.code === 'P2002') {
      return { error: "Kode SKU/Serial sudah terdaftar! Gunakan kode lain." };
    }
    
    return { error: "Gagal menyimpan data atau gambar ke server." };
  }
}