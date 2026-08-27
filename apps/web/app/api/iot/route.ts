import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Secret key to verify the request is coming from a real ESP32 device
const IOT_DEVICE_KEY = process.env.IOT_DEVICE_KEY || "secret_device_key_123";

// Ensure AI API URL is properly set, fallback to Render URL
const AI_API_URL = process.env.AI_API_URL || "https://honey-chan.onrender.com";

export async function POST(req: Request) {
  try {
    // 1. Verify Device Key
    const deviceKey = req.headers.get("x-device-key");
    if (deviceKey !== IOT_DEVICE_KEY) {
      return NextResponse.json({ error: "Unauthorized device" }, { status: 401 });
    }

    const body = await req.json();
    const { hiveCode, temperature, humidity, weight, beeActivity } = body;

    if (!hiveCode || temperature === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Find Hive in Database
    const hive = await prisma.hive.findUnique({
      where: { hiveCode: hiveCode },
    });

    if (!hive) {
      return NextResponse.json({ error: "Hive not found" }, { status: 404 });
    }

    // 3. Save Sensor Reading to Database
    const reading = await prisma.sensorReading.create({
      data: {
        hiveId: hive.id,
        temperature: temperature,
        humidity: humidity,
        weight: weight,
        beeActivity: beeActivity,
        battery: 100.0, // Mock battery for now
      },
    });

    // 4. Call AI Microservice for Health Prediction
    try {
      const aiResponse = await fetch(`${AI_API_URL}/analyze/hive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hive_id: hiveCode,
          temperature: temperature,
          humidity: humidity,
          weight: weight,
          bee_activity: beeActivity,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        
        // Save the AI prediction back to our database
        await prisma.aiPrediction.create({
          data: {
            hiveId: hive.id,
            healthScore: aiData.health_score,
            riskLevel: aiData.risk_level,
            productivityPrediction: aiData.estimated_harvest_kg,
            productivityConfidence: aiData.confidence_score,
            predictionWindowDays: aiData.harvest_window_days,
            explanation: JSON.stringify(aiData.observations),
            recommendation: aiData.recommendation,
          }
        });
        
        console.log(`✅ Saved AI Prediction for Hive ${hiveCode}: Risk = ${aiData.risk_level}`);
      } else {
        console.error("AI API returned error:", await aiResponse.text());
      }
    } catch (aiErr) {
      console.error("Failed to connect to AI Microservice:", aiErr);
    }

    return NextResponse.json({
      message: "Telemetry received successfully",
      readingId: reading.id,
    }, { status: 201 });

  } catch (error: any) {
    console.error("IoT API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
