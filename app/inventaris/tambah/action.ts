"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, catatLog } from "@/lib/db";
import { auth } from "@/auth";

export async function simpanLaptopDb(formData: FormData, imageUrl: string | null) {
  const session = await auth();
  const activeUser = session?.user?.name || "Admin";
  const sku_code = formData.get("sku_code") as string;

  // 1. Cek SKU Duplikat
  const cekSku = await prisma.laptop.findUnique({
    where: { sku_code: sku_code }
  });

  if (cekSku) {
    return { error: "sku_duplikat" }; // Kembalikan error ke pasukan depan
  }

  // 2. Simpan ke Database
  try {
    await prisma.laptop.create({
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
        image_url: imageUrl, // URL dari ImgBB masuk ke sini!
        status: "Tersedia",
      }
    });

    await catatLog(activeUser, "TAMBAH STOK", `Unit: ${formData.get("brand")} ${formData.get("model")} (SKU: ${sku_code})`);
  } catch (error) {
    console.error("Database Error:", error);
    return { error: "database_error" };
  }

  // 3. Refresh halaman & Kembali ke Inventaris
  revalidatePath("/inventaris");
  redirect("/inventaris");
}