import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runPipeline } from "@/lib/pipeline";

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

        // Run IoT -> AI -> Alert pipeline
    const pipelineResult = await runPipeline(targetHive.id, {
      temperature: reading.temperature?.toNumber() || 0,
      humidity: reading.humidity?.toNumber() || 0,
      weight: reading.weight?.toNumber() || 0,
      beeActivity: reading.beeActivity?.toNumber() || 0,
      battery: reading.battery?.toNumber() || 0,
    });

    return NextResponse.json({ success: true, reading, pipeline: { alerts: pipelineResult.alerts.length, prediction: pipelineResult.prediction ? { score: pipelineResult.prediction.healthScore, risk: pipelineResult.prediction.riskLevel } : null } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process IoT reading" }, { status: 500 });
  }
}
