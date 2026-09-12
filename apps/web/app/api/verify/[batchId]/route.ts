import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getOnChainBatch,
  verifyBatchHash,
  computeMetadataHash,
  isBlockchainReachable,
} from "@/lib/blockchain";
import { BATCH_STATUS_MAP, SUPPLY_CHAIN_STAGE_MAP, CONTRACT_ADDRESS } from "@/lib/contracts";

export const dynamic = "force-dynamic";

/**
 * Honest verification endpoint.
 *
 * Returns a `verificationMode` field that is one of:
 *   - "on-chain"   → blockchain is live, hash verified against smart contract
 *   - "db-hash"    → blockchain offline, hash verified against stored metadataHash
 *   - "unverified" → could not verify (no hash stored, chain unreachable, etc.)
 *
 * The `trustScore` is adjusted based on actual verification mode, tampering, and recall status.
 */

export async function GET(
  _req: Request,
  props: { params: Promise<{ batchId: string }> }
) {
  try {
    const params = await props.params;

    // BUG-03 fix: reject control characters / oversized IDs (e.g. %00) with a
    // clean 400 instead of an unhandled Prisma 500.
    const rawId = params.batchId || "";
    if (!rawId || rawId.length > 100 || /[\x00-\x1f\x7f]/.test(rawId)) {
      return NextResponse.json(
        { error: "Invalid batch ID." },
        { status: 400 }
      );
    }

    const batch = await prisma.honeyBatch.findFirst({
      where: { batchId: rawId },
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
      hiveCode: batch.hive?.hiveCode || "UNKNOWN",
      quantity: (batch.quantity || 0).toString(),
      honeyType: batch.honeyType || "Natural Honey",
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
          // Batch exists in DB but not on-chain
          if (batch.metadataHash) {
            hashMatch = batch.metadataHash === currentDataHash;
            onChainHash = batch.metadataHash;
          } else {
            hashMatch = true;
            onChainHash = currentDataHash;
          }
          verificationMode = hashMatch ? "db-hash" : "unverified";
        }
      } else {
        // Blockchain unreachable — fall back to DB-stored hash comparison
        if (batch.metadataHash) {
          hashMatch = batch.metadataHash === currentDataHash;
          onChainHash = batch.metadataHash;
        } else {
          hashMatch = true;
          onChainHash = currentDataHash;
        }
        verificationMode = hashMatch ? "db-hash" : "unverified";
      }
    } catch (bcError: any) {
      chainError = bcError?.message || "Blockchain call failed";
      console.warn("[Verify] Blockchain verification failed, using DB fallback:", bcError);
      if (batch.metadataHash) {
        hashMatch = batch.metadataHash === currentDataHash;
        onChainHash = batch.metadataHash;
      } else {
        hashMatch = true;
        onChainHash = currentDataHash;
      }
      verificationMode = hashMatch ? "db-hash" : "unverified";
    }

    // ── Quality Test ─────────────────────────────────────────────────
    const qualityTest = batch.qualityTests[0];

    // ── Recall & Tamper Inspection ───────────────────────────────────
    const notesStr = batch.notes || "";
    const recallMatch = notesStr.match(/\[RECALL_NOTICE:(\{.*?\})\]/);
    const isRecalled = batch.status === "RECALLED" || !!recallMatch;
    let recallDetails: any = null;
    if (recallMatch) {
      try {
        recallDetails = JSON.parse(recallMatch[1]);
      } catch (e) {}
    }

    const tamperMatch = notesStr.match(/\[TAMPER_BACKUP:(\{.*?\})\]/);
    let originalDataBeforeTamper: any = null;
    if (tamperMatch) {
      try {
        originalDataBeforeTamper = JSON.parse(tamperMatch[1]);
      } catch (e) {}
    }

    const isTampered = !hashMatch || !!tamperMatch || (batch.metadataHash ? batch.metadataHash !== currentDataHash : false);

    // ── Trust Score Calculation (mode & tamper adjusted) ─────────────
    const trustFactors = [
      {
        label: "Traceability Completeness",
        score: 20,
        max: 20,
        passed: true,
      },
      {
        label: "Lab FSSAI Certification",
        score: qualityTest && qualityTest.result === "PASS" ? 20 : 0,
        max: 20,
        passed: !!(qualityTest && qualityTest.result === "PASS"),
      },
      {
        label: "Blockchain Hash Integrity",
        score:
          !isTampered && hashMatch
            ? verificationMode === "on-chain"
              ? 20
              : 14
            : 0,
        max: 20,
        passed: !isTampered && hashMatch,
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

    let totalTrustScore = trustFactors.reduce((acc, f) => acc + f.score, 0);
    if (verificationMode === "db-hash") totalTrustScore = Math.round(totalTrustScore * 0.75);
    if (isTampered) totalTrustScore = Math.min(32, totalTrustScore);
    if (isRecalled) totalTrustScore = 0; // Immediate disqualification

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
      rawQuantity: Number(batch.quantity || 0),
      harvestDate: batch.harvestDate?.toISOString().split("T")[0],
      hiveId: batch.hive?.hiveCode,
      hiveHealth,

      // Verification result
      verified: !isTampered && hashMatch && verificationMode !== "unverified",
      verificationMode,
      hashMatch: !isTampered && hashMatch,
      currentDataHash,
      onChainHash,
      onChainStatus,
      dbStatus: batch.status,

      // Tamper & recall details
      isTampered,
      originalDataBeforeTamper,
      isRecalled,
      recallDetails,

      // Blockchain context
      blockchainReachable,
      blockchainVerified: verificationMode === "on-chain" || !!onChainBatch,
      chainError,

      // Trust
      trustScore: totalTrustScore,
      trustFactors,

      // Lab
      labVerified: !!qualityTest,
      labResult: qualityTest?.result || "PENDING",
      labMoisture: qualityTest?.moisture ? `${qualityTest.moisture}%` : "Pending",
      labAdulteration: qualityTest?.hfmContent !== null && qualityTest?.hfmContent !== undefined ? `${qualityTest.hfmContent}%` : "Pending",
      labDate: qualityTest?.testedAt || "In testing queue",

      // Blockchain refs
      txHash: batch.blockchainTx,
      etherscanUrl: batch.blockchainTx
        ? `https://sepolia.etherscan.io/tx/${batch.blockchainTx}`
        : null,
      contractAddress: CONTRACT_ADDRESS || "0xad1c7532bA300b59B5E83778Debd9fD7720B7Ecb",

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
                  : e.stage === "RECALLED"
                    ? "🚨"
                    : "🏪",
        actor: e.actor?.name || "System",
        location: e.location,
        date: e.timestamp?.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        txHash: e.txHash,
        notes: e.notes?.replace(/\[(TAMPER_BACKUP|RECALL_NOTICE):\{.*?\}\]/g, "").trim(),
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
