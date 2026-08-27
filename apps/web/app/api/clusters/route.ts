import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clusters = await prisma.cluster.findMany({
      include: {
        hives: {
          include: {
            honeyBatches: { select: { quantity: true } },
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedClusters = await Promise.all(clusters.map(async (cluster) => {
      let totalProductionKg = 0;
      let totalHealth = 0;
      let healthCount = 0;
      let totalBatches = 0;
      let activeHivesCount = 0;
      const beekeeperIds = new Set<number>();

      for (const hive of cluster.hives) {
        if (hive.status === "ACTIVE") activeHivesCount++;
        if (hive.beekeeperId) beekeeperIds.add(hive.beekeeperId);

        hive.honeyBatches.forEach(batch => {
          totalProductionKg += Number(batch.quantity || 0);
          totalBatches++;
        });
        
        // Fetch latest prediction separately to avoid LATERAL JOIN bug
        const latestPrediction = await prisma.aiPrediction.findFirst({
          where: { hiveId: hive.id },
          orderBy: { createdAt: 'desc' }
        });

        if (latestPrediction && latestPrediction.healthScore) {
          totalHealth += latestPrediction.healthScore;
          healthCount++;
        }
      }

      const avgHealth = healthCount > 0 ? Math.round(totalHealth / healthCount) : 85; // default 85% for demo
      const totalProductionTons = (totalProductionKg / 1000).toFixed(1);

      return {
        ...cluster,
        avgHealth,
        totalProductionTons,
        batches: totalBatches,
        totalBeekeepers: beekeeperIds.size > 0 ? beekeeperIds.size : cluster.totalBeekeepers, // override with real data if hives exist
        totalHives: activeHivesCount > 0 ? activeHivesCount : cluster.totalHives // override with real data
      };
    }));

    return NextResponse.json(enrichedClusters);
  } catch (error) {
    console.error("Failed to fetch clusters:", error);
    return NextResponse.json({ error: "Failed to fetch clusters" }, { status: 500 });
  }
}

