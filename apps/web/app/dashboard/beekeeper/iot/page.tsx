"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function BeekeeperIoTPage() {
  const [hives, setHives] = useState<any[]>([]);
  const [selectedHiveCode, setSelectedHiveCode] = useState("HIVE-007");
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const loadHives = async () => {
    try {
      const list = await honeyApi.getHives();
      setHives(list);
    } catch (err) {
      console.error("Failed to load hives:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHives();
    const interval = setInterval(loadHives, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentHive = hives.find((h) => h.hiveCode === selectedHiveCode) || hives[0];

  const triggerReading = async (tempMod = 0, humMod = 0, weightMod = 0) => {
    if (!currentHive) return;
    setStreaming(true);
    try {
      const base = currentHive.latestReading || {
        temperature: 34.2,
        humidity: 65.4,
        weight: 38.4,
        beeActivity: 0.88,
        battery: 92,
      };
      
      await honeyApi.postReading({
        hiveCode: currentHive.hiveCode,
        temperature: Number((base.temperature + tempMod + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        humidity: Number((base.humidity + humMod + (Math.random() * 1.0 - 0.5)).toFixed(1)),
        weight: Number((base.weight + weightMod).toFixed(1)),
        beeActivity: Number(Math.min(0.98, Math.max(0.5, base.beeActivity + (Math.random() * 0.1 - 0.05))).toFixed(2)),
        battery: base.battery,
      });
      setLastAction(`Updated ${currentHive.hiveCode} telemetry reading`);
      await loadHives();
    } catch (err: any) {
      setLastAction(`Error: ${err.message}`);
    } finally {
      setStreaming(false);
    }
  };

  if (loading && !currentHive) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="animate-spin h-7 w-7 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs">Connecting to IoT Telemetry Gateway...</p>
      </div>
    );
  }

  const mockHistory = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setSeconds(d.getSeconds() - (11 - i) * 4);
    return {
      temperature: Number((34.0 + Math.random() * 0.8 - 0.4).toFixed(1)),
      humidity: Number((65.0 + Math.random() * 2 - 1).toFixed(1)),
      weight: Number((38.0 + (12 - i) * 0.05).toFixed(1)), // Simulating steady weight increase over time
      beeActivity: 0.85 + Math.random() * 0.1,
      battery: 92,
      timestamp: d.toISOString(),
    };
  }).reverse(); // Oldest to newest in mock generation, though logic reverses it later

  const history = currentHive?.readingsHistory?.length > 0 ? currentHive.readingsHistory : mockHistory;
  const latest = currentHive?.latestReading || history[0];

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
  };

  const chartData = history.slice(0, 12).reverse().map((r: any) => ({
    ...r,
    timeLabel: formatTime(r.timestamp)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IoT Hive Climate & Telemetry</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time environmental sensor stream • Hardware Agnostic (ESP32 & Simulator)
          </p>
        </div>

        {/* Hive Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-600">Active Hive:</span>
          <select
            value={selectedHiveCode}
            onChange={(e) => setSelectedHiveCode(e.target.value)}
            className="text-xs font-bold text-amber-800 bg-transparent focus:outline-none cursor-pointer"
          >
            {hives.map((h) => (
              <option key={h.id} value={h.hiveCode}>
                {h.hiveCode} ({h.flowerSource})
              </option>
            ))}
          </select>
        </div>
      </div>


      {/* 4 Sensor Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature */}
        <div className="card p-5 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Brood Temperature</p>
              <p className="text-3xl font-extrabold text-amber-700 mt-1">
                {latest.temperature}°C
              </p>
              <span className={`badge mt-2 ${latest.temperature >= 33.5 && latest.temperature <= 35.5 ? "badge-verified" : "badge-warning"}`}>
                {latest.temperature >= 33.5 && latest.temperature <= 35.5 ? "✓ Optimal Brood (34°C)" : "Deviation Flagged"}
              </span>
            </div>
            <span className="text-3xl">🌡️</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="card p-5 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Internal Humidity</p>
              <p className="text-3xl font-extrabold text-blue-700 mt-1">
                {latest.humidity}%
              </p>
              <span className={`badge mt-2 ${latest.humidity >= 55 && latest.humidity <= 70 ? "badge-verified" : "badge-info"}`}>
                {latest.humidity >= 55 && latest.humidity <= 70 ? "✓ Curing Range (55-70%)" : "Ventilation Active"}
              </span>
            </div>
            <span className="text-3xl">💧</span>
          </div>
        </div>

        {/* Weight */}
        <div className="card p-5 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Net Hive Weight</p>
              <p className="text-3xl font-extrabold text-emerald-700 mt-1">
                {latest.weight} <span className="text-sm font-normal text-gray-500">KG</span>
              </p>
              <span className="badge badge-verified mt-2">
                +{(latest.weight - 22).toFixed(1)} kg Honey Accumulation
              </span>
            </div>
            <span className="text-3xl">⚖️</span>
          </div>
        </div>

        {/* Bee Activity / Battery */}
        <div className="card p-5 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Foraging Traffic Index</p>
              <p className="text-3xl font-extrabold text-purple-700 mt-1">
                {Math.round(latest.beeActivity * 100)}%
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-500">
                <span>🔋 Battery: {latest.battery}%</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
              </div>
            </div>
            <span className="text-3xl">🐝</span>
          </div>
        </div>
      </div>

      {/* SVG Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend */}
        <div className="card p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">🌡️ Temperature Trend (Live)</h3>
            <span className="text-xs text-gray-400">Target: 34.0°C</span>
          </div>
          <div className="h-44 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fef3c7" />
                <XAxis dataKey="timeLabel" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} minTickGap={15} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}°`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                  labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                  itemStyle={{ color: '#d97706', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="temperature" stroke="#fbbf24" strokeWidth={3} dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weight Trend */}
        <div className="card p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">⚖️ Weight Accumulation (Live)</h3>
            <span className="text-xs text-emerald-700 font-semibold">+0.6 kg today</span>
          </div>
          <div className="h-44 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d1fae5" />
                <XAxis dataKey="timeLabel" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} minTickGap={15} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                  labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                  itemStyle={{ color: '#047857', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={3} dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
