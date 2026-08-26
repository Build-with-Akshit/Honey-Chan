import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await requireAuth(["PROCESSOR", "LAB", "DISTRIBUTOR", "RETAILER", "ADMIN"]);
    if (errorResponse) return errorResponse;

    const params = await props.params;
    const data = await req.json();
    const { stage, location, notes, txHash } = data;
    
    // In our system, params.id could be the DB ID (int) or the batchId (string)
    const batchId = params.id;

    const batch = await prisma.honeyBatch.findFirst({
      where: {
        OR: [
          { batchId: batchId },
          { id: !isNaN(Number(batchId)) ? Number(batchId) : undefined }
        ]
      }
    });

    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    const generatedTx = txHash || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    
    const stageMap: Record<string, string> = {
      PROCESSING: "PROCESSING",
      LAB_TESTING: "QUALITY_TESTED",
      DISTRIBUTION: "DISTRIBUTED",
      RETAIL: "RETAIL",
    };

    if (stageMap[stage]) {
      await prisma.honeyBatch.update({
        where: { id: batch.id },
        data: { status: stageMap[stage] }
      });
    }

    const newEvent = await prisma.supplyChainEvent.create({
      data: {
        batchId: batch.id,
        stage,
        location: location || "India",
        notes: notes || `Transferred to ${stage}`,
        txHash: generatedTx,
        actorId: user!.id, // Use authenticated user instead of hardcoded ID
      }
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to transfer batch" }, { status: 500 });
  }
}
