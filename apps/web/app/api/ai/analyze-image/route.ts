import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(["BEEKEEPER", "ADMIN"]);
    if (errorResponse) return errorResponse;

    const data = await req.json();
    const { imageName, hiveId, colonyType } = data;

    try {
      const aiResponse = await fetch(`${AI_SERVICE_URL}/analyze/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_name: imageName || "hive_frame.jpg",
          hive_id: hiveId || "HIVE-007",
          colony_type: colonyType || "Apis mellifera",
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (aiResponse.ok) {
        const result = await aiResponse.json();
        return NextResponse.json(result);
      } else {
        throw new Error(`AI service returned ${aiResponse.status}`);
      }
    } catch (aiError) {
      // Fallback: simulated response when AI service is offline
      console.warn("[AI Image Route] AI service unavailable, using fallback:", aiError);
      return NextResponse.json({
        image: imageName || "hive_frame.jpg",
        hive_id: hiveId || "HIVE-007",
        colony_type: colonyType || "Apis mellifera",
        timestamp: new Date().toISOString(),
        brood_pattern_uniformity: 93.2,
        varroa_mite_detected: false,
        queen_cup_detected: false,
        visual_health_score: 92,
        advisory: "Clean comb architecture detected. No visible foulbrood signs.",
        model_type: "Simulated (AI service offline)",
      });
    }
  } catch (error) {
    console.error("[AI Image Route] Error:", error);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
