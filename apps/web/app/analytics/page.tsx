"use client";

import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <Link
              href="/dashboard/admin"
              className="w-9 h-9 shrink-0 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-amber-800 hover:bg-amber-50 font-bold transition-colors"
            >
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">National Honey Analytics</h1>
              <p className="text-xs text-gray-500 mt-1 sm:mt-0">Smart Automation & Authenticity Metrics</p>
            </div>
          </div>
          <span className="badge badge-info whitespace-nowrap shrink-0 w-fit">EXECUTIVE DASHBOARD</span>
        </div>

        {/* 4 Big KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Traceable Honey", val: "182.4 Tons", icon: "🍯", sub: "+18.2% vs last quarter", color: "text-amber-800" },
            { label: "Counterfeit Attempt Preventions", val: "31 Flagged", icon: "🛡️", sub: "Tamper detection active", color: "text-red-700" },
            { label: "Average Hive Health Index", val: "88.6%", icon: "❤️", sub: "Based on 8,492 smart hives", color: "text-emerald-700" },
            { label: "Verified Producer Premium", val: "+24.5%", icon: "📈", sub: "Direct rural farmer margin", color: "text-blue-800" },
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
            <table className="w-full text-left text-xs whitespace-nowrap">
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
                <tr>
                  <td className="py-3 font-medium">Haryana</td>
                  <td>Sonipat Honey Cluster</td>
                  <td>84</td>
                  <td className="font-bold text-amber-700">4.8 T</td>
                  <td><span className="badge badge-verified">100% PASS</span></td>
                  <td className="font-bold text-emerald-700">96.4/100</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Uttar Pradesh</td>
                  <td>Moradabad Honey Cluster</td>
                  <td>62</td>
                  <td className="font-bold text-amber-700">3.6 T</td>
                  <td><span className="badge badge-verified">98.2% PASS</span></td>
                  <td className="font-bold text-emerald-700">92.1/100</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Rajasthan</td>
                  <td>Alwar Mustard Cluster</td>
                  <td>95</td>
                  <td className="font-bold text-amber-700">5.2 T</td>
                  <td><span className="badge badge-verified">100% PASS</span></td>
                  <td className="font-bold text-emerald-700">98.0/100</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Maharashtra</td>
                  <td>Pune Rural Cluster</td>
                  <td>48</td>
                  <td className="font-bold text-amber-700">2.8 T</td>
                  <td><span className="badge badge-verified">99.1% PASS</span></td>
                  <td className="font-bold text-emerald-700">94.5/100</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
