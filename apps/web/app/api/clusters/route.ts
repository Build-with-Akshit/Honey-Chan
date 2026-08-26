import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clusters = await prisma.cluster.findMany({
      include: {
        hives: {
          include: {
            honeyBatches: { select: { quantity: true } },
            aiPredictions: { select: { healthScore: true }, orderBy: { createdAt: 'desc' }, take: 1 }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedClusters = clusters.map(cluster => {
      let totalProductionKg = 0;
      let totalHealth = 0;
      let healthCount = 0;
      let totalBatches = 0;

      cluster.hives.forEach(hive => {
        hive.honeyBatches.forEach(batch => {
          totalProductionKg += Number(batch.quantity || 0);
          totalBatches++;
        });
        
        if (hive.aiPredictions && hive.aiPredictions.length > 0 && hive.aiPredictions[0].healthScore) {
          totalHealth += hive.aiPredictions[0].healthScore;
          healthCount++;
        }
      });

      const avgHealth = healthCount > 0 ? Math.round(totalHealth / healthCount) : 85; // default 85% for demo
      const totalProductionTons = (totalProductionKg / 1000).toFixed(1);

      return {
        ...cluster,
        avgHealth,
        totalProductionTons,
        batches: totalBatches
      };
    });

    return NextResponse.json(enrichedClusters);
  } catch (error) {
    console.error("Failed to fetch clusters:", error);
    return NextResponse.json({ error: "Failed to fetch clusters" }, { status: 500 });
  }
}
