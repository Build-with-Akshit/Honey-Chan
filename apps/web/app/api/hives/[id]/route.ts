import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, errorResponse } = await requireAuth(["BEEKEEPER", "ADMIN"]);
    if (errorResponse) return errorResponse;

    const hiveId = parseInt(params.id);
    
    // Check if hive exists and belongs to user
    const hive = await prisma.hive.findUnique({
      where: { id: hiveId },
      include: { honeyBatches: true }
    });

    if (!hive) {
      return NextResponse.json({ error: "Hive not found" }, { status: 404 });
    }

    if (user!.role !== "ADMIN" && hive.beekeeperId !== user!.id) {
      return NextResponse.json({ error: "Unauthorized to delete this hive" }, { status: 403 });
    }

    if (hive.honeyBatches.length > 0) {
      // Unlink batches instead of preventing deletion
      await prisma.honeyBatch.updateMany({
        where: { hiveId },
        data: { hiveId: null }
      });
    }

    // Delete related records manually because cascade might not be set up
    await prisma.sensorReading.deleteMany({
      where: { hiveId }
    });

    await prisma.aiPrediction.deleteMany({
      where: { hiveId }
    });

    await prisma.hive.delete({
      where: { id: hiveId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete hive error:", error);
    return NextResponse.json({ error: "Failed to delete hive" }, { status: 500 });
  }
}
