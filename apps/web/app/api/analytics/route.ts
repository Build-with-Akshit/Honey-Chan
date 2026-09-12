import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // PERF-02 fix: aggregate KPIs in SQL instead of loading every batch into memory.
    const [qtyAgg, flaggedCount, hiveCount] = await Promise.all([
      prisma.honeyBatch.aggregate({ _sum: { quantity: true } }),
      prisma.honeyBatch.count({ where: { status: "FLAGGED" } }),
      prisma.hive.count({ where: { status: "ACTIVE" } }),
    ]);
    const totalHoneyKg = Number(qtyAgg._sum.quantity || 0);
    const totalHoneyTons = (totalHoneyKg / 1000).toFixed(1);

    // Regional data (clusters + hives + batch quantities via included relations)
    const clusters = await prisma.cluster.findMany({
      include: {
        hives: {
          include: { honeyBatches: { select: { quantity: true } } }
        }
      }
    });

    // PERF-02 fix: one grouped query for the latest prediction health per hive
    // instead of an awaited findFirst inside the per-hive loop (N+1).
    const predictions = await prisma.aiPrediction.findMany({
      orderBy: { createdAt: "desc" },
      select: { hiveId: true, healthScore: true, createdAt: true },
    });
    const latestHealthByHive = new Map<number, number>();
    for (const p of predictions) {
      if (p.healthScore == null || p.hiveId == null) continue;
      if (!latestHealthByHive.has(p.hiveId)) {
        latestHealthByHive.set(p.hiveId, p.healthScore);
      }
    }

    const regions = clusters.map((c) => {
      let totalProductionKg = 0;
      let activeHivesCount = 0;
      const beekeeperIds = new Set<number>();
      let totalHealth = 0;
      let healthCount = 0;

      for (const hive of c.hives) {
        if (hive.status === "ACTIVE") activeHivesCount++;
        if (hive.beekeeperId) beekeeperIds.add(hive.beekeeperId);

        hive.honeyBatches.forEach((b) => {
          totalProductionKg += Number(b.quantity || 0);
        });

        const health = latestHealthByHive.get(hive.id);
        if (health != null) {
          totalHealth += health;
          healthCount++;
        }
      }

      return {
        state: c.state,
        cluster: c.name,
        beekeepers: beekeeperIds.size > 0 ? beekeeperIds.size : c.totalBeekeepers,
        yieldTons: (totalProductionKg / 1000).toFixed(1),
        compliance: "100% PASS", // Hardcoded for now as compliance isn't tracked in DB directly
        authenticityScore: healthCount > 0 ? (totalHealth / healthCount).toFixed(1) : "95.0"
      };
    });

    return NextResponse.json({
      kpis: {
        totalTraceableHoney: `${totalHoneyTons} Tons`,
        flagged: `${flaggedCount} Flagged`,
        activeHives: hiveCount,
        avgHiveHealth: "88.6%", // Mock or calculate
        premium: "+24.5%"
      },
      regions
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
