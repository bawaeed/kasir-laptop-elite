"use server";

import { revalidatePath } from "next/cache";
import { prisma, catatLog } from "@/lib/db";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function updateLaptopDb(id: number, formData: FormData) {
  try {
    const session = await auth();
    const activeUser = session?.user?.id ? Number(session.user.id) : null;
    const activeUserName = session?.user?.name || "Sistem";
    const sku_code = formData.get("sku_code") as string;

    // 1. Validasi SKU
    const duplikat = await prisma.laptop.findFirst({
      where: {
        sku_code: sku_code,
        NOT: { id: id }
      }
    });

    if (duplikat) {
      return { error: "sku_duplikat" };
    }

    // 2. MANAJEMEN MULTI-GAMBAR
    // Ambil gambar lama yang masih dipertahankan dari form
    const existingImages = formData.getAll("existing_images") as string[];
    
    // Ambil file gambar baru yang diupload
    const newImageFiles = formData.getAll("new_images") as File[];
    const uploadedNewUrls: string[] = [];

    // Proses penyimpanan gambar baru ke hard disk server
    if (newImageFiles && newImageFiles.length > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (dirError) {}

      await Promise.all(
        newImageFiles.map(async (file, index) => {
          if (file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            const uniqueSuffix = `${Date.now()}-${index}-${Math.round(Math.random() * 1E9)}`;
            const originalExt = file.name.split('.').pop() || "jpg";
            const filename = `laptop-edit-${uniqueSuffix}.${originalExt}`;
            
            const filepath = path.join(uploadDir, filename);
            await writeFile(filepath, buffer);
            
            uploadedNewUrls.push(`/uploads/${filename}`);
          }
        })
      );
    }

    // Gabungkan gambar lama yang tersisa dengan gambar baru yang sukses diupload
    const finalImageUrls = [...existingImages, ...uploadedNewUrls];

    // 3. Eksekusi Update ke Database
    await prisma.laptop.update({
      where: { id: id },
      data: {
        date_in: new Date(formData.get("date_in") as string),
        sku_code: sku_code,
        brand: formData.get("brand") as string,
        model: formData.get("model") as string,
        specs: formData.get("specs") as string,
        condition_notes: formData.get("condition_notes") as string,
        cost_price: parseFloat(formData.get("cost_price") as string) || 0,
        repair_cost: parseFloat(formData.get("repair_cost") as string) || 0,
        sparepart_cost: parseFloat(formData.get("sparepart_cost") as string) || 0,
        target_price: parseFloat(formData.get("target_price") as string) || 0,
        
        // 👈 Update Array gambar ke DB
        image_urls: finalImageUrls, 
      }
    });

    // 4. Catat Aktivitas ke Log
    if (activeUser) {
      await catatLog(activeUser, "EDIT_LAPTOP", `Update unit: ${formData.get("brand")} ${formData.get("model")} (SKU: ${sku_code})`);
    }
    
    // 5. Perintahkan Next.js untuk memperbarui cache
    revalidatePath("/inventaris");
    revalidatePath(`/inventaris/${id}`);
    
    return { success: true };

  } catch (error) {
    console.error("❌ Database/File Error saat Update:", error);
    return { error: "database_error" };
  }
}