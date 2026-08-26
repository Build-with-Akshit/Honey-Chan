import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clusters = await prisma.cluster.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clusters);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clusters" }, { status: 500 });
  }
}
