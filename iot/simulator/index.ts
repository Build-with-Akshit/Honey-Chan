/**
 * 🐝 Honey Chain IoT Hive Simulator
 * Simulates micro-climate telemetry (Temp, Humidity, Weight, Bee Traffic, Battery)
 * for multiple apiary hives and streams to the Honey Chain API endpoint.
 *
 * (Architecture note: Real ESP32 / Arduino hardware POSTs to the EXACT same endpoint!)
 */

const API_ENDPOINT = process.env.API_ENDPOINT || "http://localhost:5000/api/iot/readings";

const HIVES = [
  { hiveCode: "HIVE-007", baseTemp: 34.2, baseHum: 65.0, baseWeight: 38.4, battery: 94 },
  { hiveCode: "HIVE-001", baseTemp: 33.9, baseHum: 63.0, baseWeight: 42.1, battery: 89 },
  { hiveCode: "HIVE-012", baseTemp: 36.2, baseHum: 76.0, baseWeight: 31.2, battery: 81 },
  { hiveCode: "HIVE-018", baseTemp: 33.8, baseHum: 62.0, baseWeight: 45.8, battery: 96 },
];

let tick = 0;

async function sendReading(hive: (typeof HIVES)[0]) {
  tick++;
  // Realistic circadian drift & sensor micro-noise
  const tempNoise = Number((Math.sin(tick * 0.1) * 0.4 + (Math.random() * 0.2 - 0.1)).toFixed(2));
  const humNoise = Number((Math.cos(tick * 0.1) * 1.5 + (Math.random() * 0.6 - 0.3)).toFixed(2));
  const weightDrift = Number((Math.sin(tick * 0.05) * 0.3).toFixed(2));
  const activity = Number(Math.max(0.4, Math.min(0.99, 0.85 + Math.sin(tick * 0.2) * 0.1)).toFixed(2));

  const payload = {
    hiveCode: hive.hiveCode,
    temperature: Number((hive.baseTemp + tempNoise).toFixed(1)),
    humidity: Number((hive.baseHum + humNoise).toFixed(1)),
    weight: Number((hive.baseWeight + weightDrift).toFixed(1)),
    beeActivity: activity,
    battery: Math.max(70, hive.battery - Math.floor(tick / 100)),
  };

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(
        `📡 [IoT-OK] ${hive.hiveCode} -> Temp: ${payload.temperature}°C | Hum: ${payload.humidity}% | Wt: ${payload.weight}kg | Act: ${Math.round(payload.beeActivity * 100)}%`
      );
    }
  } catch (err: any) {
    console.log(`⚠️ [IoT-WARN] Backend not reachable yet (${err.message})`);
  }
}

async function runSimulator() {
  console.log("🐝 Starting Honey Chain IoT Telemetry Simulator...");
  console.log(`📡 Target API: ${API_ENDPOINT}`);
  console.log(`🏠 Simulating ${HIVES.length} KVIC hives: ${HIVES.map((h) => h.hiveCode).join(", ")}`);
  console.log("─────────────────────────────────────────────────────────────\n");

  setInterval(() => {
    HIVES.forEach((hive) => sendReading(hive));
  }, 5000);
}

runSimulator();
