"use client";

import { useEffect, useState } from "react";

export default function AdminBeekeepersPage() {
  const [beekeepers, setBeekeepers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBeekeepers = async () => {
      try {
        const res = await fetch("/api/admin/beekeepers", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setBeekeepers(data);
        }
      } catch (err) {
        console.error("Failed to fetch beekeepers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBeekeepers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registered Rural Beekeepers</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Directory of beekeepers verified under KVIC Honey Mission
        </p>
      </div>

      <div className="card overflow-hidden bg-white">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {beekeepers.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No beekeepers found.</div>
            ) : (
              beekeepers.map((b) => (
                <div key={b.id} className="p-5 flex flex-wrap items-center justify-between gap-3 hover:bg-amber-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">
                      {b.name?.[0] || "?"}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{b.name}</h3>
                      <p className="text-xs text-gray-400">{b.cluster} • {b.district}</p>
                      <p className="font-mono text-[10px] text-gray-400 mt-0.5">{b.wallet}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="text-gray-400 block text-[10px]">Active Hives</span>
                      <span className="font-bold text-gray-800">{b.hives} Hives</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 block text-[10px]">Total Production</span>
                      <span className="font-bold text-amber-700">{b.honey}</span>
                    </div>
                    <span className="badge badge-verified">{b.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
