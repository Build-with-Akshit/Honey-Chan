import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await requireAuth(["BEEKEEPER", "ADMIN"]);
    if (errorResponse) return errorResponse;

    const params = await props.params;
    const hiveIdentifier = params.id;

    // Find hive by ID or hiveCode
    const hive = await prisma.hive.findFirst({
      where: {
        OR: [
          { hiveCode: hiveIdentifier },
          { id: !isNaN(Number(hiveIdentifier)) ? Number(hiveIdentifier) : undefined },
        ],
      },
      include: {
        sensorReadings: {
          take: 1,
          orderBy: { timestamp: "desc" },
        },
        beekeeper: true,
      },
    });

    if (!hive) {
      return NextResponse.json({ error: "Hive not found" }, { status: 404 });
    }

    // Get latest sensor reading
    const latestReading = hive.sensorReadings[0];

    if (!latestReading) {
      return NextResponse.json({
        hive_id: hive.hiveCode,
        message: "No sensor data available yet for AI analysis.",
        health_score: null,
        risk_level: null,
      });
    }

    // Build telemetry payload for AI service
    const telemetry = {
      hive_id: hive.hiveCode,
      temperature: latestReading.temperature?.toNumber() ?? 34.2,
      humidity: latestReading.humidity?.toNumber() ?? 65.0,
      weight: latestReading.weight?.toNumber() ?? 38.0,
      bee_activity: latestReading.beeActivity?.toNumber() ?? 0.85,
    };

    let aiResult;

    try {
      // Call the Python AI microservice
      const aiResponse = await fetch(`${AI_SERVICE_URL}/analyze/hive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telemetry),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (aiResponse.ok) {
        aiResult = await aiResponse.json();
      } else {
        throw new Error(`AI service returned ${aiResponse.status}`);
      }
    } catch (aiError) {
      // Fallback: compute basic score server-side if AI service is unavailable
      console.warn("[AI Route] AI service unavailable, using inline fallback:", aiError);
      const temp = telemetry.temperature;
      const hum = telemetry.humidity;
      const act = telemetry.bee_activity;

      let score = 100;
      if (temp < 32) score -= Math.min(30, (32 - temp) * 10);
      else if (temp > 36) score -= Math.min(30, (temp - 36) * 12);
      if (hum > 75) score -= 15;
      if (act < 0.65) score -= 20;
      score = Math.max(15, Math.min(99, Math.round(score)));

      aiResult = {
        hive_id: telemetry.hive_id,
        health_score: score,
        risk_level: score >= 88 ? "LOW" : score >= 72 ? "MEDIUM" : score >= 50 ? "HIGH" : "CRITICAL",
        health_status: score >= 88 ? "HEALTHY" : score >= 72 ? "STRESSED" : score >= 50 ? "AT_RISK" : "CRITICAL",
        estimated_harvest_kg: Math.max(0, (telemetry.weight - 22) * 0.85),
        confidence_score: 0.65,
        observations: [],
        recommendation: score >= 88 ? "Maintain standard inspection schedule." : "Check hive conditions.",
        model_type: "Inline fallback (AI service offline)",
      };
    }

    // Save prediction to database
    try {
      await prisma.aiPrediction.create({
        data: {
          hiveId: hive.id,
          healthScore: aiResult.health_score,
          riskLevel: aiResult.risk_level,
          productivityPrediction: aiResult.estimated_harvest_kg,
          productivityConfidence: aiResult.confidence_score,
          predictionWindowDays: aiResult.harvest_window_days || 7,
          explanation: (aiResult.observations || []).join(" | "),
          recommendation: aiResult.recommendation,
        },
      });
    } catch (dbError) {
      console.warn("[AI Route] Failed to save prediction to DB:", dbError);
    }

    return NextResponse.json({
      ...aiResult,
      sensor_data: {
        temperature: telemetry.temperature,
        humidity: telemetry.humidity,
        weight: telemetry.weight,
        bee_activity: telemetry.bee_activity,
        timestamp: latestReading.timestamp,
      },
    });
  } catch (error) {
    console.error("[AI Hive Route] Error:", error);
    return NextResponse.json({ error: "Failed to analyze hive" }, { status: 500 });
  }
}
