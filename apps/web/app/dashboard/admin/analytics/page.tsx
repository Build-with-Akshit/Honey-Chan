"use client";

import { useEffect, useState } from "react";


export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics", { cache: "no-store" });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">National Honey Analytics</h1>
          <p className="text-xs text-gray-500">Smart Automation & Authenticity Metrics</p>
        </div>
          <span className="badge badge-info">EXECUTIVE DASHBOARD</span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center bg-white rounded-xl border border-gray-100">
            <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* 4 Big KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Traceable Honey", val: data?.kpis?.totalTraceableHoney || "0 Tons", icon: "🍯", sub: "Based on blockchain txs", color: "text-amber-800" },
                { label: "Counterfeit Attempt Preventions", val: data?.kpis?.flagged || "0 Flagged", icon: "🛡️", sub: "Tamper detection active", color: "text-red-700" },
                { label: "Average Hive Health Index", val: data?.kpis?.avgHiveHealth || "0%", icon: "❤️", sub: "Based on smart hives", color: "text-emerald-700" },
                { label: "Verified Producer Premium", val: data?.kpis?.premium || "+0%", icon: "📈", sub: "Direct rural farmer margin", color: "text-blue-800" },
              ].map((c) => (
                <div key={c.label} className="card p-5 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500">{c.label}</p>
                      <p className={`text-2xl font-black mt-1 ${c.color}`}>{c.val}</p>
                      <p className="text-[10px] text-gray-400 mt-2">{c.sub}</p>
                    </div>
                    <span className="text-2xl">{c.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Regional Breakdown Table */}
            <div className="card p-6 bg-white space-y-4">
              <h2 className="font-bold text-sm text-gray-800">📍 Regional Production & Quality Compliance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400">
                      <th className="pb-3 font-semibold">State / Region</th>
                      <th className="pb-3 font-semibold">KVIC Cluster</th>
                      <th className="pb-3 font-semibold">Beekeepers</th>
                      <th className="pb-3 font-semibold">Yield (Tons)</th>
                      <th className="pb-3 font-semibold">FSSAI Compliance</th>
                      <th className="pb-3 font-semibold">Authenticity Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {data?.regions?.length > 0 ? data.regions.map((region: any, i: number) => (
                      <tr key={i}>
                        <td className="py-3 font-medium">{region.state}</td>
                        <td>{region.cluster}</td>
                        <td>{region.beekeepers}</td>
                        <td className="font-bold text-amber-700">{region.yieldTons} T</td>
                        <td><span className="badge badge-verified">{region.compliance}</span></td>
                        <td className="font-bold text-emerald-700">{region.authenticityScore}/100</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">No regional data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
