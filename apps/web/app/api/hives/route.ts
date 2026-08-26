import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hives = await prisma.hive.findMany({
      include: {
        cluster: true,
        beekeeper: true,
        sensorReadings: {
          take: 1,
          orderBy: { timestamp: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(hives);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hives" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { hiveCode, location, flowerSource, colonyType, clusterId } = data;
    
    if (!hiveCode || !location) {
      return NextResponse.json({ error: "hiveCode and location are required" }, { status: 400 });
    }

    const newHive = await prisma.hive.create({
      data: {
        hiveCode,
        location,
        flowerSource: flowerSource || "Mustard Flower",
        beeColonyType: colonyType || "Apis mellifera",
        clusterId: clusterId || 1, // Default fallback
        beekeeperId: 2, // Assuming Ramesh Kumar is ID 2
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
