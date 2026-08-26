
"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import Link from "next/link";

function getHealthColor(health: number) {
  if (health >= 90) return "bg-green-500";
  if (health >= 75) return "bg-amber-500";
  return "bg-red-500";
}

export default function BeekeeperDashboard() {
  const [liveTime, setLiveTime] = useState(new Date());
  const [hives, setHives] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([honeyApi.getHives(), honeyApi.getBatches()])
      .then(([hivesData, batchesData]) => {
        setHives(hivesData || []);
        setBatches(batchesData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalHives = hives.length;
  const activeBatches = batches.filter(b => b.status !== "DISTRIBUTED" && b.status !== "RETAIL").length;
  const honeyProduced = batches.reduce((acc, b) => acc + Number(b.quantity || 0), 0);
  const avgHealth = hives.length ? Math.round(hives.reduce((acc, h) => acc + (h.healthScore || 85), 0) / hives.length) : 0;

  const alerts = hives
    .filter(h => h.latestReading?.temperature > 35 || (h.healthScore && h.healthScore < 80))
    .map(h => ({
      type: "warning",
      message: `${h.hiveCode}: Elevated temp/low health — monitor closely`,
      time: "Recent"
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Beekeeper Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back • {liveTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full pulse-dot" />
            <span className="text-green-600 font-medium">IoT Active</span>
          </div>
          <Link 
            href="/batches/create"
            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2 px-4 rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <span>🍯</span> Harvest & Create Batch
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Hives</p>
                  <p className="text-3xl font-bold mt-1 text-amber-700">{totalHives}</p>
                  <p className="text-gray-400 text-xs mt-2">Active colonies</p>
                </div>
                <span className="text-3xl opacity-60">🐝</span>
              </div>
            </div>
            
            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Batches</p>
                  <p className="text-3xl font-bold mt-1 text-green-700">{activeBatches}</p>
                  <p className="text-gray-400 text-xs mt-2">In supply chain</p>
                </div>
                <span className="text-3xl opacity-60">🍯</span>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Honey Produced</p>
                  <p className="text-3xl font-bold mt-1 text-blue-700">{honeyProduced.toFixed(1)} KG</p>
                  <p className="text-gray-400 text-xs mt-2">Total lifetime yield</p>
                </div>
                <span className="text-3xl opacity-60">⚖️</span>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Hive Health</p>
                  <p className="text-3xl font-bold mt-1 text-emerald-700">{avgHealth}%</p>
                  <p className="text-gray-400 text-xs mt-2">{avgHealth > 85 ? "Excellent" : "Needs Attention"}</p>
                </div>
                <span className="text-3xl opacity-60">❤️</span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200"
                >
                  <span>⚠️</span>
                  <span className="text-sm flex-1 text-orange-700">
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
            <div className="lg:col-span-2 card overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-amber-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                  🐝 My Hives
                </h2>
                <span className="text-xs text-gray-400">{hives.length} active</span>
              </div>
              <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[400px]">
                {hives.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No hives found.</div>
                ) : (
                  hives.map((hive) => (
                    <div key={hive.id} className="p-4 hover:bg-amber-50/40 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-amber-700 font-semibold text-sm">{hive.hiveCode}</span>
                          {(hive.healthScore || 85) < 80 && (
                            <span className="badge badge-warning">⚠ ATTENTION</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 health-bar">
                            <div
                              className={`health-bar-fill ${getHealthColor(hive.healthScore || 85)}`}
                              style={{ width: `${hive.healthScore || 85}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">{hive.healthScore || 85}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400">Temp</span>
                          <p className={`font-medium mt-0.5 ${(hive.latestReading?.temperature || 34) > 35 ? "text-red-600" : "text-gray-700"}`}>
                            {hive.latestReading?.temperature || "--"}°C
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Humidity</span>
                          <p className="font-medium mt-0.5 text-gray-700">{hive.latestReading?.humidity || "--"}%</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Weight</span>
                          <p className="font-medium mt-0.5 text-gray-700">{hive.latestReading?.weight || "--"} kg</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Flower</span>
                          <p className="font-medium mt-0.5 text-gray-700">{hive.flowerSource || "Unknown"}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Batches */}
            <div className="card overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-amber-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                  🍯 Recent Batches
                </h2>
                <Link href="/dashboard/beekeeper/batches" className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors">
                  View All →
                </Link>
              </div>
              <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[400px]">
                {batches.length === 0 ? (
                   <div className="p-8 text-center text-gray-500 text-sm">No batches found.</div>
                ) : (
                  batches.slice(0, 5).map((batch) => (
                    <div key={batch.id} className="p-4 hover:bg-amber-50/40 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm text-gray-700 font-medium">{batch.batchId}</span>
                        <span className="badge bg-amber-100 text-amber-800">{batch.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">{batch.honeyType} • {batch.quantity} KG</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(batch.harvestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          {hives.length > 0 && (
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
                    <span className="text-4xl font-bold text-emerald-700">{avgHealth}</span>
                    <span className="text-gray-400 text-sm mb-1">/100</span>
                  </div>
                  <div className="mt-2 health-bar">
                    <div className="health-bar-fill bg-emerald-500" style={{ width: `${avgHealth}%` }} />
                  </div>
                  <p className="text-xs text-emerald-600 mt-2 font-medium">
                    {avgHealth > 85 ? "🟢 Excellent condition" : "🟡 Needs attention"}
                  </p>
                </div>

                {/* Risk */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-gray-500 text-xs mb-1">Risk Assessment</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-bold text-green-700">LOW</span>
                    <span>🟢</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    {alerts.length > 0 ? `${alerts.length} hives require monitoring.` : "All hives operating normally."}
                  </p>
                </div>

                {/* Productivity */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-gray-500 text-xs mb-1">Productivity Forecast</p>
                  <div className="flex items-end gap-2 mt-2">
                    <span className="text-3xl font-bold text-blue-700">{(hives.length * 15.5).toFixed(1)}</span>
                    <span className="text-gray-400 text-sm mb-1">KG</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Estimated yield across {hives.length} active hives in next 10 days
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
