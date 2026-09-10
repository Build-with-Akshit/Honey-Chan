import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(["BEEKEEPER", "ADMIN"]);
    if (errorResponse) return errorResponse;

    const params = await props.params;
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

    // Soft delete the hive to retain historical data and relations for batches
    await prisma.hive.update({
      where: { id: hiveId },
      data: { status: "DELETED" }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete hive error:", error);
    return NextResponse.json({ error: "Failed to delete hive" }, { status: 500 });
  }
}
