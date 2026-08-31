import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { user, errorResponse } = await requireAuth(["RETAILER", "ADMIN"]);
    if (errorResponse) return errorResponse;

    const { billHash, billNumber, buyerName, location, txHash } = await req.json();

    if (!billHash && !billNumber) {
      return NextResponse.json({ error: "billHash or billNumber is required" }, { status: 400 });
    }

    const batchId = params.id;

    const batch = await prisma.honeyBatch.findFirst({
      where: {
        OR: [
          { batchId: batchId },
          { id: !isNaN(Number(batchId)) ? Number(batchId) : undefined }
        ]
      }
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Ensure the batch is in RETAIL stage
    if (batch.status !== "RETAIL" && batch.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Cannot complete sale. Batch is in ${batch.status} stage, requires RETAIL.` },
        { status: 400 }
      );
    }

    const customerNote = buyerName
      ? `🛍️ Sold to: ${buyerName} • Invoice: #${billNumber || "N/A"} • Verified Retail Sale`
      : `🛍️ Consumer Retail Sale • Invoice: #${billNumber || "N/A"}`;

    const updatedBatch = await prisma.honeyBatch.update({
      where: { id: batch.id },
      data: {
        status: "COMPLETED",
        blockchainTx: txHash || batch.blockchainTx,
      },
    });

    // Create a supply chain event for the DB
    await prisma.supplyChainEvent.create({
      data: {
        batchId: updatedBatch.id,
        stage: "COMPLETED",
        actorId: user!.id,
        location: location || "Retail Counter",
        txHash: txHash || billHash,
        notes: customerNote,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Batch sale completed and locked successfully.",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error("[Complete Sale Route] Error:", error);
    return NextResponse.json({ error: "Failed to complete sale" }, { status: 500 });
  }
}
