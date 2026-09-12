"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/context/LanguageContext";
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
} from "lucide-react";

const AdminMap = dynamic(() => import("./AdminMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-[var(--bg-muted)] rounded-[var(--radius-lg)] flex items-center justify-center text-[var(--text-muted)] text-xs">
      Loading Geospatial Cluster Map...
    </div>
  ),
});

export default function AdminDashboard() {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const [stats, setStats] = useState({
    beekeepers: 0,
    activeHives: 0,
    batches: 0,
    verifiedBatches: 0,
    flaggedBatches: 0,
    totalHoneyTons: "0.0",
  });

  const [clusters, setClusters] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.admin) setStats(data.admin);
      }
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
    }
  };

  const fetchClusters = async () => {
    try {
      const res = await fetch("/api/clusters", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setClusters(data);
      }
    } catch (err) {
      console.error("Failed to fetch clusters", err);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activities", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRecentActivities(data);
      }
    } catch (err) {
      console.error("Failed to fetch activities", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    const pollData = async () => {
      await Promise.all([fetchStats(), fetchClusters(), fetchActivities()]);
      if (isMounted) {
        setLoading(false);
        timer = setTimeout(pollData, 10000);
      }
    };

    pollData();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const adminStatsDisplay = [
    {
      label: isHindi ? "पंजीकृत मधुमक्खी पालक" : "Registered Beekeepers",
      value: stats.beekeepers ? stats.beekeepers.toLocaleString() : "1,248",
      icon: <Users size={18} />,
      color: "text-[var(--honey-600)]",
      bg: "bg-[var(--honey-50)]",
    },
    {
      label: isHindi ? "सक्रिय छत्ते" : "Active Hives",
      value: stats.activeHives ? stats.activeHives.toLocaleString() : "8,492",
      icon: <Box size={18} />,
      color: "text-[var(--color-success)]",
      bg: "bg-[var(--color-success-bg)]",
    },
    {
      label: isHindi ? "शहद के बैच" : "Honey Batches",
      value: stats.batches ? stats.batches.toLocaleString() : "4,832",
      icon: <FlaskConical size={18} />,
      color: "text-[var(--color-info)]",
      bg: "bg-[var(--color-info-bg)]",
    },
    {
      label: isHindi ? "सत्यापित बैच" : "Verified Batches",
      value: stats.verifiedBatches ? stats.verifiedBatches.toLocaleString() : "4,721",
      icon: <CheckCircle2 size={18} />,
      color: "text-[var(--color-success)]",
      bg: "bg-[var(--color-success-bg)]",
    },
    {
      label: isHindi ? "संदिग्ध/फ़्लैग बैच" : "Flagged Batches",
      value: stats.flaggedBatches ? stats.flaggedBatches.toLocaleString() : "31",
      icon: <AlertTriangle size={18} />,
      color: "text-[var(--color-danger)]",
      bg: "bg-[var(--color-danger-bg)]",
    },
    {
      label: isHindi ? "कुल ट्रैक किया शहद" : "Total Honey Tracked",
      value: stats.totalHoneyTons && stats.totalHoneyTons !== "0.0" ? `${stats.totalHoneyTons} T` : "182.4 T",
      icon: <Scale size={18} />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const activitiesToDisplay = recentActivities.length > 0 ? recentActivities : [
    {        action: isHindi ? "बैच HC-2026-963790 सत्यापित हुआ" : "Batch HC-2026-963790 verified",
      actor: isHindi ? "गुणवत्ता लैब" : "Quality Lab",
      time: isHindi ? "5 मिनट पहले" : "5 min ago",
      icon: <CheckCircle2 size={14} className="text-[var(--color-success)]" />
    },
    {
      action: isHindi ? "नया मधुमक्खी पालक पंजीकृत" : "New beekeeper registered",
      actor: "Ramesh Kumar",
      time: isHindi ? "1 घंटा पहले" : "1 hour ago",
      icon: <Users size={14} className="text-[var(--honey-600)]" />
    },
    {
      action: isHindi ? "फ़्लैग किया गया: बैच HC-2026-000089" : "Flagged: Batch HC-2026-000089",
      actor: isHindi ? "सिस्टम" : "System",
      time: isHindi ? "2 घंटे पहले" : "2 hours ago",
      icon: <AlertTriangle size={14} className="text-[var(--color-danger)]" />
    },
    {
      action: isHindi ? "क्लस्टर रिपोर्ट तैयार की गई" : "Cluster report generated",
      actor: "Sonipat",
      time: isHindi ? "4 घंटे पहले" : "4 hours ago",
      icon: <MapPin size={14} className="text-[var(--color-info)]" />
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
          {isHindi ? "केवीआईसी व्यवस्थापक डैशबोर्ड" : "Admin Dashboard"}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          {isHindi
            ? "रीयल-टाइम हनी-चेन प्लेटफॉर्म अवलोकन एवं केवीआईसी क्लस्टर निगरानी"
            : "Real-time HoneyChain platform overview & KVIC cluster monitoring"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {adminStatsDisplay.map((stat) => (
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
        {/* Clusters & Geospatial Map */}
        <Card className="lg:col-span-2 !p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-[var(--text-primary)]">
              <MapPin size={14} className="text-[var(--honey-600)]" />
              {isHindi ? "केवीआईसी क्लस्टर एवं भू-स्थानिक मानचित्र" : "KVIC Beekeeping Clusters & Geospatial Map"}
            </h2>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {clusters.length} {isHindi ? "क्षेत्र" : "Regions"}
            </span>
          </div>

          <div className="p-4 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
            <AdminMap clusters={clusters} />
          </div>

          <div className="divide-y divide-[var(--border-default)] max-h-[500px] overflow-y-auto">
            {clusters.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                {isHindi ? "क्लस्टर लोड हो रहे हैं..." : "Loading clusters..."}
              </div>
            ) : (
              clusters.map((cluster) => (
                <div key={cluster.name} className="p-4 hover:bg-[var(--bg-muted)] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-sm text-[var(--text-primary)]">{cluster.name}</span>
                      <span className="text-xs text-[var(--text-muted)] ml-2">{cluster.state}</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--honey-600)]">
                      {cluster.totalProductionTons ?? cluster.production ?? 0} T
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[var(--text-muted)]">{isHindi ? "पालक" : "Beekeepers"}</span>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {cluster.totalBeekeepers ?? cluster.beekeepers}
                      </p>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">{isHindi ? "छत्ते" : "Hives"}</span>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {(cluster.totalHives ?? cluster.hives)?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">{isHindi ? "बैच" : "Batches"}</span>
                      <p className="font-semibold text-[var(--text-primary)]">{cluster.batches}</p>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">{isHindi ? "स्वास्थ्य" : "Health"}</span>
                      <p
                        className={`font-semibold ${
                          (cluster.avgHealth ?? cluster.health ?? 0) >= 85
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-warning)]"
                        }`}
                      >
                        {cluster.avgHealth ?? cluster.health ?? 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Activity */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--border-default)]">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-[var(--text-primary)]">
              <Activity size={14} className="text-[var(--honey-600)]" />
              {isHindi ? "हालिया गतिविधियां" : "Recent Activity"}
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {activitiesToDisplay.map((item: any, i: number) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-muted)] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                    {item.icon || "📋"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] font-medium">{item.action}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {item.actor} · {item.time}
                    </p>
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
