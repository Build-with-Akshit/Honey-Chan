"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import Link from "next/link";
import { BatchTable } from "./[...slug]/page";

export default function SupplyChainDashboard() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBatches: 0,
    pendingAction: 0,
    completed: 0,
    totalKg: "0.0"
  });

  const fetchData = async () => {
    if (!user) return;
    try {
      const [batchesRes, statsRes] = await Promise.all([
        honeyApi.getBatches(),
        fetch('/api/stats', { cache: 'no-store' }).then(res => res.json())
      ]);
      setBatches(batchesRes);
      if (statsRes.supplyChain) setStats(statsRes.supplyChain);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    const pollData = async () => {
      await fetchData();
      if (isMounted) {
        timer = setTimeout(pollData, 10000); // Poll every 10s AFTER previous request finishes
      }
    };

    if (user) {
      pollData();
    }

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome & Facility Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome, {user.name} 👋</h1>
            {user.role === "PROCESSOR" && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Facility Active
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Real-time operations, custody tracking, and blockchain ledger for your {user.role.toLowerCase()} facility.
          </p>
        </div>

        {user.role === "PROCESSOR" && (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/supply-chain/incoming"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all active:scale-[0.98]"
            >
              <span>📦</span>
              <span>Incoming Raw Honey</span>
            </Link>
          </div>
        )}
      </div>

      {/* Dynamic Summary Widgets based on Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {user.role === "PROCESSOR" && (
          <>
            <Widget title="Total Batches" value={stats.totalBatches.toString()} icon="📦" subtitle="Inward & processing inventory" color="amber" />
            <Widget title="Pending Actions" value={stats.pendingAction.toString()} icon="⚡" subtitle="Awaiting custody acceptance" color="orange" />
            <Widget title="Processed" value={stats.completed.toString()} icon="🍯" subtitle="Batches ready for dispatch" color="emerald" />
            <Widget title="Total Volume" value={`${stats.totalKg} kg`} icon="⚖️" subtitle="Total verified honey mass" color="blue" />
          </>
        )}
        {user.role === "LAB" && (
          <>
            <Widget title="Total Tests" value={stats.totalBatches.toString()} icon="🧪" subtitle="All sample submissions" color="purple" />
            <Widget title="Pending Lab Review" value={stats.pendingAction.toString()} icon="🔬" subtitle="Awaiting spectrum test" color="amber" />
            <Widget title="Tests Completed" value={stats.completed.toString()} icon="✅" subtitle="Certified reports issued" color="emerald" />
            <Widget title="Volume Tested" value={`${stats.totalKg} kg`} icon="⚖️" subtitle="Certified volume" color="blue" />
          </>
        )}
        {user.role === "DISTRIBUTOR" && (
          <>
            <Widget title="Total Shipments" value={stats.totalBatches.toString()} icon="🚚" subtitle="Total transport dispatches" color="blue" />
            <Widget title="In Transit" value={stats.pendingAction.toString()} icon="🛣️" subtitle="Active on the road" color="amber" />
            <Widget title="Delivered" value={stats.completed.toString()} icon="🏢" subtitle="Warehouse arrivals" color="emerald" />
            <Widget title="Volume Handled" value={`${stats.totalKg} kg`} icon="⚖️" subtitle="Total tonnage moved" color="purple" />
          </>
        )}
        {user.role === "WHOLESALER" && (
          <>
            <Widget title="My Purchases" value={stats.totalBatches.toString()} icon="🛒" subtitle="All trade lots bought" color="amber" />
            <Widget title="Pending Receipt" value={stats.pendingAction.toString()} icon="⏳" subtitle="In transit to warehouse" color="orange" />
            <Widget title="Inventory Ready" value={stats.completed.toString()} icon="🏢" subtitle="In commercial storage" color="emerald" />
            <Widget title="Total Volume" value={`${stats.totalKg} kg`} icon="⚖️" subtitle="Total lot weight" color="blue" />
          </>
        )}
        {user.role === "RETAILER" && (
          <>
            <Widget title="Total Stock" value={stats.totalBatches.toString()} icon="🏪" subtitle="Store shelves & backroom" color="emerald" />
            <Widget title="Pending Delivery" value={stats.pendingAction.toString()} icon="📦" subtitle="Inward consignments" color="amber" />
            <Widget title="Finalized Sales" value={stats.completed.toString()} icon="💰" subtitle="Consumer sales signed" color="purple" />
            <Widget title="Volume Received" value={`${stats.totalKg} kg`} icon="⚖️" subtitle="Retail packaged weight" color="blue" />
          </>
        )}
      </div>

      {/* Quick Access Pipeline (for Processor) */}
      {user.role === "PROCESSOR" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/dashboard/supply-chain/incoming"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              📦
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                1. Incoming Raw Honey
              </h4>
              <p className="text-[11px] text-gray-500 truncate">Inspect and accept beekeeper transfers</p>
            </div>
          </Link>

          <Link
            href="/dashboard/supply-chain/processing"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              🏭
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                2. Processing Queue
              </h4>
              <p className="text-[11px] text-gray-500 truncate">Heating &lt;45°C, filtration, lab sampling</p>
            </div>
          </Link>

          <Link
            href="/dashboard/supply-chain/processed"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              🏷️
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                3. Packaging & QR Generation
              </h4>
              <p className="text-[11px] text-gray-500 truncate">Generate bottle QR stickers & trace links</p>
            </div>
          </Link>
        </div>
      )}

      {/* Main Activity Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">
            {user.role === "WHOLESALER" ? "My Purchased Batches" :
              user.role === "RETAILER" ? "My Store Inventory" : "Recent Batch Activity & Custody"}
          </h2>
          <span className="text-xs text-gray-500">{batches.length} batches total</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-gray-200/90 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin h-7 w-7 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-xs font-medium">Syncing with Blockchain Ledger...</p>
            </div>
          ) : (
            <BatchTable batches={batches} user={user} emptyMessage="No batches in your custody yet." onRefresh={fetchData} />
          )}
        </div>
      </div>
    </div>
  );
}

function Widget({
  title,
  value,
  icon,
  subtitle,
  color = "amber",
}: {
  title: string;
  value: string;
  icon: string;
  subtitle?: string;
  color?: string;
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    amber: { bg: "bg-amber-50", text: "text-amber-700" },
    orange: { bg: "bg-orange-50", text: "text-orange-700" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700" },
    blue: { bg: "bg-blue-50", text: "text-blue-700" },
    purple: { bg: "bg-purple-50", text: "text-purple-700" },
  };

  const c = colorMap[color] || colorMap.amber;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200/80 transition-all shadow-xs hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</h3>
        <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.text} flex items-center justify-center text-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      {subtitle && <p className="text-[11px] text-gray-500 mt-1 truncate">{subtitle}</p>}
    </div>
  );
}
