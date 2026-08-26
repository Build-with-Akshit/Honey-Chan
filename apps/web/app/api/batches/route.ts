import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    // Role-based filtering: beekeepers see only their own batches
    const whereClause = user!.role === "BEEKEEPER" ? { beekeeperId: user!.id } : {};

    const batches = await prisma.honeyBatch.findMany({
      where: whereClause,
      include: {
        hive: true,
        beekeeper: true,
        events: {
          orderBy: { timestamp: "asc" }
        },
        qualityTests: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(batches);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(["BEEKEEPER", "ADMIN"]);
    if (errorResponse) return errorResponse;

    const data = await req.json();
    const {
      batchId,
      hiveId,
      honeyType,
      quantityKg,
      harvestDate,
      originLocation,
      notes,
      blockchainTx,
    } = data;

    if (!batchId || !quantityKg) {
      return NextResponse.json({ error: "batchId and quantityKg are required" }, { status: 400 });
    }

    const hive = await prisma.hive.findFirst({
      where: {
        OR: [
          { id: typeof hiveId === 'number' ? hiveId : undefined },
          { hiveCode: typeof hiveId === 'string' ? hiveId : undefined }
        ]
      },
      include: { beekeeper: true }
    });

    if (!hive) {
      return NextResponse.json({ error: "Hive not found" }, { status: 404 });
    }

    // Use the authenticated user's ID as the beekeeper
    const beekeeperId = user!.role === "ADMIN" ? hive.beekeeperId : user!.id;

    const newBatch = await prisma.honeyBatch.create({
      data: {
        batchId,
        hiveId: hive.id,
        beekeeperId: beekeeperId,
        honeyType: honeyType || hive.flowerSource,
        quantity: Number(quantityKg),
        harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
        location: originLocation || hive.location,
        notes,
        blockchainTx: blockchainTx || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        status: "HARVESTED",
        events: {
          create: {
            stage: "HARVEST",
            actorId: beekeeperId,
            location: originLocation || hive.location,
            notes: notes || "Batch created via Honey Chain Web3 Portal",
            txHash: blockchainTx || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          }
        }
      },
      include: {
        hive: true,
        beekeeper: true,
        events: true,
      }
    });

    return NextResponse.json(newBatch, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 });
  }
}
