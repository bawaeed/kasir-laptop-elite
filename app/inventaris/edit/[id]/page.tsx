import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditForm from "./EditForm"; // Kita akan buat file ini di bawah

export default async function EditStokPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Ambil data langsung dari Database (Sangat Cepat!)
  const laptop = await prisma.laptop.findUnique({
    where: { id: id }
  });

  if (!laptop) return notFound();

  // Kirim data ke form "Client"
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <EditForm laptop={laptop} />
    </div>
  );
}