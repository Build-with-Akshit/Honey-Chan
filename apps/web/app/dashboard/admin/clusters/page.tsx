"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MapPin, Users, Box, Heart, Scale } from "lucide-react";

export default function AdminClustersPage() {
  const [clusters, setClusters] = useState<any[]>([]);

  useEffect(() => {
    honeyApi.getClusters().then(setClusters).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
          KVIC Beekeeping Clusters
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Ministry of MSME rural cluster management & regional yield oversight
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {clusters.map((cluster) => (
          <Card key={cluster.id} className="p-5 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--honey-50)] flex items-center justify-center text-[var(--honey-600)]">
                <MapPin size={18} />
              </div>
              <StatusBadge state="pass" label="ACTIVE" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
                {cluster.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">{cluster.district}, {cluster.state}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-[var(--border-default)]">
              <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-muted)]">
                <span className="text-[var(--text-muted)] flex items-center gap-1 text-[10px]">
                  <Users size={10} />
                  Beekeepers
                </span>
                <span className="font-bold text-[var(--text-primary)]">{cluster.totalBeekeepers}</span>
              </div>
              <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-muted)]">
                <span className="text-[var(--text-muted)] flex items-center gap-1 text-[10px]">
                  <Box size={10} />
                  Smart Hives
                </span>
                <span className="font-bold text-[var(--text-primary)]">{cluster.totalHives}</span>
              </div>
              <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-muted)]">
                <span className="text-[var(--text-muted)] flex items-center gap-1 text-[10px]">
                  <Heart size={10} />
                  Avg Health
                </span>
                <span className="font-bold text-[var(--color-success)]">{cluster.avgHealth}%</span>
              </div>
              <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-muted)]">
                <span className="text-[var(--text-muted)] flex items-center gap-1 text-[10px]">
                  <Scale size={10} />
                  Production
                </span>
                <span className="font-bold text-[var(--honey-600)]">{cluster.totalProductionTons} T</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
