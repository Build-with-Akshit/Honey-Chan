import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { hiveId, hiveCode, temperature, humidity, weight, beeActivity, battery } = data;
    
    const targetHive = await prisma.hive.findFirst({
      where: {
        OR: [
          { hiveCode: hiveCode || hiveId },
        ]
      }
    });

    if (!targetHive) {
      return NextResponse.json({ error: "Target hive not found for IoT stream" }, { status: 404 });
    }

    const reading = await prisma.sensorReading.create({
      data: {
        hiveId: targetHive.id,
        temperature: Number(temperature) || 34.2,
        humidity: Number(humidity) || 65.0,
        weight: Number(weight) || 38.4,
        beeActivity: Number(beeActivity) || 0.85,
        battery: Number(battery) || 90,
      }
    });

    // Mock AI Analysis update for the hive
    const status = (reading.temperature?.toNumber() || 0) > 37 ? "WARNING" : "ACTIVE";
    await prisma.hive.update({
      where: { id: targetHive.id },
      data: { status }
    });

    return NextResponse.json({ success: true, reading });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process IoT reading" }, { status: 500 });
  }
}
