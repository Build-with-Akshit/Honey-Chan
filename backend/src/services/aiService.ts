import { Hive, AIPrediction, db } from "../store/database.js";

export class AIService {
  /**
   * Comprehensive Hive Health, Risk & Productivity Analytics
   */
  static analyzeHive(hiveId: string): AIPrediction {
    const hive = db.hives.find((h) => h.id === hiveId || h.hiveCode === hiveId);
    if (!hive) {
      throw new Error(`Hive ${hiveId} not found`);
    }

    const { temperature, humidity, weight, beeActivity } = hive.latestReading;

    // 1. Health Score Evaluation (Optimal: Temp 33.5 - 35.5°C, Hum 55 - 70%, Activity > 0.75)
    let score = 100;
    const factors: AIPrediction["factors"] = [];

    // Temp Check
    if (temperature < 32.0) {
      const penalty = Math.min(30, (32.0 - temperature) * 10);
      score -= penalty;
      factors.push({
        name: "Temperature (Brood Cooling Risk)",
        status: "alert",
        value: `${temperature}°C (Sub-optimal, risk of brood chilling)`,
      });
    } else if (temperature > 36.0) {
      const penalty = Math.min(30, (temperature - 36.0) * 12);
      score -= penalty;
      factors.push({
        name: "Temperature (Overheating Risk)",
        status: "alert",
        value: `${temperature}°C (Colony fanning / overheating stress)`,
      });
    } else {
      factors.push({
        name: "Internal Temperature",
        status: "optimal",
        value: `${temperature}°C (Optimal 33.5–35.5°C maintained)`,
      });
    }

    // Humidity Check
    if (humidity > 75) {
      score -= 15;
      factors.push({
        name: "Hive Humidity",
        status: "warning",
        value: `${humidity}% (Excess moisture risk: fungal/mold vulnerability)`,
      });
    } else if (humidity < 50) {
      score -= 10;
      factors.push({
        name: "Hive Humidity",
        status: "warning",
        value: `${humidity}% (Dry conditions, nectar curing accelerated)`,
      });
    } else {
      factors.push({
        name: "Hive Humidity",
        status: "optimal",
        value: `${humidity}% (Ideal range 55–70%)`,
      });
    }

    // Bee Activity Check
    if (beeActivity < 0.65) {
      score -= 20;
      factors.push({
        name: "Foraging Activity",
        status: "warning",
        value: `${Math.round(beeActivity * 100)}% (Reduced entrance traffic detected)`,
      });
    } else {
      factors.push({
        name: "Foraging Activity",
        status: "optimal",
        value: `${Math.round(beeActivity * 100)}% (Strong entrance traffic & pollen intake)`,
      });
    }

    // Weight Check
    if (weight > 35) {
      factors.push({
        name: "Honey Storage Accumulation",
        status: "optimal",
        value: `${weight} kg (+${(weight - 30).toFixed(1)} kg surplus honey)`,
      });
    } else {
      factors.push({
        name: "Hive Net Weight",
        status: "optimal",
        value: `${weight} kg (Colony standard weight)`,
      });
    }

    const healthScore = Math.max(10, Math.min(99, Math.round(score)));

    // 2. Risk Level Assignment
    let riskLevel: AIPrediction["riskLevel"] = "LOW";
    if (healthScore < 50) riskLevel = "CRITICAL";
    else if (healthScore < 75) riskLevel = "HIGH";
    else if (healthScore < 88) riskLevel = "MEDIUM";
    else riskLevel = "LOW";

    // 3. Productivity Prediction Model
    // Linear / Logistic regression estimate of extractable honey
    const baseWeight = 22; // empty hive + frame weight
    const surplusKg = Math.max(0, weight - baseWeight);
    const estimatedHarvest = Number((surplusKg * (0.85 + beeActivity * 0.1)).toFixed(1));
    const confidence = Number((0.78 + (healthScore / 500)).toFixed(2));
    const windowDays = surplusKg > 15 ? 4 : surplusKg > 8 ? 8 : 14;

    // 4. Recommendation generation
    let recommendation = "";
    if (riskLevel === "LOW") {
      recommendation = `Colony conditions are optimal for honey flow. Honey supers are filling normally. Expected harvest window is within ${windowDays} days.`;
    } else if (riskLevel === "MEDIUM") {
      recommendation = `Moderate humidity/temperature deviation observed. Ensure hive entrance ventilation is unobstructed and check water source proximity.`;
    } else {
      recommendation = `Attention needed: Hive parameters deviate from normal baseline. Recommended manual physical inspection for Queen health and brood viability.`;
    }

    // 5. Anomaly / Swarming / Disease risks
    const varroaRisk = humidity > 72 && beeActivity < 0.7 ? "MODERATE" : "LOW";
    const broodCooling = temperature < 32.5 ? "HIGH" : temperature < 33.5 ? "MILD" : "NONE";
    const swarmingProb = Number((Math.max(0.05, (weight > 44 ? 0.65 : 0.12))).toFixed(2));

    return {
      hiveId: hive.id,
      healthScore,
      riskLevel,
      productivityKg: estimatedHarvest,
      confidence,
      windowDays,
      explanation: `Calculated from real-time micro-climate sensors (Temp ${temperature}°C, Humidity ${humidity}%, Weight ${weight}kg, Activity ${Math.round(beeActivity * 100)}%).`,
      recommendation,
      factors,
      anomalyDetection: {
        varroaMiteRisk: varroaRisk,
        broodCoolingRisk: broodCooling,
        swarmingProbability: swarmingProb,
      },
    };
  }

  /**
   * Computer Vision / Image Disease Detection Analyzer (Prototype)
   */
  static analyzeHiveImage(fileName: string, colonyType: string) {
    return {
      analyzedImage: fileName,
      colonyType: colonyType || "Apis mellifera",
      timestamp: new Date().toISOString(),
      detectionResults: {
        normalBeeActivity: 88.5,
        queenStatus: "QUEEN_PRESENT_DETECTED",
        combPatternRegularity: 92.4, // %
        varroaMiteInfestation: "NEGATIVE (<1% threshold)",
        americanFoulbroodSymptom: "NEGATIVE",
        waxMothPresence: "NONE",
      },
      overallVisualHealth: 91,
      confidence: 0.89,
      aiNotice: "AI-assisted computer vision risk screening for beekeeping management (SIH26021).",
    };
  }
}
