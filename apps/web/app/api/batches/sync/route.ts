import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { batchId, txHash, metadataHash } = body;

    if (!batchId || !txHash || !metadataHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure the batch belongs to the current user (if beekeeper)
    const batch = await prisma.honeyBatch.findFirst({
      where: {
        batchId,
        ...(user!.role === "BEEKEEPER" ? { beekeeperId: user!.id } : {})
      }
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found or unauthorized" }, { status: 404 });
    }

    // Update the batch with the blockchain tx hash and metadata hash
    const updated = await prisma.honeyBatch.update({
      where: { id: batch.id },
      data: {
        blockchainTx: txHash,
        metadataHash: metadataHash
      }
    });

    return NextResponse.json({ success: true, batch: updated });
  } catch (error: any) {
    console.error("[Sync Batch] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync batch to database" },
      { status: 500 }
    );
  }
}
