"use client";

import { Card } from "@/components/ui/Card";
import {
  Users,
  Box,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Scale,
  MapPin,
  Activity,
  Clock,
} from "lucide-react";

const ADMIN_STATS = [
  { label: "Beekeepers", value: "1,248", icon: <Users size={18} />, color: "text-[var(--honey-600)]", bg: "bg-[var(--honey-50)]" },
  { label: "Active Hives", value: "8,492", icon: <Box size={18} />, color: "text-[var(--color-success)]", bg: "bg-[var(--color-success-bg)]" },
  { label: "Batches", value: "4,832", icon: <FlaskConical size={18} />, color: "text-[var(--color-info)]", bg: "bg-[var(--color-info-bg)]" },
  { label: "Verified", value: "4,721", icon: <CheckCircle2 size={18} />, color: "text-[var(--color-success)]", bg: "bg-[var(--color-success-bg)]" },
  { label: "Flagged", value: "31", icon: <AlertTriangle size={18} />, color: "text-[var(--color-danger)]", bg: "bg-[var(--color-danger-bg)]" },
  { label: "Total Tracked", value: "182.4 T", icon: <Scale size={18} />, color: "text-purple-600", bg: "bg-purple-50" },
];

const CLUSTERS = [
  { name: "Sonipat Honey Cluster", state: "Haryana", beekeepers: 84, hives: 1200, batches: 184, health: 87, production: "4.8 T" },
  { name: "Moradabad Cluster", state: "UP", beekeepers: 62, hives: 890, batches: 142, health: 82, production: "3.6 T" },
  { name: "Alwar Cluster", state: "Rajasthan", beekeepers: 95, hives: 1450, batches: 210, health: 90, production: "5.2 T" },
  { name: "Pune Cluster", state: "Maharashtra", beekeepers: 48, hives: 680, batches: 98, health: 85, production: "2.8 T" },
];

const RECENT_ACTIVITY = [
  { action: "Batch HC-2026-000127 verified", actor: "Quality Lab", time: "5 min ago", icon: <CheckCircle2 size={14} className="text-[var(--color-success)]" /> },
  { action: "New beekeeper registered", actor: "Ramesh Kumar", time: "1 hour ago", icon: <Users size={14} className="text-[var(--honey-600)]" /> },
  { action: "Flagged: Batch HC-2026-000089", actor: "System", time: "2 hours ago", icon: <AlertTriangle size={14} className="text-[var(--color-danger)]" /> },
  { action: "Cluster report generated", actor: "Sonipat", time: "4 hours ago", icon: <MapPin size={14} className="text-[var(--color-info)]" /> },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
          Admin Dashboard
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          HoneyChain platform overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {ADMIN_STATS.map((stat) => (
          <Card key={stat.label} className="p-4 text-center">
            <div className={`w-9 h-9 rounded-[var(--radius-md)] ${stat.bg} flex items-center justify-center ${stat.color} mx-auto`}>
              {stat.icon}
            </div>
            <p className={`text-xl font-bold mt-2 ${stat.color} font-[family-name:var(--font-outfit)] tabular-data`}>
              {stat.value}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clusters */}
        <Card className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--border-default)]">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-[var(--text-primary)]">
              <MapPin size={14} className="text-[var(--honey-600)]" />
              KVIC Beekeeping Clusters
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {CLUSTERS.map((cluster) => (
              <div key={cluster.name} className="p-4 hover:bg-[var(--bg-muted)] transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-sm text-[var(--text-primary)]">{cluster.name}</span>
                    <span className="text-xs text-[var(--text-muted)] ml-2">{cluster.state}</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--honey-600)]">{cluster.production}</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[var(--text-muted)]">Beekeepers</span>
                    <p className="font-semibold text-[var(--text-primary)]">{cluster.beekeepers}</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Hives</span>
                    <p className="font-semibold text-[var(--text-primary)]">{cluster.hives.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Batches</span>
                    <p className="font-semibold text-[var(--text-primary)]">{cluster.batches}</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Health</span>
                    <p className={`font-semibold ${cluster.health >= 85 ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"}`}>
                      {cluster.health}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--border-default)]">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-[var(--text-primary)]">
              <Activity size={14} className="text-[var(--honey-600)]" />
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-muted)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] font-medium">{item.action}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.actor} · {item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
