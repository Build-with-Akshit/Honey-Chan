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

    const { billHash } = await req.json();
    
    if (!billHash) {
      return NextResponse.json({ error: "billHash is required" }, { status: 400 });
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
    if (batch.status !== "RETAIL") {
      return NextResponse.json(
        { error: `Cannot complete sale. Batch is in ${batch.status} stage, requires RETAIL.` },
        { status: 400 }
      );
    }

    // Since blockchain state is the ultimate truth for the lock, 
    // the frontend will prompt MetaMask to sign the `completeRetailSale` function.
    // Here we just update our off-chain database to reflect the completed status.

    const updatedBatch = await prisma.honeyBatch.update({
      where: { id: batch.id },
      data: {
        status: "COMPLETED",
        // In a real app, we might also store the consumer bill details here
      },
    });

    // Create a supply chain event for the DB
    await prisma.supplyChainEvent.create({
      data: {
        batchId: updatedBatch.id,
        stage: "COMPLETED",
        actorId: user!.id,
        txHash: billHash, // Storing the bill hash as txHash
        notes: "Consumer retail sale completed",
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
