"use server";

import { revalidatePath } from "next/cache";
import { prisma, catatLog } from "@/lib/db";
import { auth } from "@/auth";

export async function updateLaptopDb(id: number, formData: FormData, imageUrl: string | null) {
  try {
    const session = await auth();
    const activeUser = session?.user?.name || "Sistem";
    const sku_code = formData.get("sku_code") as string;

    // 1. Cek Duplikat SKU (kecuali milik laptop ini sendiri)
    const duplikat = await prisma.laptop.findFirst({
      where: {
        sku_code: sku_code,
        NOT: { id: id }
      }
    });

    if (duplikat) {
      return { error: "sku_duplikat" };
    }

    // 2. Eksekusi Update
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
        image_url: imageUrl, // Gunakan URL ImgBB baru (atau yang lama jika tidak ganti)
      }
    });

    await catatLog(activeUser, "EDIT STOK", `Mengubah data unit: ${formData.get("brand")} (SKU: ${sku_code})`);
    
    revalidatePath("/inventaris");
    return { success: true };

  } catch (error) {
    console.error("❌ Database Error:", error);
    return { error: "database_error" };
  }
}