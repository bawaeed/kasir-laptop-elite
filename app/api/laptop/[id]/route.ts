import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const laptop = await prisma.laptop.findUnique({
    where: { id: Number(resolvedParams.id) }
  });
  return NextResponse.json(laptop);
}