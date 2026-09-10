import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const batchId = decodeURIComponent(params.id);

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {}

    const action = body.action || "recall"; // "recall" | "restore"
    const reason = body.reason || "Excessive moisture and synthetic C4 sugar adulteration confirmed in post-market surveillance.";
    const authority = body.authority || "Central Food Safety Authority / KVIC Quality Directorate";

    const batch = await prisma.honeyBatch.findFirst({
      where: { batchId },
      include: { beekeeper: true },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const notesStr = batch.notes || "";
    const recallMatch = notesStr.match(/\[RECALL_NOTICE:(\{.*?\})\]/);

    if (action === "restore") {
      const cleanedNotes = notesStr.replace(/\[RECALL_NOTICE:\{.*?\}\]\s*/g, "").trim();
      const updated = await prisma.honeyBatch.update({
        where: { id: batch.id },
        data: {
          status: "RETAIL", // restored to distribution/retail
          notes: cleanedNotes,
        },
      });

      // Log clearance event
      await prisma.supplyChainEvent.create({
        data: {
          batchId: batch.id,
          actorId: batch.beekeeperId,
          stage: "RETAIL",
          location: "Regional Food Safety Laboratory",
          notes: `Batch recall officially revoked following secondary lab clearance. Batch re-certified for distribution.`,
        },
      });

      return NextResponse.json({
        success: true,
        action: "restored",
        message: "Batch recall status successfully revoked. Batch is restored.",
        batch: updated,
      });
    }

    // Default: RECALL
    const recallPayload = {
      reason,
      authority,
      recalledAt: new Date().toISOString(),
    };

    const newNotes = `${notesStr}\n[RECALL_NOTICE:${JSON.stringify(recallPayload)}]`.trim();

    const updated = await prisma.honeyBatch.update({
      where: { id: batch.id },
      data: {
        status: "RECALLED",
        notes: newNotes,
      },
    });

    // Record formal Recall Supply Chain Event
    await prisma.supplyChainEvent.create({
      data: {
        batchId: batch.id,
        actorId: batch.beekeeperId,
        stage: "RECALLED",
        location: "National Food Safety Enforcement Office",
        notes: `EMERGENCY BATCH RECALL ISSUED: ${reason} (Authorized by: ${authority})`,
      },
    });

    return NextResponse.json({
      success: true,
      action: "recalled",
      message: "Batch has been marked as RECALLED across the national registry.",
      recallDetails: recallPayload,
      batch: updated,
    });
  } catch (error: any) {
    console.error("[Recall API Route] Error:", error);
    return NextResponse.json({ error: "Failed to process batch recall" }, { status: 500 });
  }
}
