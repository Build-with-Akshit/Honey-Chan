import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { batchId: string } }) {
  try {
    const batch = await prisma.honeyBatch.findFirst({
      where: { batchId: params.batchId },
      include: {
        beekeeper: true,
        hive: true,
        events: {
          include: { actor: true },
          orderBy: { timestamp: "asc" }
        },
        qualityTests: {
          orderBy: { testedAt: "desc" }
        }
      }
    });

    if (!batch) {
      return NextResponse.json({
        verified: false,
        error: "Batch not found on Honey Chain registry",
      }, { status: 404 });
    }

    const hashMatch = true; // Placeholder for actual hash integrity check
    const qualityTest = batch.qualityTests[0];

    const trustFactors = [
      { label: "Traceability Completeness", score: 20, max: 20, passed: true },
      { label: "Lab FSSAI Certification", score: qualityTest ? 20 : 0, max: 20, passed: !!qualityTest },
      { label: "Blockchain Hash Integrity", score: hashMatch ? 20 : 0, max: 20, passed: hashMatch },
      { label: "IoT Hive Climate Coverage", score: 14, max: 15, passed: true },
      { label: "Supply Chain Milestones", score: Math.min(15, batch.events.length * 3), max: 15, passed: batch.events.length >= 3 },
      { label: "KVIC Registered Beekeeper", score: 10, max: 10, passed: true },
    ];

    const totalTrustScore = trustFactors.reduce((acc, f) => acc + f.score, 0);

    return NextResponse.json({
      batchId: batch.batchId,
      producer: batch.beekeeper?.name,
      origin: batch.location,
      honeyType: batch.honeyType,
      quantity: `${batch.quantity} KG`,
      harvestDate: batch.harvestDate?.toISOString().split('T')[0],
      hiveId: batch.hive?.hiveCode,
      hiveHealth: 92, // Mock
      trustScore: hashMatch ? totalTrustScore : 35,
      blockchainVerified: true,
      hashMatch,
      onChainHash: batch.metadataHash,
      isTampered: !hashMatch,
      labVerified: !!qualityTest,
      labResult: qualityTest?.result || "PENDING",
      labMoisture: qualityTest ? `${qualityTest.moisture}%` : "Pending",
      labDate: qualityTest?.testedAt || "In testing queue",
      txHash: batch.blockchainTx,
      journey: batch.events.map((e) => ({
        stage: e.stage,
        icon: e.stage === "HARVEST" ? "🐝" : e.stage === "PROCESSING" ? "🏭" : e.stage === "LAB_TESTING" ? "🧪" : e.stage === "DISTRIBUTION" ? "🚚" : "🏪",
        actor: e.actor?.name || "System",
        location: e.location,
        date: e.timestamp?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        txHash: e.txHash,
        notes: e.notes,
        verified: true,
      })),
      trustFactors,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to verify batch" }, { status: 500 });
  }
}
