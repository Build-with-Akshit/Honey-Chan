"use client";

import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Users, MapPin, Box, Scale, Wallet } from "lucide-react";

const BEEKEEPERS = [
  { id: "bk-1", name: "Ramesh Kumar", cluster: "Sonipat Honey Cluster", district: "Sonipat, Haryana", hives: 24, batches: 8, honey: "486 KG", wallet: "0x7099...79C8", status: "VERIFIED" },
  { id: "bk-2", name: "Suresh Yadav", cluster: "Sonipat Honey Cluster", district: "Sonipat, Haryana", hives: 18, batches: 5, honey: "312 KG", wallet: "0x3C44...93BC", status: "VERIFIED" },
  { id: "bk-3", name: "Harpreet Singh", cluster: "Moradabad Honey Cluster", district: "Moradabad, UP", hives: 32, batches: 11, honey: "640 KG", wallet: "0x90F7...B906", status: "VERIFIED" },
  { id: "bk-4", name: "Vikas Meena", cluster: "Alwar Mustard Cluster", district: "Alwar, Rajasthan", hives: 28, batches: 9, honey: "520 KG", wallet: "0x15d3...A65", status: "VERIFIED" },
];

export default function AdminBeekeepersPage() {
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
        <div className="divide-y divide-[var(--border-default)]">
          {BEEKEEPERS.map((b) => (
            <div key={b.id} className="p-5 flex flex-wrap items-center justify-between gap-3 hover:bg-[var(--bg-muted)] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--honey-400)] to-[var(--honey-600)] flex items-center justify-center text-white font-bold text-sm">
                  {b.name.charAt(0)}
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
                <StatusBadge state="pass" label={b.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
