import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    if (user!.role === "ADMIN") {
      const beekeepersCount = await prisma.user.count({ where: { role: "BEEKEEPER" } });
      const activeHivesCount = await prisma.hive.count({ where: { status: "ACTIVE" } });
      const batchesCount = await prisma.honeyBatch.count();
      const verifiedBatches = await prisma.honeyBatch.count({ where: { status: "COMPLETED" } });
      const flaggedBatches = await prisma.honeyBatch.count({ where: { status: "FLAGGED" } });

      const allBatches = await prisma.honeyBatch.findMany({
        select: { quantity: true }
      });
      const totalHoneyKg = allBatches.reduce((acc, batch) => acc + Number(batch.quantity || 0), 0);
      const totalHoneyTons = (totalHoneyKg / 1000).toFixed(1);

      return NextResponse.json({
        admin: {
          beekeepers: beekeepersCount,
          activeHives: activeHivesCount,
          batches: batchesCount,
          verifiedBatches,
          flaggedBatches,
          totalHoneyTons
        }
      });
    } else {
      // Supply Chain stats based on role
      const batches = await prisma.honeyBatch.findMany({
        where: {
          OR: [
            { events: { some: { actorId: user!.id } } },
            { beekeeperId: user!.id }
          ]
        },
        include: { events: { orderBy: { timestamp: "asc" } } }
      });

      const totalBatches = batches.length;
      let pendingCount = 0;
      let completedCount = 0;
      let totalKg = 0;
      
      batches.forEach(batch => {
        totalKg += Number(batch.quantity || 0);
        if (batch.status === "COMPLETED") {
          completedCount++;
        }
        
        const lastEvent = batch.events[batch.events.length - 1];
        if (lastEvent?.stage === "PENDING_TRANSFER") {
          pendingCount++;
        }
      });

      return NextResponse.json({
        supplyChain: {
          totalBatches,
          pendingAction: pendingCount,
          completed: completedCount,
          totalKg: totalKg.toFixed(1),
          role: user!.role
        }
      });
    }
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
