"use client";

import { useState, useEffect } from "react";

// Demo data
const DEMO_STATS = [
  { label: "Total Hives", value: "24", icon: "🐝", change: "+3 this month", color: "text-amber-700" },
  { label: "Active Batches", value: "8", icon: "🍯", change: "5 verified", color: "text-green-700" },
  { label: "Honey Produced", value: "486 KG", icon: "⚖️", change: "+62 KG this month", color: "text-blue-700" },
  { label: "Avg Hive Health", value: "91%", icon: "❤️", change: "Excellent", color: "text-emerald-700" },
];

const DEMO_HIVES = [
  { id: "HIVE-001", location: "Sonipat, Haryana", flower: "Mustard", health: 94, temp: 34.2, humidity: 65, weight: 42.1, status: "active" },
  { id: "HIVE-003", location: "Sonipat, Haryana", flower: "Eucalyptus", health: 88, temp: 33.8, humidity: 68, weight: 38.5, status: "active" },
  { id: "HIVE-007", location: "Sonipat, Haryana", flower: "Mustard", health: 91, temp: 34.5, humidity: 67, weight: 38.4, status: "active" },
  { id: "HIVE-012", location: "Panipat, Haryana", flower: "Litchi", health: 72, temp: 36.1, humidity: 75, weight: 31.2, status: "warning" },
  { id: "HIVE-018", location: "Panipat, Haryana", flower: "Sunflower", health: 96, temp: 33.9, humidity: 62, weight: 45.8, status: "active" },
];

const DEMO_BATCHES = [
  { id: "HC-2026-000127", honey: "Mustard Flower", qty: "18.5 KG", date: "22 Aug 2026", status: "Verified", badgeClass: "badge-verified" },
  { id: "HC-2026-000125", honey: "Eucalyptus", qty: "22.0 KG", date: "18 Aug 2026", status: "Processing", badgeClass: "badge-processing" },
  { id: "HC-2026-000121", honey: "Litchi", qty: "15.2 KG", date: "12 Aug 2026", status: "Lab Testing", badgeClass: "badge-tested" },
  { id: "HC-2026-000118", honey: "Mustard Flower", qty: "28.4 KG", date: "05 Aug 2026", status: "Distributed", badgeClass: "badge-distributed" },
];

const DEMO_ALERTS = [
  { type: "warning", message: "HIVE-012: Elevated temperature (36.1°C) — monitor closely", time: "2 hours ago" },
  { type: "info", message: "AI Prediction: HIVE-018 harvest window in 3-5 days", time: "6 hours ago" },
];

function getHealthColor(health: number) {
  if (health >= 90) return "bg-green-500";
  if (health >= 75) return "bg-amber-500";
  return "bg-red-500";
}

function getHealthBg(health: number) {
  if (health >= 90) return "bg-green-100";
  if (health >= 75) return "bg-amber-100";
  return "bg-red-100";
}

export default function BeekeeperDashboard() {
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Beekeeper Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back • {liveTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full pulse-dot" />
          <span className="text-green-600 font-medium">IoT Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_STATS.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-400 text-xs mt-2">{stat.change}</p>
              </div>
              <span className="text-3xl opacity-60">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {DEMO_ALERTS.length > 0 && (
        <div className="space-y-2">
          {DEMO_ALERTS.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                alert.type === "warning"
                  ? "bg-orange-50 border border-orange-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <span>{alert.type === "warning" ? "⚠️" : "💡"}</span>
              <span className={`text-sm flex-1 ${alert.type === "warning" ? "text-orange-700" : "text-blue-700"}`}>
                {alert.message}
              </span>
              <span className="text-xs text-gray-400">{alert.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hives */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-4 border-b border-amber-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              🐝 My Hives
            </h2>
            <span className="text-xs text-gray-400">{DEMO_HIVES.length} active</span>
          </div>
          <div className="divide-y divide-gray-100">
            {DEMO_HIVES.map((hive) => (
              <div key={hive.id} className="p-4 hover:bg-amber-50/40 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-amber-700 font-semibold text-sm">{hive.id}</span>
                    {hive.status === "warning" && (
                      <span className="badge badge-warning">⚠ ATTENTION</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 health-bar">
                      <div
                        className={`health-bar-fill ${getHealthColor(hive.health)}`}
                        style={{ width: `${hive.health}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{hive.health}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Temp</span>
                    <p className={`font-medium mt-0.5 ${hive.temp > 35 ? "text-red-600" : "text-gray-700"}`}>
                      {hive.temp}°C
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Humidity</span>
                    <p className="font-medium mt-0.5 text-gray-700">{hive.humidity}%</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Weight</span>
                    <p className="font-medium mt-0.5 text-gray-700">{hive.weight} kg</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Flower</span>
                    <p className="font-medium mt-0.5 text-gray-700">{hive.flower}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Batches */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-amber-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              🍯 Recent Batches
            </h2>
            <button className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors">
              View All →
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {DEMO_BATCHES.map((batch) => (
              <div key={batch.id} className="p-4 hover:bg-amber-50/40 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm text-gray-700 font-medium">{batch.id}</span>
                  <span className={`badge ${batch.badgeClass}`}>{batch.status}</span>
                </div>
                <p className="text-xs text-gray-500">{batch.honey} • {batch.qty}</p>
                <p className="text-xs text-gray-400 mt-1">{batch.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🧠</span>
          <h2 className="font-semibold text-gray-700">AI Hive Intelligence</h2>
          <span className="badge badge-info">AI-ASSISTED</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Health Score */}
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <p className="text-gray-500 text-xs mb-1">Overall Health Score</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-emerald-700">91</span>
              <span className="text-gray-400 text-sm mb-1">/100</span>
            </div>
            <div className="mt-2 health-bar">
              <div className="health-bar-fill bg-emerald-500" style={{ width: "91%" }} />
            </div>
            <p className="text-xs text-emerald-600 mt-2 font-medium">🟢 Excellent condition</p>
          </div>

          {/* Risk */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <p className="text-gray-500 text-xs mb-1">Risk Assessment</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-green-700">LOW</span>
              <span>🟢</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              1 hive (HIVE-012) requires monitoring. Temperature trending above normal.
            </p>
          </div>

          {/* Productivity */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-gray-500 text-xs mb-1">Productivity Forecast</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-3xl font-bold text-blue-700">18.6</span>
              <span className="text-gray-400 text-sm mb-1">KG</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              HIVE-007 • Confidence: 81% • Window: 5-8 days
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-800">
            💡 <strong>AI Recommendation:</strong> Conditions appear favorable for continued colony activity.
            Monitor HIVE-012 humidity closely over the next 24 hours. HIVE-018 shows strong harvest potential.
          </p>
        </div>
      </div>
    </div>
  );
}
