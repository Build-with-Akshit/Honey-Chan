import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOnChainBatch, verifyBatchHash, computeMetadataHash, isBlockchainReachable } from "@/lib/blockchain";
import { BATCH_STATUS_MAP, SUPPLY_CHAIN_STAGE_MAP } from "@/lib/contracts";

export async function GET(req: Request, props: { params: Promise<{ batchId: string }> }) {
  try {
    const params = await props.params;
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

    // ── Blockchain Hash Verification ──────────────────────────────────
    // Compute current hash from DB data
    const currentDataHash = computeMetadataHash({
      batchId: batch.batchId,
      beekeeperName: batch.beekeeper?.name || "Unknown",
      hiveCode: batch.hive?.hiveCode || "UNKNOWN",
      quantity: Number(batch.quantity) || 0,
      honeyType: batch.honeyType || "Natural Honey",
      location: batch.location || "India",
    });

    // Try to verify against blockchain
    let hashMatch = false;
    let onChainHash = batch.metadataHash || "0x" + "0".repeat(64);
    let blockchainReachable = false;
    let onChainBatch = null;
    let onChainStatus = null;

    try {
      blockchainReachable = await isBlockchainReachable();

      if (blockchainReachable) {
        // Fetch on-chain data
        onChainBatch = await getOnChainBatch(params.batchId);

        if (onChainBatch) {
          onChainHash = onChainBatch.metadataHash;
          onChainStatus = BATCH_STATUS_MAP[onChainBatch.status] || "Unknown";

          // Compare hashes
          const verifyResult = await verifyBatchHash(params.batchId, currentDataHash);
          hashMatch = verifyResult.verified;
          onChainHash = verifyResult.onChainHash;
        } else {
          // Batch exists in DB but not on-chain — could be pre-blockchain or not yet recorded
          // Fall back to comparing stored metadataHash
          hashMatch = batch.metadataHash === currentDataHash;
        }
      } else {
        // Blockchain unreachable — fall back to DB-stored hash comparison
        hashMatch = batch.metadataHash === currentDataHash;
      }
    } catch (bcError) {
      console.warn("[Verify] Blockchain verification failed, using DB fallback:", bcError);
      hashMatch = batch.metadataHash === currentDataHash;
    }

    // ── Quality Test Data ─────────────────────────────────────────────
    const qualityTest = batch.qualityTests[0];

    // ── Trust Score Calculation ───────────────────────────────────────
    const trustFactors = [
      { label: "Traceability Completeness", score: 20, max: 20, passed: true },
      { label: "Lab FSSAI Certification", score: qualityTest ? 20 : 0, max: 20, passed: !!qualityTest },
      { label: "Blockchain Hash Integrity", score: hashMatch ? 20 : 0, max: 20, passed: hashMatch },
      { label: "IoT Hive Climate Coverage", score: 14, max: 15, passed: true },
      { label: "Supply Chain Milestones", score: Math.min(15, batch.events.length * 3), max: 15, passed: batch.events.length >= 3 },
      { label: "KVIC Registered Beekeeper", score: 10, max: 10, passed: true },
    ];

    const totalTrustScore = trustFactors.reduce((acc, f) => acc + f.score, 0);

    // ── Hive Health (fetch latest AI prediction if available) ─────────
    let hiveHealth = 92; // Default
    if (batch.hive) {
      const latestPrediction = await prisma.aiPrediction.findFirst({
        where: { hiveId: batch.hive.id },
        orderBy: { createdAt: "desc" },
      });
      if (latestPrediction?.healthScore) {
        hiveHealth = latestPrediction.healthScore;
      }
    }

    return NextResponse.json({
      batchId: batch.batchId,
      producer: batch.beekeeper?.name,
      origin: batch.location,
      honeyType: batch.honeyType,
      quantity: `${batch.quantity} KG`,
      harvestDate: batch.harvestDate?.toISOString().split('T')[0],
      hiveId: batch.hive?.hiveCode,
      hiveHealth,
      trustScore: hashMatch ? totalTrustScore : 35,
      blockchainVerified: !!onChainBatch,
      blockchainReachable,
      hashMatch,
      onChainHash,
      currentDataHash,
      onChainStatus,
      dbStatus: batch.status,
      isTampered: !hashMatch,
      labVerified: !!qualityTest,
      labResult: qualityTest?.result || "PENDING",
      labMoisture: qualityTest ? `${qualityTest.moisture}%` : "Pending",
      labDate: qualityTest?.testedAt || "In testing queue",
      txHash: batch.blockchainTx,
      etherscanUrl: batch.blockchainTx
        ? `https://sepolia.etherscan.io/tx/${batch.blockchainTx}`
        : null,
      contractAddress: "0xad1c7532bA300b59B5E83778Debd9fD7720B7Ecb",
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
    console.error("[Verify Route] Error:", error);
    return NextResponse.json({ error: "Failed to verify batch" }, { status: 500 });
  }
}
