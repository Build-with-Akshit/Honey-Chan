import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const batchId = decodeURIComponent(params.id);

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Body is optional, default to toggle/tamper
    }

    const action = body.action || "tamper"; // "tamper" | "restore"

    const batch = await prisma.honeyBatch.findFirst({
      where: { batchId: batchId },
      include: { hive: true },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const notesStr = batch.notes || "";
    const backupMatch = notesStr.match(/\[TAMPER_BACKUP:(\{.*?\})\]/);

    if (action === "restore") {
      if (!backupMatch) {
        return NextResponse.json({
          message: "Batch is not currently tampered or backup not found",
          isTampered: false,
          batch,
        });
      }

      try {
        const backupData = JSON.parse(backupMatch[1]);
        const cleanedNotes = notesStr.replace(/\[TAMPER_BACKUP:\{.*?\}\]\s*/g, "").trim();

        const updated = await prisma.honeyBatch.update({
          where: { id: batch.id },
          data: {
            quantity: Number(backupData.quantity),
            honeyType: backupData.honeyType,
            location: backupData.location || batch.location,
            notes: cleanedNotes,
          },
        });

        return NextResponse.json({
          success: true,
          action: "restored",
          message: "Original authentic batch metadata restored successfully.",
          batch: updated,
        });
      } catch (parseErr) {
        return NextResponse.json({ error: "Corrupt tamper backup data" }, { status: 500 });
      }
    }

    // Default: Simulate Tamper Attack (Modifying DB off-chain)
    if (backupMatch) {
      return NextResponse.json({
        message: "Batch is already in tampered state. Restore first to re-tamper.",
        isTampered: true,
        batch,
      });
    }

    const originalQuantity = Number(batch.quantity || 15);
    const originalType = batch.honeyType || "Natural Mustard Flora";
    const originalLocation = batch.location || "Haryana Apiary Cluster";

    // Save backup in notes tag
    const backupJson = JSON.stringify({
      quantity: originalQuantity,
      honeyType: originalType,
      location: originalLocation,
    });
    const newNotes = `${notesStr}\n[TAMPER_BACKUP:${backupJson}]`.trim();

    // Adversary off-chain injection: Inflate weight or alter flora to mimic illicit blending
    const tamperedQuantity = originalQuantity + 12.5; // e.g. 15kg -> 27.5kg
    const tamperedType = `${originalType} (Diluted with High-Fructose Syrup)`;

    const updated = await prisma.honeyBatch.update({
      where: { id: batch.id },
      data: {
        quantity: tamperedQuantity,
        honeyType: tamperedType,
        notes: newNotes,
      },
    });

    return NextResponse.json({
      success: true,
      action: "tampered",
      message: "Simulated unauthorized off-chain database modification. Cryptographic hash will now fail.",
      originalData: { quantity: originalQuantity, honeyType: originalType },
      tamperedData: { quantity: tamperedQuantity, honeyType: tamperedType },
      batch: updated,
    });
  } catch (error: any) {
    console.error("[Tamper API Route] Error:", error);
    return NextResponse.json({ error: "Failed to modify batch integrity state" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  // Alias for RESTORE
  const params = await props.params;
  return POST(
    new Request(req.url, {
      method: "POST",
      body: JSON.stringify({ action: "restore" }),
      headers: { "Content-Type": "application/json" },
    }),
    { params: Promise.resolve(params) }
  );
}
