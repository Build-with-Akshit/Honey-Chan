"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MapPin, Box, Scale, Wallet } from "lucide-react";

const DEMO_BEEKEEPERS = [
  { id: "bk-1", name: "Ramesh Kumar", cluster: "Sonipat Honey Cluster", district: "Sonipat, Haryana", hives: 24, batches: 8, honey: "486 KG", wallet: "0x7099...79C8", status: "VERIFIED" },
  { id: "bk-2", name: "Suresh Yadav", cluster: "Sonipat Honey Cluster", district: "Sonipat, Haryana", hives: 18, batches: 5, honey: "312 KG", wallet: "0x3C44...93BC", status: "VERIFIED" },
  { id: "bk-3", name: "Harpreet Singh", cluster: "Moradabad Honey Cluster", district: "Moradabad, UP", hives: 32, batches: 11, honey: "640 KG", wallet: "0x90F7...B906", status: "VERIFIED" },
  { id: "bk-4", name: "Vikas Meena", cluster: "Alwar Mustard Cluster", district: "Alwar, Rajasthan", hives: 28, batches: 9, honey: "520 KG", wallet: "0x15d3...A65", status: "VERIFIED" },
];

export default function AdminBeekeepersPage() {
  const [beekeepers, setBeekeepers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBeekeepers = async () => {
      try {
        const res = await fetch("/api/admin/beekeepers", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setBeekeepers(data.length > 0 ? data : DEMO_BEEKEEPERS);
        } else {
          setBeekeepers(DEMO_BEEKEEPERS);
        }
      } catch (err) {
        console.error("Failed to fetch beekeepers", err);
        setBeekeepers(DEMO_BEEKEEPERS);
      } finally {
        setLoading(false);
      }
    };
    fetchBeekeepers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
          Registered Beekeepers
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Directory of beekeepers verified under KVIC Honey Mission
        </p>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-[3px] border-[var(--honey-500)] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-default)]">
            {beekeepers.map((b) => (
              <div key={b.id} className="p-5 flex flex-wrap items-center justify-between gap-3 hover:bg-[var(--bg-muted)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--honey-400)] to-[var(--honey-600)] flex items-center justify-center text-white font-bold text-sm">
                    {b.name?.charAt(0) || "🐝"}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">{b.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <MapPin size={10} />
                      {b.cluster} · {b.district}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 flex items-center gap-1">
                      <Wallet size={10} />
                      {b.wallet}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-xs">
                  <div className="text-right">
                    <span className="text-[var(--text-muted)] block text-[10px] flex items-center gap-1 justify-end">
                      <Box size={10} />
                      Hives
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">{b.hives}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[var(--text-muted)] block text-[10px] flex items-center gap-1 justify-end">
                      <Scale size={10} />
                      Production
                    </span>
                    <span className="font-bold text-[var(--honey-600)]">{b.honey}</span>
                  </div>
                  <StatusBadge state="pass" label={b.status || "VERIFIED"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
