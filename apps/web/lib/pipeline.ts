import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

// ── Alert Store (JSON file for prototype) ───────────────────────────
const ALERTS_DIR = path.join(process.cwd(), ".data");
const ALERTS_FILE = path.join(ALERTS_DIR, "alerts.json");

export interface HiveAlert {
  id: string;
  hiveId: number;
  hiveCode: string;
  type: "TEMPERATURE_HIGH" | "TEMPERATURE_LOW" | "HUMIDITY_HIGH" | "HUMIDITY_LOW" | "ACTIVITY_LOW" | "BATTERY_LOW" | "HEALTH_CRITICAL" | "HEALTH_AT_RISK" | "SWARM_RISK";
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  sensorData: {
    temperature?: number;
    humidity?: number;
    weight?: number;
    beeActivity?: number;
    battery?: number;
  };
  healthScore?: number;
  riskLevel?: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  createdAt: string;
}

function ensureAlertsDir() {
  if (!fs.existsSync(ALERTS_DIR)) {
    fs.mkdirSync(ALERTS_DIR, { recursive: true });
  }
}

function readAlerts(): HiveAlert[] {
  try {
    ensureAlertsDir();
    if (!fs.existsSync(ALERTS_FILE)) return [];
    const raw = fs.readFileSync(ALERTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAlerts(alerts: HiveAlert[]) {
  ensureAlertsDir();
  // Keep only last 200 alerts
  const trimmed = alerts.slice(-200);
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(trimmed, null, 2));
}

// ── Threshold Rules ─────────────────────────────────────────────────
interface ThresholdRule {
  check: (value: number) => boolean;
  type: HiveAlert["type"];
  severity: HiveAlert["severity"];
  title: string;
  message: (value: number) => string;
}

const THRESHOLD_RULES: ThresholdRule[] = [
  // Temperature
  {
    check: (t) => t > 38,
    type: "TEMPERATURE_HIGH",
    severity: "CRITICAL",
    title: "Critical: Hive Overheating",
    message: (t) => `Temperature reached ${t}\u00B0C (threshold: 38\u00B0C). Risk of colony absconding or wax melt.`,
  },
  {
    check: (t) => t > 36 && t <= 38,
    type: "TEMPERATURE_HIGH",
    severity: "WARNING",
    title: "Warning: High Temperature",
    message: (t) => `Temperature at ${t}\u00B0C (threshold: 36\u00B0C). Monitor closely.`,
  },
  {
    check: (t) => t < 30,
    type: "TEMPERATURE_LOW",
    severity: "WARNING",
    title: "Warning: Low Temperature",
    message: (t) => `Temperature dropped to ${t}\u00B0C (threshold: 30\u00B0C). Brood development may be affected.`,
  },
  // Humidity
  {
    check: (h) => h > 80,
    type: "HUMIDITY_HIGH",
    severity: "WARNING",
    title: "Warning: High Humidity",
    message: (h) => `Humidity at ${h}%. Risk of moisture damage and mold growth.`,
  },
  {
    check: (h) => h < 40,
    type: "HUMIDITY_LOW",
    severity: "INFO",
    title: "Info: Low Humidity",
    message: (h) => `Humidity at ${h}%. Nectar may dehydrate too quickly.`,
  },
  // Bee Activity
  {
    check: (a) => a < 0.4,
    type: "ACTIVITY_LOW",
    severity: "CRITICAL",
    title: "Critical: Very Low Bee Activity",
    message: (a) => `Activity level at ${(a * 100).toFixed(0)}%. Possible colony collapse or queen issues.`,
  },
  {
    check: (a) => a < 0.6 && a >= 0.4,
    type: "ACTIVITY_LOW",
    severity: "WARNING",
    title: "Warning: Reduced Bee Activity",
    message: (a) => `Activity level at ${(a * 100).toFixed(0)}%. Colony may be stressed.`,
  },
  // Battery
  {
    check: (b) => b < 15,
    type: "BATTERY_LOW",
    severity: "WARNING",
    title: "Warning: IoT Sensor Battery Low",
    message: (b) => `Sensor battery at ${b}%. Replace soon to avoid data gaps.`,
  },
];

// ── Pipeline: Analyze Reading & Generate Alerts ─────────────────────
export async function runPipeline(
  hiveId: number,
  reading: {
    temperature: number;
    humidity: number;
    weight: number;
    beeActivity: number;
    battery: number;
  }
): Promise<{ alerts: HiveAlert[]; prediction: any }> {
  // 1. Get hive info
  const hive = await prisma.hive.findUnique({ where: { id: hiveId } });
  if (!hive) return { alerts: [], prediction: null };

  // 2. Run inline AI analysis
  const temp = reading.temperature;
  const hum = reading.humidity;
  const act = reading.beeActivity;

  let score = 100;
  if (temp < 32) score -= Math.min(30, (32 - temp) * 10);
  else if (temp > 36) score -= Math.min(30, (temp - 36) * 12);
  if (hum > 75) score -= 15;
  if (act < 0.65) score -= 20;
  score = Math.max(15, Math.min(99, Math.round(score)));

  const riskLevel = score >= 88 ? "LOW" : score >= 72 ? "MEDIUM" : score >= 50 ? "HIGH" : "CRITICAL";

  // 3. Save prediction to DB
  let prediction;
  try {
    prediction = await prisma.aiPrediction.create({
      data: {
        hiveId: hive.id,
        healthScore: score,
        riskLevel,
        productivityPrediction: Math.max(0, (reading.weight - 22) * 0.85),
        productivityConfidence: 0.65,
        predictionWindowDays: 7,
        explanation: `Auto-analysis: temp=${temp}, humidity=${hum}, activity=${act}`,
        recommendation: score >= 88
          ? "Maintain standard inspection schedule."
          : score >= 72
            ? "Monitor conditions closely. Check for signs of stress."
            : "Immediate inspection recommended. Check queen status and food stores.",
      },
    });
  } catch (dbError) {
    console.warn("[Pipeline] Failed to save prediction:", dbError);
  }

  // 4. Generate threshold-based alerts
  const newAlerts: HiveAlert[] = [];
  const readings = [
    { value: reading.temperature, key: "temperature" },
    { value: reading.humidity, key: "humidity" },
    { value: reading.beeActivity, key: "beeActivity" },
    { value: reading.battery, key: "battery" },
  ];

  for (const rule of THRESHOLD_RULES) {
    for (const r of readings) {
      if (rule.check(r.value)) {
        newAlerts.push({
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          hiveId: hive.id,
          hiveCode: hive.hiveCode,
          type: rule.type,
          severity: rule.severity,
          title: rule.title,
          message: rule.message(r.value),
          sensorData: { ...reading },
          healthScore: score,
          riskLevel,
          acknowledged: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // 5. AI risk-based alerts
  if (riskLevel === "CRITICAL") {
    newAlerts.push({
      id: `alert-${Date.now()}-critical-health`,
      hiveId: hive.id,
      hiveCode: hive.hiveCode,
      type: "HEALTH_CRITICAL",
      severity: "CRITICAL",
      title: "Critical: Hive Health Score Dangerously Low",
      message: `AI health score dropped to ${score}/100. Risk level: CRITICAL. Immediate intervention required.`,
      sensorData: { ...reading },
      healthScore: score,
      riskLevel,
      acknowledged: false,
      createdAt: new Date().toISOString(),
    });
  } else if (riskLevel === "HIGH") {
    newAlerts.push({
      id: `alert-${Date.now()}-at-risk-health`,
      hiveId: hive.id,
      hiveCode: hive.hiveCode,
      type: "HEALTH_AT_RISK",
      severity: "WARNING",
      title: "Warning: Hive Health At Risk",
      message: `AI health score at ${score}/100. Risk level: HIGH. Schedule inspection.`,
      sensorData: { ...reading },
      healthScore: score,
      riskLevel,
      acknowledged: false,
      createdAt: new Date().toISOString(),
    });
  }

  // 6. Swarm risk detection (weight drop + high activity)
  if (reading.weight < 25 && reading.beeActivity > 0.8) {
    newAlerts.push({
      id: `alert-${Date.now()}-swarm-risk`,
      hiveId: hive.id,
      hiveCode: hive.hiveCode,
      type: "SWARM_RISK",
      severity: "WARNING",
      title: "Warning: Possible Swarm Event",
      message: `Low hive weight (${reading.weight}kg) combined with high bee activity (${(reading.beeActivity * 100).toFixed(0)}%) suggests possible swarming.`,
      sensorData: { ...reading },
      healthScore: score,
      riskLevel,
      acknowledged: false,
      createdAt: new Date().toISOString(),
    });
  }

  // 7. Persist alerts
  if (newAlerts.length > 0) {
    const existing = readAlerts();
    writeAlerts([...existing, ...newAlerts]);
    console.log(`[Pipeline] Hive ${hive.hiveCode}: ${newAlerts.length} alert(s) generated (score: ${score}, risk: ${riskLevel})`);
  }

  // 8. Update hive status based on pipeline result
  const hiveStatus = riskLevel === "CRITICAL" ? "CRITICAL" : riskLevel === "HIGH" ? "WARNING" : "ACTIVE";
  if (hive.status !== hiveStatus) {
    await prisma.hive.update({
      where: { id: hive.id },
      data: { status: hiveStatus },
    });
  }

  return { alerts: newAlerts, prediction };
}

// ── Alert Management ────────────────────────────────────────────────
export function getAlerts(options?: {
  hiveId?: number;
  severity?: string;
  acknowledged?: boolean;
  limit?: number;
}): HiveAlert[] {
  let alerts = readAlerts();

  if (options?.hiveId !== undefined) {
    alerts = alerts.filter((a) => a.hiveId === options.hiveId);
  }
  if (options?.severity) {
    alerts = alerts.filter((a) => a.severity === options.severity);
  }
  if (options?.acknowledged !== undefined) {
    alerts = alerts.filter((a) => a.acknowledged === options.acknowledged);
  }

  alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (options?.limit) {
    alerts = alerts.slice(0, options.limit);
  }

  return alerts;
}

export function acknowledgeAlert(alertId: string): boolean {
  const alerts = readAlerts();
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) return false;
  alert.acknowledged = true;
  alert.acknowledgedAt = new Date().toISOString();
  writeAlerts(alerts);
  return true;
}

export function acknowledgeAllAlerts(): number {
  const alerts = readAlerts();
  let count = 0;
  const now = new Date().toISOString();
  for (const alert of alerts) {
    if (!alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedAt = now;
      count++;
    }
  }
  writeAlerts(alerts);
  return count;
}

export function getUnacknowledgedCount(): number {
  return readAlerts().filter((a) => !a.acknowledged).length;
}
