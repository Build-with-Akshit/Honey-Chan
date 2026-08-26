import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    // Beekeepers see only their own hives
    const whereClause = user!.role === "BEEKEEPER" ? { beekeeperId: user!.id } : {};

    const hives = await prisma.hive.findMany({
      where: whereClause,
      include: {
        cluster: true,
        beekeeper: true,
        sensorReadings: {
          take: 1,
          orderBy: { timestamp: "desc" },
        },
        aiPredictions: {
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedHives = hives.map(hive => ({
      ...hive,
      latestReading: hive.sensorReadings?.[0] || null,
      healthScore: hive.aiPredictions?.[0]?.healthScore || 85,
    }));

    return NextResponse.json(mappedHives);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hives" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(["BEEKEEPER", "ADMIN"]);
    if (errorResponse) return errorResponse;

    const data = await req.json();
    const { hiveCode, location, flowerSource, colonyType, clusterId } = data;
    
    if (!hiveCode || !location) {
      return NextResponse.json({ error: "hiveCode and location are required" }, { status: 400 });
    }

    // Use authenticated user's ID as beekeeper
    const beekeeperId = user!.role === "ADMIN" && data.beekeeperId ? data.beekeeperId : user!.id;

    const newHive = await prisma.hive.create({
      data: {
        hiveCode,
        location,
        flowerSource: flowerSource || "Mustard Flower",
        beeColonyType: colonyType || "Apis mellifera",
        clusterId: clusterId || 1,
        beekeeperId: beekeeperId,
      },
      include: {
        cluster: true,
        beekeeper: true,
      }
    });

    return NextResponse.json(newHive, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create hive" }, { status: 500 });
  }
}
