"use server";

import { revalidatePath } from "next/cache";
import { prisma, catatLog } from "@/lib/db";
import { auth } from "@/auth";

export async function updateLaptopDb(id: number, formData: FormData, imageUrl: string | null) {
  try {
    const session = await auth();
    const activeUser = session?.user?.name || "Sistem";
    const sku_code = formData.get("sku_code") as string;

    // 1. Validasi SKU: Pastikan tidak dipakai laptop lain (kecuali laptop ini sendiri)
    const duplikat = await prisma.laptop.findFirst({
      where: {
        sku_code: sku_code,
        NOT: { id: id }
      }
    });

    if (duplikat) {
      return { error: "sku_duplikat" };
    }

    // 2. Eksekusi Update ke Database
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
        image_url: imageUrl,
      }
    });

    // 3. Catat Aktivitas ke Log
    await catatLog(activeUser, "EDIT STOK", `Update unit: ${formData.get("brand")} ${formData.get("model")} (SKU: ${sku_code})`);
    
    // 4. Perintahkan Next.js untuk memperbarui cache data
    revalidatePath("/inventaris");
    
    return { success: true };

  } catch (error) {
    console.error("❌ Database Error saat Update:", error);
    return { error: "database_error" };
  }
}