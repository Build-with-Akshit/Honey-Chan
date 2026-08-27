"use client";

import { useEffect, useState } from "react";
import { honeyApi } from "@/lib/api";
import dynamic from "next/dynamic";

const AdminMap = dynamic(() => import("./AdminMap"), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">Loading Map Component...</div>
});

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    beekeepers: 0,
    activeHives: 0,
    batches: 0,
    verifiedBatches: 0,
    flaggedBatches: 0,
    totalHoneyTons: "0.0"
  });
  
  const [clusters, setClusters] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats', { cache: 'no-store' });
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
      const res = await fetch('/api/clusters', { cache: 'no-store' });
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
      const res = await fetch('/api/activities', { cache: 'no-store' });
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
        timer = setTimeout(pollData, 10000); // Poll every 10s AFTER previous request finishes
      }
    };

    pollData();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const adminStatsDisplay = [
    { label: "Registered Beekeepers", value: stats.beekeepers.toLocaleString(), icon: "🐝", color: "text-amber-700" },
    { label: "Active Hives", value: stats.activeHives.toLocaleString(), icon: "🏠", color: "text-green-700" },
    { label: "Honey Batches", value: stats.batches.toLocaleString(), icon: "🍯", color: "text-blue-700" },
    { label: "Verified Batches", value: stats.verifiedBatches.toLocaleString(), icon: "✅", color: "text-emerald-700" },
    { label: "Flagged Batches", value: stats.flaggedBatches.toLocaleString(), icon: "⚠️", color: "text-red-600" },
    { label: "Total Honey Tracked", value: `${stats.totalHoneyTons} T`, icon: "⚖️", color: "text-purple-700" },
  ];

  const activitiesToDisplay = recentActivities.length > 0 ? recentActivities : [
    { action: "No recent activity yet.", actor: "System", time: "Just now", icon: "ℹ️" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time Honey Chain platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {adminStatsDisplay.map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <span className="text-2xl">{stat.icon}</span>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clusters */}
        <div className="lg:col-span-2 card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-amber-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">📍 KVIC Beekeeping Clusters & Geospatial Map</h2>
          </div>
          
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <AdminMap clusters={clusters} />
          </div>

          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {clusters.length === 0 ? (
              <div className="p-4 text-gray-400 text-sm text-center">Loading clusters...</div>
            ) : clusters.map((cluster) => (
              <div key={cluster.name} className="p-4 hover:bg-amber-50/40 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-700">{cluster.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{cluster.state}</span>
                  </div>
                  <span className="text-sm font-medium text-amber-700">{cluster.totalProductionTons} T</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div><span className="text-gray-400">Beekeepers</span><p className="font-medium text-gray-700">{cluster.totalBeekeepers}</p></div>
                  <div><span className="text-gray-400">Hives</span><p className="font-medium text-gray-700">{cluster.totalHives?.toLocaleString()}</p></div>
                  <div><span className="text-gray-400">Batches</span><p className="font-medium text-gray-700">{cluster.batches}</p></div>
                  <div>
                    <span className="text-gray-400">Health</span>
                    <p className={`font-medium ${cluster.avgHealth >= 85 ? "text-green-600" : "text-amber-600"}`}>{cluster.avgHealth}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-amber-100">
            <h2 className="font-semibold text-gray-700">📋 Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {activitiesToDisplay.map((item: any, i: number) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{item.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.actor} • {item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
