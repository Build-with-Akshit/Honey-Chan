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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">
          Here is the overview for your {user.role.toLowerCase()} operations.
        </p>
      </div>

      {/* Dynamic Summary Widgets based on Role */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {user.role === "PROCESSOR" && (
          <>
            <Widget title="Total Batches" value={stats.totalBatches.toString()} />
            <Widget title="Pending Actions" value={stats.pendingAction.toString()} />
            <Widget title="Processed" value={stats.completed.toString()} />
            <Widget title="Total Volume" value={`${stats.totalKg} kg`} />
          </>
        )}
        {user.role === "LAB" && (
          <>
            <Widget title="Total Tests" value={stats.totalBatches.toString()} />
            <Widget title="Pending Lab Review" value={stats.pendingAction.toString()} />
            <Widget title="Tests Completed" value={stats.completed.toString()} />
            <Widget title="Volume Tested" value={`${stats.totalKg} kg`} />
          </>
        )}
        {user.role === "DISTRIBUTOR" && (
          <>
            <Widget title="Total Shipments" value={stats.totalBatches.toString()} />
            <Widget title="In Transit" value={stats.pendingAction.toString()} />
            <Widget title="Delivered" value={stats.completed.toString()} />
            <Widget title="Volume Handled" value={`${stats.totalKg} kg`} />
          </>
        )}
        {user.role === "WHOLESALER" && (
          <>
            <Widget title="My Purchases" value={stats.totalBatches.toString()} />
            <Widget title="Pending Receipt" value={stats.pendingAction.toString()} />
            <Widget title="Inventory Ready" value={stats.completed.toString()} />
            <Widget title="Total Volume" value={`${stats.totalKg} kg`} />
          </>
        )}
        {user.role === "RETAILER" && (
          <>
            <Widget title="Total Stock" value={stats.totalBatches.toString()} />
            <Widget title="Pending Delivery" value={stats.pendingAction.toString()} />
            <Widget title="Finalized Sales" value={stats.completed.toString()} />
            <Widget title="Volume Received" value={`${stats.totalKg} kg`} />
          </>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {user.role === "WHOLESALER" ? "My Purchased Batches" :
            user.role === "RETAILER" ? "My Inventory" : "Recent Activity"}
        </h2>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin h-7 w-7 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-xs">Syncing with Blockchain Ledger...</p>
            </div>
          ) : (
            <div className="p-4">
              <BatchTable batches={batches} user={user} emptyMessage="No batches in your custody yet." onRefresh={fetchData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Widget({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
