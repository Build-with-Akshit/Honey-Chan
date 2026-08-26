import { NextResponse } from "next/server";

// Mock AI Data since real ML models aren't hooked up for the prototype
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Generate slightly different data based on hive ID for demo purposes
  const isWarning = id === "HIVE-012";
  
  return NextResponse.json({
    healthScore: isWarning ? 72 : 94,
    riskLevel: isWarning ? "ELEVATED" : "LOW",
    productivityKg: isWarning ? 4.2 : 12.5,
    confidence: isWarning ? 0.76 : 0.92,
    windowDays: isWarning ? 21 : 14,
    anomalyDetection: {
      broodCoolingRisk: isWarning ? "Moderate" : "Minimal",
      varroaMiteRisk: isWarning ? "Elevated" : "Low",
      swarmingProbability: isWarning ? 0.45 : 0.08,
    },
    recommendation: isWarning 
      ? "Schedule immediate inspection for potential Varroa infestation."
      : "Colony is performing optimally. Prepare for harvest in 2 weeks.",
    explanation: isWarning
      ? "Temperature fluctuations and reduced weight gain suggest compromised brood health."
      : "Steady weight gain and optimal humidity indicate strong nectar flow processing.",
    factors: [
      { name: "Internal Temperature", status: isWarning ? "warning" : "optimal", value: isWarning ? "32°C (Fluctuating)" : "35°C (Stable)" },
      { name: "Relative Humidity", status: "optimal", value: "60%" },
      { name: "Acoustic Frequency", status: isWarning ? "warning" : "optimal", value: isWarning ? "280Hz (Agitated)" : "220Hz (Calm)" },
    ]
  });
}
