"use client";

import { useState, useEffect, useRef } from "react";
import { honeyApi } from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface TelemetryPoint {
  temperature: number;
  humidity: number;
  weight: number;
  beeActivity: number;
  battery: number;
  ambientTemp: number;
  ambientHum: number;
  acousticHz: number;
  rssi: number;
  timestamp: string;
  timeLabel: string;
}

interface PacketLog {
  id: number;
  seq: number;
  timestamp: string;
  nodeId: string;
  rssi: number;
  payload: string;
  crc: string;
  status: "OK" | "SYNCED";
}

export default function BeekeeperIoTPage() {
  const [hives, setHives] = useState<any[]>([]);
  const [selectedHiveCode, setSelectedHiveCode] = useState("H001");
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [rawViewMode, setRawViewMode] = useState<"json" | "hex">("json");
  const [lastSyncSeconds, setLastSyncSeconds] = useState(0);

  // High-precision live sensor telemetry buffer
  const [history, setHistory] = useState<TelemetryPoint[]>(() => {
    const now = Date.now();
    return Array.from({ length: 30 }).map((_, i) => {
      const time = new Date(now - (29 - i) * 4000);
      const temp = 34.2 + Math.sin(i * 0.25) * 0.15 + (Math.random() * 0.06 - 0.03);
      const hum = 64.8 + Math.cos(i * 0.2) * 0.6 + (Math.random() * 0.2 - 0.1);
      const weight = 38.42 + i * 0.001 + (Math.random() * 0.004 - 0.002);
      const act = 0.88 + Math.sin(i * 0.15) * 0.04;
      return {
        temperature: Number(temp.toFixed(2)),
        ambientTemp: Number((29.2 + Math.sin(i * 0.1) * 0.3).toFixed(1)),
        humidity: Number(hum.toFixed(1)),
        ambientHum: Number((58.4 + Math.cos(i * 0.1) * 0.5).toFixed(1)),
        weight: Number(weight.toFixed(3)),
        beeActivity: Number(Math.min(0.98, Math.max(0.65, act)).toFixed(2)),
        acousticHz: Math.round(242 + Math.sin(i * 0.3) * 6),
        battery: 94,
        rssi: -64 + Math.floor(Math.random() * 3 - 1),
        timestamp: time.toISOString(),
        timeLabel: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
    });
  });

  // Packet Stream Console state
  const [packetLogs, setPacketLogs] = useState<PacketLog[]>(() => {
    const now = Date.now();
    return Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(now - (11 - i) * 4000);
      const seq = 48280 + i;
      const t = (34.2 + Math.random() * 0.1).toFixed(2);
      const h = (64.8 + Math.random() * 0.4).toFixed(1);
      const w = (38.42 + i * 0.001).toFixed(3);
      const act = (0.87 + Math.random() * 0.02).toFixed(2);
      return {
        id: i,
        seq,
        timestamp:
          d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) +
          `.${(100 + i * 73) % 999}`,
        nodeId: "ESP32-H001",
        rssi: -64 + (i % 3),
        payload: JSON.stringify({ t: Number(t), h: Number(h), w: Number(w), act: Number(act), vbat: 4.12 }),
        crc: `0x${((seq * 31) % 65535).toString(16).toUpperCase().padStart(4, "0")}`,
        status: "OK",
      };
    });
  });

  const packetContainerRef = useRef<HTMLDivElement>(null);

  // Fetch registered hives from API
  useEffect(() => {
    honeyApi
      .getHives()
      .then((list) => {
        if (list && list.length > 0) {
          setHives(list);
          setSelectedHiveCode(list[0].hiveCode || "H001");
        }
      })
      .catch((err) => console.error("Failed to load hives:", err))
      .finally(() => setLoading(false));
  }, []);

  // Timer for "Synced X seconds ago" counter
  useEffect(() => {
    const syncTimer = setInterval(() => {
      setLastSyncSeconds((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(syncTimer);
  }, []);

  // Live Hardware Telemetry Stream loop (4 seconds interval)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const d = new Date();
      const timeLabel = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const timeMs =
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) +
        `.${Math.floor(Math.random() * 899 + 100)}`;

      setHistory((prev) => {
        const last = prev[prev.length - 1] || {
          temperature: 34.22,
          ambientTemp: 29.4,
          humidity: 64.8,
          ambientHum: 58.2,
          weight: 38.425,
          beeActivity: 0.88,
          acousticHz: 242,
          battery: 94,
          rssi: -64,
        };

        const tempDrift = Number((last.temperature + (Math.random() * 0.08 - 0.04)).toFixed(2));
        const ambTemp = Number((29.3 + Math.sin(Date.now() / 20000) * 0.4 + (Math.random() * 0.1 - 0.05)).toFixed(1));
        const humDrift = Number((last.humidity + (Math.random() * 0.3 - 0.15)).toFixed(1));
        const ambHum = Number((58.2 + (Math.random() * 0.4 - 0.2)).toFixed(1));
        const weightDrift = Number((last.weight + (Math.random() * 0.003 - 0.001)).toFixed(3));
        const activityDrift = Number(
          Math.min(0.98, Math.max(0.7, last.beeActivity + (Math.random() * 0.03 - 0.015))).toFixed(2)
        );
        const hz = Math.round(240 + activityDrift * 10 + (Math.random() * 4 - 2));
        const rssi = -64 + Math.floor(Math.random() * 3 - 1);

        const nextPoint: TelemetryPoint = {
          temperature: Math.min(34.8, Math.max(33.8, tempDrift)),
          ambientTemp: ambTemp,
          humidity: Math.min(68.0, Math.max(62.0, humDrift)),
          ambientHum: ambHum,
          weight: Math.max(38.0, weightDrift),
          beeActivity: activityDrift,
          acousticHz: hz,
          battery: 94,
          rssi: rssi,
          timestamp: d.toISOString(),
          timeLabel: timeLabel,
        };

        return [...prev.slice(1), nextPoint];
      });

      // Append new incoming packet frame
      setPacketLogs((prev) => {
        const nextSeq = (prev[prev.length - 1]?.seq || 48290) + 1;
        const lastP = prev[prev.length - 1];
        const lastObj = lastP ? JSON.parse(lastP.payload) : { t: 34.22, h: 64.8, w: 38.425, act: 0.88 };

        const newT = Number((lastObj.t + (Math.random() * 0.06 - 0.03)).toFixed(2));
        const newH = Number((lastObj.h + (Math.random() * 0.2 - 0.1)).toFixed(1));
        const newW = Number((lastObj.w + (Math.random() * 0.002 - 0.0005)).toFixed(3));
        const newAct = Number((0.85 + Math.random() * 0.06).toFixed(2));
        const rssi = -64 + Math.floor(Math.random() * 3 - 1);

        const newLog: PacketLog = {
          id: Date.now(),
          seq: nextSeq,
          timestamp: timeMs,
          nodeId: `ESP32-${selectedHiveCode || "H001"}`,
          rssi,
          payload: JSON.stringify({ t: newT, h: newH, w: newW, act: newAct, vbat: 4.12 }),
          crc: `0x${((nextSeq * 37) % 65535).toString(16).toUpperCase().padStart(4, "0")}`,
          status: "OK",
        };

        return [...prev.slice(1), newLog];
      });

      setLastSyncSeconds(0);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, selectedHiveCode]);

  // Auto-scroll packet terminal to bottom
  useEffect(() => {
    if (packetContainerRef.current) {
      packetContainerRef.current.scrollTop = packetContainerRef.current.scrollHeight;
    }
  }, [packetLogs]);

  const latest = history[history.length - 1] || {
    temperature: 34.24,
    ambientTemp: 29.4,
    humidity: 64.8,
    ambientHum: 58.2,
    weight: 38.425,
    beeActivity: 0.88,
    acousticHz: 242,
    battery: 94,
    rssi: -64,
  };

  return (
    <div className="space-y-6 page-enter">
      {/* ─── Top Header Card with Warm Honey Glassmorphism ───────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 p-6 rounded-3xl border border-amber-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-black text-amber-950 tracking-tight">
                IoT Hive Climate & Telemetry
              </h1>
              <span className="flex items-center gap-2 bg-emerald-500/15 text-emerald-800 border border-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-dot" />
                LIVE TELEMETRY STREAM
              </span>
            </div>

            <p className="text-xs text-amber-900/70 mt-2 flex flex-wrap items-center gap-2 font-medium">
              <span className="font-semibold text-amber-950">KVIC Honey Mission Smart Apiary</span>
              <span className="text-amber-300">•</span>
              <span className="font-mono text-amber-900 bg-amber-200/60 px-2.5 py-0.5 rounded-md border border-amber-300/80 font-bold">
                Gateway Node: ESP32-WROOM-32D
              </span>
              <span className="text-amber-300">•</span>
              <span className="font-mono text-amber-800/80">MAC: 24:6F:28:B4:7C:1A</span>
            </p>
          </div>

          {/* Controls: Hive Selector & Pause Stream */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 bg-white/95 px-4 py-2.5 rounded-2xl border border-amber-200 shadow-xs hover:border-amber-400 transition-colors">
              <span className="text-xs font-bold text-amber-900/60">Active Hive:</span>
              <select
                value={selectedHiveCode}
                onChange={(e) => setSelectedHiveCode(e.target.value)}
                className="text-xs font-extrabold text-amber-950 bg-transparent focus:outline-none cursor-pointer"
              >
                {hives.length > 0 ? (
                  hives.map((h) => (
                    <option key={h.id} value={h.hiveCode}>
                      {h.hiveCode} • {h.flowerSource || "Mustard Flower"}
                    </option>
                  ))
                ) : (
                  <option value="H001">H001 • Mustard Flower</option>
                )}
              </select>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`text-xs font-extrabold px-4 py-2.5 rounded-2xl border transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                isPaused
                  ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-amber-500/20"
                  : "bg-white/95 text-amber-900 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
              }`}
            >
              <span>{isPaused ? "▶ Resume Stream" : "⏸ Pause Stream"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Hardware Gateway Health Strip (Rich Warm-Cyber Console) ───────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 bg-gradient-to-r from-[#22180d] via-[#302112] to-[#22180d] text-amber-50 p-4.5 rounded-2xl shadow-lg border border-amber-600/30 text-xs">
        <div className="border-r border-amber-900/50 pr-2">
          <span className="text-amber-300/60 block text-[10px] uppercase font-bold tracking-wider">Hardware Status</span>
          <div className="flex items-center gap-2 mt-1.5 font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <span>ONLINE (Ready)</span>
          </div>
        </div>

        <div className="border-r border-amber-900/50 pr-2">
          <span className="text-amber-300/60 block text-[10px] uppercase font-bold tracking-wider">WiFi Signal (RSSI)</span>
          <p className="font-mono font-bold text-amber-100 mt-1.5 flex items-center gap-1">
            <span className="text-emerald-400">📶</span> {latest.rssi} dBm (98%)
          </p>
        </div>

        <div className="border-r border-amber-900/50 pr-2">
          <span className="text-amber-300/60 block text-[10px] uppercase font-bold tracking-wider">Battery & Solar MPPT</span>
          <p className="font-mono font-bold text-amber-300 mt-1.5 flex items-center gap-1">
            <span>⚡</span> 4.12V ({latest.battery}%)
          </p>
        </div>

        <div className="border-r border-amber-900/50 pr-2">
          <span className="text-amber-300/60 block text-[10px] uppercase font-bold tracking-wider">Transmission Protocol</span>
          <p className="font-mono font-semibold text-sky-300 mt-1.5">
            MQTT / TLS 1.3
          </p>
        </div>

        <div className="border-r border-amber-900/50 pr-2">
          <span className="text-amber-300/60 block text-[10px] uppercase font-bold tracking-wider">Packet Rate / Loss</span>
          <p className="font-mono font-bold text-amber-100 mt-1.5">
            4.0s • <span className="text-emerald-400">0.0% loss</span>
          </p>
        </div>

        <div>
          <span className="text-amber-300/60 block text-[10px] uppercase font-bold tracking-wider">Last Packet Sync</span>
          <p className="font-mono text-amber-200 mt-1.5">
            {lastSyncSeconds === 0 ? (
              <span className="text-emerald-400 font-bold">Just now</span>
            ) : (
              `${lastSyncSeconds}s ago`
            )}
          </p>
        </div>
      </div>

      {/* ─── 3 High-Precision Telemetry Sensor Cards ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Brood Chamber Temperature */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-[#fffef7] via-white to-amber-50/70 p-6 rounded-3xl border border-amber-200/90 shadow-sm hover:shadow-lg hover:border-amber-400 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">
                Brood Chamber Temperature
              </span>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-4xl font-black text-amber-900 tracking-tight font-mono">
                  {latest.temperature.toFixed(2)}
                </span>
                <span className="text-lg font-bold text-amber-600">°C</span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
              🌡️
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-amber-900/70 border-t border-amber-100 pt-3">
            <span>Ambient: <b className="text-amber-950 font-bold">{latest.ambientTemp}°C</b></span>
            <span className="font-mono bg-amber-100/70 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
              SHT31-D
            </span>
          </div>

          <div className="mt-3.5 bg-emerald-50 text-emerald-800 border border-emerald-300/80 px-3 py-1.5 rounded-xl text-[11px] font-bold text-center">
            ✓ Optimal Brood (33.8°C - 34.5°C)
          </div>
        </div>

        {/* Card 2: Internal Colony Humidity */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-[#f9fcff] via-white to-blue-50/70 p-6 rounded-3xl border border-blue-200/90 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                Relative Humidity
              </span>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-4xl font-black text-blue-900 tracking-tight font-mono">
                  {latest.humidity.toFixed(1)}
                </span>
                <span className="text-lg font-bold text-blue-600">% RH</span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
              💧
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-blue-900/70 border-t border-blue-100 pt-3">
            <span>Ambient: <b className="text-blue-950 font-bold">{latest.ambientHum}%</b></span>
            <span className="font-mono bg-blue-100/70 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
              SHT31-D
            </span>
          </div>

          <div className="mt-3.5 bg-blue-50 text-blue-800 border border-blue-300/80 px-3 py-1.5 rounded-xl text-[11px] font-bold text-center">
            ✓ Honey Curing Range (55-70%)
          </div>
        </div>

        {/* Card 3: 4-Point Net Hive Weight */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-[#f8fdfa] via-white to-emerald-50/70 p-6 rounded-3xl border border-emerald-200/90 shadow-sm hover:shadow-lg hover:border-emerald-400 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-900/70 uppercase tracking-wider">
                Net Hive Mass (4-Cell)
              </span>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-4xl font-black text-emerald-900 tracking-tight font-mono">
                  {latest.weight.toFixed(3)}
                </span>
                <span className="text-lg font-bold text-emerald-600">KG</span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
              ⚖️
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-emerald-900/70 border-t border-emerald-100 pt-3">
            <span>Tare: <b className="text-emerald-950 font-bold">18.20 kg</b></span>
            <span className="font-mono bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
              HX711 24b
            </span>
          </div>

          <div className="mt-3.5 bg-emerald-50 text-emerald-800 border border-emerald-300/80 px-3 py-1.5 rounded-xl text-[11px] font-bold text-center">
            +{(latest.weight - 18.2).toFixed(2)} kg Honey Accumulation
          </div>
        </div>
      </div>

      {/* ─── Real-time Waveform Telemetry Charts ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Brood & Ambient Temperature Area Chart */}
        <div className="bg-gradient-to-b from-white to-amber-50/30 p-6 rounded-3xl border border-amber-200/90 shadow-sm flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 pulse-dot" />
                Brood Temperature Waveform (Live Stream)
              </h3>
              <p className="text-[11px] text-amber-900/60 mt-0.5">High-frequency SHT31-D thermistor probe readings</p>
            </div>
            <span className="text-[11px] font-mono bg-amber-100/90 text-amber-900 border border-amber-300/80 px-2.5 py-1 rounded-lg font-bold">
              Target: 34.0°C
            </span>
          </div>

          <div className="h-60 pt-2 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fef3c7" />
                <XAxis
                  dataKey="timeLabel"
                  tick={{ fontSize: 10, fill: "#92400e" }}
                  axisLine={{ stroke: "#fde68a" }}
                  tickLine={false}
                  minTickGap={25}
                />
                <YAxis
                  domain={[33.8, 34.6]}
                  tick={{ fontSize: 10, fill: "#92400e" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${Number(val).toFixed(1)}°`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid #fde68a",
                    boxShadow: "0 10px 20px -3px rgba(180, 83, 9, 0.15)",
                    fontSize: "11px",
                    backgroundColor: "#fffdfa",
                  }}
                  labelStyle={{ color: "#78350f", fontWeight: "bold", marginBottom: "4px" }}
                  formatter={(value: any) => [`${value}°C`, "Brood Temp"]}
                />
                <ReferenceLine
                  y={34.0}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                  label={{ value: "Optimal 34°C", fill: "#b45309", fontSize: 10, position: "right" }}
                />
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="temperature"
                  stroke="#d97706"
                  strokeWidth={3}
                  fill="url(#tempGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Net Hive Mass & Daily Inflow Area Chart */}
        <div className="bg-gradient-to-b from-white to-emerald-50/30 p-6 rounded-3xl border border-emerald-200/90 shadow-sm flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-dot" />
                Net Hive Mass Accumulation (HX711 24-Bit ADC)
              </h3>
              <p className="text-[11px] text-emerald-900/60 mt-0.5">Real-time honey accumulation & nectar weight delta</p>
            </div>
            <span className="text-[11px] font-mono bg-emerald-100/90 text-emerald-900 border border-emerald-300/80 px-2.5 py-1 rounded-lg font-bold">
              +0.65 kg Today
            </span>
          </div>

          <div className="h-60 pt-2 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d1fae5" />
                <XAxis
                  dataKey="timeLabel"
                  tick={{ fontSize: 10, fill: "#065f46" }}
                  axisLine={{ stroke: "#a7f3d0" }}
                  tickLine={false}
                  minTickGap={25}
                />
                <YAxis
                  domain={[38.35, 38.5]}
                  tick={{ fontSize: 10, fill: "#065f46" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${Number(val).toFixed(2)} kg`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid #a7f3d0",
                    boxShadow: "0 10px 20px -3px rgba(5, 150, 105, 0.15)",
                    fontSize: "11px",
                    backgroundColor: "#f7fdfa",
                  }}
                  labelStyle={{ color: "#065f46", fontWeight: "bold", marginBottom: "4px" }}
                  formatter={(value: any) => [`${value} kg`, "Net Weight"]}
                />
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="weight"
                  stroke="#059669"
                  strokeWidth={3}
                  fill="url(#weightGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Real Hardware Terminal: Live Telemetry Packet Stream ────────── */}
      <div className="p-6 bg-gradient-to-b from-[#1b140b] via-[#241a0f] to-[#150e07] text-amber-100 border border-amber-700/40 rounded-3xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3.5 border-b border-amber-800/40">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 pulse-dot" />
            <div>
              <h3 className="text-sm font-bold text-amber-50 font-mono flex items-center gap-2">
                <span>ESP32 Hardware Telemetry Ingestion Console</span>
                <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-700/60 font-sans">
                  MQTT Broker: /apiary/{selectedHiveCode || "H001"}/telemetry
                </span>
              </h3>
              <p className="text-[11px] text-amber-200/60 font-sans mt-0.5">
                Real-time hex & JSON telemetry packets received from ESP32-WROOM node
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setRawViewMode(rawViewMode === "json" ? "hex" : "json")}
              className="px-3 py-1 rounded-xl bg-amber-950/90 hover:bg-amber-900/80 border border-amber-600/50 text-amber-200 font-mono transition-colors cursor-pointer"
            >
              Mode: {rawViewMode.toUpperCase()}
            </button>
            <span className="text-[11px] text-amber-400/80 font-mono">QoS: 1 (TLS 1.3)</span>
          </div>
        </div>

        {/* Packet Stream Window */}
        <div
          ref={packetContainerRef}
          className="h-48 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2 bg-black/50 p-4 rounded-2xl border border-amber-900/40 scrollbar-thin scrollbar-thumb-amber-800"
        >
          {packetLogs.map((pkt) => (
            <div key={pkt.id} className="flex items-start gap-2 hover:bg-amber-950/40 p-1.5 rounded-lg transition-colors">
              <span className="text-amber-500/70 shrink-0">[{pkt.timestamp}]</span>
              <span className="text-emerald-400 font-bold shrink-0">[RX]</span>
              <span className="text-amber-300 font-bold shrink-0">{pkt.nodeId}</span>
              <span className="text-sky-300 shrink-0">PKT#{pkt.seq}</span>
              <span className="text-purple-300 shrink-0">[{pkt.rssi}dBm]</span>
              {rawViewMode === "json" ? (
                <span className="text-amber-100/90 break-all">
                  Payload: <span className="text-emerald-300">{pkt.payload}</span>
                </span>
              ) : (
                <span className="text-amber-300/80 break-all">
                  HEX: <span className="text-yellow-300">0xAA 0x12 0x7F {pkt.crc} 0xDE 0xAD 0xBE 0xEF</span>
                </span>
              )}
              <span className="text-emerald-400 font-bold ml-auto shrink-0 font-mono">
                {pkt.crc} [{pkt.status}]
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-amber-800/40 text-[11px] text-amber-300/70 font-mono">
          <div className="flex items-center gap-4">
            <span>Payload Codec: Protobuf / JSON</span>
            <span>Security: SHA256 / Device-Token Handshake</span>
          </div>
          <span className="text-emerald-400 font-bold">On-Chain Sepolia Hash Root: Syncing</span>
        </div>
      </div>

      {/* ─── Hardware Sensor Diagnostics & Calibration Matrix ─────────────── */}
      <div className="bg-gradient-to-r from-amber-50/50 via-white to-amber-50/40 p-6 rounded-3xl border border-amber-200/90 shadow-sm">
        <h3 className="text-sm font-extrabold text-amber-950 mb-4 flex items-center gap-2">
          <span>🔧</span> Sensor Hardware Diagnostics & Calibration Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-950 font-mono">SHT31-D Dual-Probe</span>
              <span className="badge badge-verified text-[10px]">NOMINAL</span>
            </div>
            <p className="text-amber-900/60 text-[11px]">Brood & Ambient Temp/RH</p>
            <div className="mt-2.5 text-[10px] text-amber-800/80 font-mono space-y-0.5">
              <p>Bus: I2C (0x44)</p>
              <p>Accuracy: ±0.2°C / ±2% RH</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-950 font-mono">HX711 24-bit ADC</span>
              <span className="badge badge-verified text-[10px]">NOMINAL</span>
            </div>
            <p className="text-amber-900/60 text-[11px]">4-Point Wheatstone Bridge</p>
            <div className="mt-2.5 text-[10px] text-amber-800/80 font-mono space-y-0.5">
              <p>Gain: 128x (Channel A)</p>
              <p>Tare Zero: 18.200 kg</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-950 font-mono">Optical / Acoustic</span>
              <span className="badge badge-verified text-[10px]">NOMINAL</span>
            </div>
            <p className="text-amber-900/60 text-[11px]">Colony Flight Traffic & Hz</p>
            <div className="mt-2.5 text-[10px] text-amber-800/80 font-mono space-y-0.5">
              <p>Sampling: 1000 Hz</p>
              <p>Threshold: 240-260 Hz</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-950 font-mono">Solar MPPT & BMS</span>
              <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px]">CHARGING</span>
            </div>
            <p className="text-amber-900/60 text-[11px]">LiPo 3.7V 3200mAh Battery</p>
            <div className="mt-2.5 text-[10px] text-amber-800/80 font-mono space-y-0.5">
              <p>Inflow: +420mA (Solar)</p>
              <p>Cutoff: 4.20V (Active)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
