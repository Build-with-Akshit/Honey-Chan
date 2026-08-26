import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(["LAB", "ADMIN"]);
    if (errorResponse) return errorResponse;

    const data = await req.json();
    const { batchId, moisture, sucrose, fructose, glucose, hfmContent, result } = data;
    
    const batch = await prisma.honeyBatch.findFirst({
      where: { batchId: batchId }
    });

    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    const qualityTest = await prisma.qualityTest.create({
      data: {
        batchId: batch.id,
        labId: user!.id, // Use authenticated lab user instead of hardcoded ID
        moisture: Number(moisture) || 17.8,
        sucrose: Number(sucrose) || 3.2,
        fructose: Number(fructose) || 38.5,
        glucose: Number(glucose) || 31.2,
        hfmContent: Number(hfmContent) || 18.4,
        result: result || "PASS",
        reportHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      }
    });

    await prisma.honeyBatch.update({
      where: { id: batch.id },
      data: { status: "TESTED" }
    });

    await prisma.supplyChainEvent.create({
      data: {
        batchId: batch.id,
        stage: "LAB_TESTING",
        actorId: user!.id, // Use authenticated lab user
        location: "FSSAI Accredited Center, New Delhi",
        notes: `Lab test ${result || "PASS"} by ${user!.name}`,
        txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      }
    });

    return NextResponse.json({ success: true, qualityTest });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit quality test" }, { status: 500 });
  }
}
