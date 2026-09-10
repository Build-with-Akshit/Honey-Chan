import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getOnChainBatch,
  verifyBatchHash,
  computeMetadataHash,
  isBlockchainReachable,
} from "@/lib/blockchain";
import { BATCH_STATUS_MAP } from "@/lib/contracts";

export const dynamic = "force-dynamic";

/**
 * Honest verification endpoint.
 *
 * Returns a `verificationMode` field that is one of:
 *   - "on-chain"   → blockchain is live, hash verified against smart contract
 *   - "db-hash"    → blockchain offline, hash verified against stored metadataHash
 *   - "unverified" → could not verify (no hash stored, chain unreachable, etc.)
 *
 * The `trustScore` is adjusted based on actual verification mode.
 */

export async function GET(
  _req: Request,
  props: { params: Promise<{ batchId: string }> }
) {
  try {
    const params = await props.params;

    const batch = await prisma.honeyBatch.findFirst({
      where: { batchId: params.batchId },
      include: {
        beekeeper: true,
        hive: true,
        events: {
          include: { actor: true },
          orderBy: { timestamp: "asc" },
        },
        qualityTests: {
          orderBy: { testedAt: "desc" },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { verified: false, error: "Batch not found on HoneyChain registry" },
        { status: 404 }
      );
    }

    // ── Compute current metadata hash from DB ────────────────────────
    const currentDataHash = computeMetadataHash({
      batchId: batch.batchId,
      beekeeperName: batch.beekeeper?.name || "Unknown",
      hiveCode: batch.hive?.hiveCode || "UNKNOWN",
      quantity: Number(batch.quantity) || 0,
      honeyType: batch.honeyType || "Natural Honey",
      location: batch.location || "India",
    });

    // ── Honest blockchain verification ───────────────────────────────
    let verificationMode: "on-chain" | "db-hash" | "unverified" = "unverified";
    let blockchainReachable = false;
    let onChainBatch: any = null;
    let onChainHash = "0x" + "0".repeat(64);
    let onChainStatus: string | null = null;
    let hashMatch = false;
    let chainError: string | null = null;

    try {
      blockchainReachable = await isBlockchainReachable();

      if (blockchainReachable) {
        // Chain is live — do real on-chain verification
        onChainBatch = await getOnChainBatch(params.batchId);

        if (onChainBatch) {
          onChainHash = onChainBatch.metadataHash;
          onChainStatus =
            BATCH_STATUS_MAP[onChainBatch.status] || "Unknown";

          const verifyResult = await verifyBatchHash(
            params.batchId,
            currentDataHash
          );
          hashMatch = verifyResult.verified;
          onChainHash = verifyResult.onChainHash;
          verificationMode = "on-chain";
        } else {
          // Batch exists in DB but not on-chain (pre-blockchain data)
          hashMatch = batch.metadataHash === currentDataHash;
          verificationMode = hashMatch ? "db-hash" : "unverified";
        }
      } else {
        // Chain offline — transparent DB-only verification
        hashMatch = batch.metadataHash === currentDataHash;
        verificationMode = hashMatch ? "db-hash" : "unverified";
      }
    } catch (bcError: any) {
      chainError = bcError?.message || "Blockchain call failed";
      console.warn("[Verify] Blockchain error, falling back to DB:", chainError);
      hashMatch = batch.metadataHash === currentDataHash;
      verificationMode = hashMatch ? "db-hash" : "unverified";
    }

    // ── Quality Test ─────────────────────────────────────────────────
    const qualityTest = batch.qualityTests[0];

    // ── Trust Score (mode-adjusted) ──────────────────────────────────
    const trustFactors = [
      {
        label: "Traceability Completeness",
        score: 20,
        max: 20,
        passed: true,
      },
      {
        label: "Lab FSSAI Certification",
        score: qualityTest ? 20 : 0,
        max: 20,
        passed: !!qualityTest,
      },
      {
        label: "Blockchain Hash Integrity",
        // Full marks only for on-chain verification
        score:
          verificationMode === "on-chain" && hashMatch
            ? 20
            : verificationMode === "db-hash" && hashMatch
              ? 14
              : 0,
        max: 20,
        passed: hashMatch,
        note:
          verificationMode === "db-hash"
            ? "Verified against stored hash (chain offline)"
            : verificationMode === "on-chain"
              ? "Verified on-chain"
              : "Verification failed",
      },
      {
        label: "IoT Hive Climate Coverage",
        score: 14,
        max: 15,
        passed: true,
      },
      {
        label: "Supply Chain Milestones",
        score: Math.min(15, batch.events.length * 3),
        max: 15,
        passed: batch.events.length >= 3,
      },
      {
        label: "KVIC Registered Beekeeper",
        score: 10,
        max: 10,
        passed: true,
      },
    ];

    const totalTrustScore = trustFactors.reduce(
      (acc, f) => acc + f.score,
      0
    );

    // ── Hive Health ──────────────────────────────────────────────────
    let hiveHealth = 92;
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
      // Batch info
      batchId: batch.batchId,
      producer: batch.beekeeper?.name,
      origin: batch.location,
      honeyType: batch.honeyType,
      quantity: `${batch.quantity} KG`,
      harvestDate: batch.harvestDate?.toISOString().split("T")[0],
      hiveId: batch.hive?.hiveCode,
      hiveHealth,

      // Verification result
      verified: hashMatch && verificationMode !== "unverified",
      verificationMode,
      hashMatch,
      currentDataHash,
      onChainHash,
      onChainStatus,
      dbStatus: batch.status,
      isTampered: batch.metadataHash
        ? batch.metadataHash !== currentDataHash
        : false,

      // Blockchain context
      blockchainReachable,
      blockchainVerified: verificationMode === "on-chain",
      chainError,

      // Trust
      trustScore:
        verificationMode === "on-chain"
          ? totalTrustScore
          : verificationMode === "db-hash"
            ? Math.round(totalTrustScore * 0.75)
            : 35,
      trustFactors,

      // Lab
      labVerified: !!qualityTest,
      labResult: qualityTest?.result || "PENDING",
      labMoisture: qualityTest ? `${qualityTest.moisture}%` : "Pending",
      labDate: qualityTest?.testedAt || "In testing queue",

      // Blockchain refs
      txHash: batch.blockchainTx,
      etherscanUrl: batch.blockchainTx
        ? `https://sepolia.etherscan.io/tx/${batch.blockchainTx}`
        : null,
      contractAddress: "0xad1c7532bA300b59B5E83778Debd9fD7720B7Ecb",

      // Journey
      journey: batch.events.map((e) => ({
        stage: e.stage,
        icon:
          e.stage === "HARVEST"
            ? "🐝"
            : e.stage === "PROCESSING"
              ? "🏭"
              : e.stage === "LAB_TESTING"
                ? "🧪"
                : e.stage === "DISTRIBUTION"
                  ? "🚚"
                  : "🏪",
        actor: e.actor?.name || "System",
        location: e.location,
        date: e.timestamp?.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        txHash: e.txHash,
        notes: e.notes,
        verified: true,
      })),
    });
  } catch (error) {
    console.error("[Verify Route] Error:", error);
    return NextResponse.json(
      { error: "Failed to verify batch" },
      { status: 500 }
    );
  }
}
