import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditForm from "./EditForm";

export default async function EditStokPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  const rawLaptop = await prisma.laptop.findUnique({
    where: { id: id }
  });

  if (!rawLaptop) return notFound();

  const laptop = {
    ...rawLaptop,
    date_in: rawLaptop.date_in ? rawLaptop.date_in.toISOString() : null,
    cost_price: Number(rawLaptop.cost_price),
    repair_cost: Number(rawLaptop.repair_cost),
    sparepart_cost: Number(rawLaptop.sparepart_cost),
    target_price: Number(rawLaptop.target_price),
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <EditForm laptop={laptop} />
    </div>
  );
}