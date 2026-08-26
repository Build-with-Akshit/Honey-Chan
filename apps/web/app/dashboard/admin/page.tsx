"use client";

const ADMIN_STATS = [
  { label: "Registered Beekeepers", value: "1,248", icon: "🐝", color: "text-amber-700" },
  { label: "Active Hives", value: "8,492", icon: "🏠", color: "text-green-700" },
  { label: "Honey Batches", value: "4,832", icon: "🍯", color: "text-blue-700" },
  { label: "Verified Batches", value: "4,721", icon: "✅", color: "text-emerald-700" },
  { label: "Flagged Batches", value: "31", icon: "⚠️", color: "text-red-600" },
  { label: "Total Honey Tracked", value: "182.4 T", icon: "⚖️", color: "text-purple-700" },
];

const CLUSTERS = [
  { name: "Sonipat Honey Cluster", state: "Haryana", beekeepers: 84, hives: 1200, batches: 184, health: 87, production: "4.8 T" },
  { name: "Moradabad Cluster", state: "UP", beekeepers: 62, hives: 890, batches: 142, health: 82, production: "3.6 T" },
  { name: "Alwar Cluster", state: "Rajasthan", beekeepers: 95, hives: 1450, batches: 210, health: 90, production: "5.2 T" },
  { name: "Pune Cluster", state: "Maharashtra", beekeepers: 48, hives: 680, batches: 98, health: 85, production: "2.8 T" },
];

const RECENT_ACTIVITY = [
  { action: "Batch HC-2026-000127 verified", actor: "Quality Lab", time: "5 min ago", icon: "✅" },
  { action: "New beekeeper registered", actor: "Ramesh Kumar", time: "1 hour ago", icon: "🐝" },
  { action: "Flagged: Batch HC-2026-000089", actor: "System", time: "2 hours ago", icon: "⚠️" },
  { action: "Cluster report generated", actor: "Sonipat", time: "4 hours ago", icon: "📊" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Honey Chain platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {ADMIN_STATS.map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <span className="text-2xl">{stat.icon}</span>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clusters */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-4 border-b border-amber-100">
            <h2 className="font-semibold text-gray-700">📍 KVIC Beekeeping Clusters</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {CLUSTERS.map((cluster) => (
              <div key={cluster.name} className="p-4 hover:bg-amber-50/40 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-700">{cluster.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{cluster.state}</span>
                  </div>
                  <span className="text-sm font-medium text-amber-700">{cluster.production}</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div><span className="text-gray-400">Beekeepers</span><p className="font-medium text-gray-700">{cluster.beekeepers}</p></div>
                  <div><span className="text-gray-400">Hives</span><p className="font-medium text-gray-700">{cluster.hives.toLocaleString()}</p></div>
                  <div><span className="text-gray-400">Batches</span><p className="font-medium text-gray-700">{cluster.batches}</p></div>
                  <div>
                    <span className="text-gray-400">Health</span>
                    <p className={`font-medium ${cluster.health >= 85 ? "text-green-600" : "text-amber-600"}`}>{cluster.health}%</p>
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
            {RECENT_ACTIVITY.map((item, i) => (
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
