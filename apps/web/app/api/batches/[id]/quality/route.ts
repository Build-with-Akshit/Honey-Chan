import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const batchId = (await params).id;
    const { ipfsHash, txHash, passed, reportUrl } = await req.json();

    const batch = await prisma.honeyBatch.findUnique({
      where: { batchId },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // 1. Create Quality Test Record
    await prisma.qualityTest.create({
      data: {
        batchId: batch.id,
        result: passed ? "PASS" : "FAIL",
        reportHash: ipfsHash,
        reportUrl: reportUrl,
        labId: user.id,
      },
    });

    // 2. Update Batch Status and Quality Passed flag
    await prisma.honeyBatch.update({
      where: { id: batch.id },
      data: {
        status: "TESTED", // Database state
        updatedAt: new Date(),
      },
    });

    // 3. Log Supply Chain Event
    await prisma.supplyChainEvent.create({
      data: {
        batchId: batch.id,
        stage: "QUALITY_TESTED",
        txHash: txHash,
        notes: `Lab Quality Test: ${passed ? "PASSED" : "FAILED"}. Report CID: ${ipfsHash}`,
        actorId: user.id,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Lab Test API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
