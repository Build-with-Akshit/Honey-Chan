import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth(["ADMIN"]);
    if (errorResponse) return errorResponse;

    const beekeepers = await prisma.user.findMany({
      where: { role: "BEEKEEPER" },
      include: {
        hives: true,
        batches: { select: { quantity: true } }
      }
    });

    const enriched = beekeepers.map((bk) => {
      const activeHives = bk.hives.filter(h => h.status === "ACTIVE").length;
      const totalHoneyKg = bk.batches.reduce((acc, batch) => acc + Number(batch.quantity || 0), 0);
      
      return {
        id: bk.id,
        name: bk.name,
        cluster: "KVIC Registered Cluster",
        district: "Registered District",
        hives: activeHives,
        batches: bk.batches.length,
        honey: `${totalHoneyKg.toFixed(1)} KG`,
        wallet: bk.walletAddress || "Not connected",
        status: "VERIFIED"
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Admin Beekeepers API Error:", error);
    return NextResponse.json({ error: "Failed to fetch beekeepers" }, { status: 500 });
  }
}
