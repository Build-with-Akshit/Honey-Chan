"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";

export default function AdminClustersPage() {
  const [clusters, setClusters] = useState<any[]>([]);

  useEffect(() => {
    honeyApi.getClusters().then(setClusters).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KVIC Beekeeping Clusters</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Ministry of MSME rural cluster management & regional yield oversight
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {clusters.map((cluster) => (
          <div key={cluster.id} className="card p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl">📍</span>
              <span className="badge badge-verified">ACTIVE CLUSTER</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">{cluster.name}</h3>
              <p className="text-xs text-gray-400">{cluster.district}, {cluster.state}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-gray-100">
              <div className="p-2 rounded-lg bg-gray-50">
                <span className="text-gray-400 block text-[10px]">Beekeepers</span>
                <span className="font-bold text-gray-800">{cluster.totalBeekeepers}</span>
              </div>
              <div className="p-2 rounded-lg bg-gray-50">
                <span className="text-gray-400 block text-[10px]">Smart Hives</span>
                <span className="font-bold text-gray-800">{cluster.totalHives}</span>
              </div>
              <div className="p-2 rounded-lg bg-gray-50">
                <span className="text-gray-400 block text-[10px]">Avg Health</span>
                <span className="font-bold text-emerald-700">{cluster.avgHealth}%</span>
              </div>
              <div className="p-2 rounded-lg bg-gray-50">
                <span className="text-gray-400 block text-[10px]">Total Production</span>
                <span className="font-bold text-amber-700">{cluster.totalProductionTons} Tons</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
