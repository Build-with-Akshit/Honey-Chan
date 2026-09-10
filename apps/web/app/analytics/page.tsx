"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ArrowLeft,
  Scale,
  Shield,
  Heart,
  TrendingUp,
  MapPin,
  Users,
  CheckCircle2,
} from "lucide-react";

const KPI_CARDS = [
  { label: "Total Traceable Honey", val: "182.4 Tons", icon: <Scale size={20} />, sub: "+18.2% vs last quarter", color: "text-[var(--honey-600)]", bg: "bg-[var(--honey-50)]" },
  { label: "Counterfeit Preventions", val: "31 Flagged", icon: <Shield size={20} />, sub: "Tamper detection active", color: "text-[var(--color-danger)]", bg: "bg-[var(--color-danger-bg)]" },
  { label: "Avg Hive Health Index", val: "88.6%", icon: <Heart size={20} />, sub: "Based on 8,492 hives", color: "text-[var(--color-success)]", bg: "bg-[var(--color-success-bg)]" },
  { label: "Verified Producer Premium", val: "+24.5%", icon: <TrendingUp size={20} />, sub: "Direct rural farmer margin", color: "text-[var(--color-info)]", bg: "bg-[var(--color-info-bg)]" },
];

const REGIONAL_DATA = [
  { state: "Haryana", cluster: "Sonipat Honey Cluster", beekeepers: 84, yield: "4.8 T", compliance: "100% PASS", score: "96.4/100" },
  { state: "Uttar Pradesh", cluster: "Moradabad Cluster", beekeepers: 62, yield: "3.6 T", compliance: "98.2% PASS", score: "92.1/100" },
  { state: "Rajasthan", cluster: "Alwar Mustard Cluster", beekeepers: 95, yield: "5.2 T", compliance: "100% PASS", score: "98.0/100" },
  { state: "Maharashtra", cluster: "Pune Rural Cluster", beekeepers: 48, yield: "2.8 T", compliance: "99.1% PASS", score: "94.5/100" },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-[var(--radius-md)] bg-white border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
                National Honey Analytics
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">Executive Dashboard</p>
            </div>
          </div>
          <StatusBadge state="info" label="EXECUTIVE" showDot={false} />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS.map((c) => (
            <Card key={c.label} className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{c.label}</p>
                  <p className={`text-xl font-bold mt-1.5 ${c.color} font-[family-name:var(--font-outfit)] tabular-data`}>{c.val}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5">{c.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-[var(--radius-md)] ${c.bg} flex items-center justify-center ${c.color}`}>
                  {c.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Regional Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--border-default)]">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-[var(--text-primary)]">
              <MapPin size={14} className="text-[var(--honey-600)]" />
              Regional Production & Quality Compliance
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-muted)]">
                <tr className="text-[var(--text-muted)] font-semibold">
                  <th className="px-5 py-3">State</th>
                  <th className="px-5 py-3">Cluster</th>
                  <th className="px-5 py-3">Beekeepers</th>
                  <th className="px-5 py-3">Yield</th>
                  <th className="px-5 py-3">FSSAI Compliance</th>
                  <th className="px-5 py-3">Authenticity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)] text-[var(--text-secondary)]">
                {REGIONAL_DATA.map((row) => (
                  <tr key={row.state} className="hover:bg-[var(--bg-muted)] transition-colors">
                    <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{row.state}</td>
                    <td className="px-5 py-3">{row.cluster}</td>
                    <td className="px-5 py-3 tabular-data">{row.beekeepers}</td>
                    <td className="px-5 py-3 font-bold text-[var(--honey-600)] tabular-data">{row.yield}</td>
                    <td className="px-5 py-3">
                      <StatusBadge state="pass" label={row.compliance} />
                    </td>
                    <td className="px-5 py-3 font-bold text-[var(--color-success)] tabular-data">{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
