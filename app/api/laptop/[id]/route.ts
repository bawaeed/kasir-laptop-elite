import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const laptop = await prisma.laptop.findUnique({
      where: { id: Number(resolvedParams.id) }
    });
    
    if (!laptop) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    
    return NextResponse.json(laptop);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}