"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Box, Radio, Plus, Thermometer, Droplets, Scale, Flower2, X } from "lucide-react";

export default function BeekeeperHivesPage() {
  const [hives, setHives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHiveCode, setNewHiveCode] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newFlower, setNewFlower] = useState("Mustard Flower");

  const loadHives = () => {
    honeyApi
      .getHives()
      .then(setHives)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHives();
  }, []);

  const handleAddHive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHiveCode || !newLocation) return;
    try {
      await honeyApi.createHive({
        hiveCode: newHiveCode,
        location: newLocation,
        flowerSource: newFlower,
      });
      setShowAddModal(false);
      setNewHiveCode("");
      setNewLocation("");
      loadHives();
    } catch (err: any) {
      alert("Failed to add hive: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
            My Apiary Hives
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            KVIC registered smart bee boxes equipped with IoT sensors
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/beekeeper/iot" className="btn-outline text-xs py-2 px-3">
            <Radio size={14} />
            Live IoT Stream
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Register New Hive
          </Button>
        </div>
      </div>

      {showAddModal && (
        <Card className="p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-[var(--text-primary)]">
              Register Smart Bee Box
            </h2>
            <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-[var(--bg-muted)] text-[var(--text-muted)] cursor-pointer">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleAddHive} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Hive Code"
              type="text"
              placeholder="e.g. HIVE-024"
              value={newHiveCode}
              onChange={(e) => setNewHiveCode(e.target.value)}
              required
            />
            <Input
              label="Apiary Location"
              type="text"
              placeholder="e.g. Sonipat Field 2"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              required
            />
            <Input
              label="Flower Source"
              type="text"
              placeholder="e.g. Mustard Flower"
              value={newFlower}
              onChange={(e) => setNewFlower(e.target.value)}
              required
            />
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Register on System
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 rounded-full border-[3px] border-[var(--honey-500)] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Loading hives...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hives.map((hive) => (
            <Card key={hive.id} className="p-5 space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--honey-50)] to-[var(--honey-100)] flex items-center justify-center text-[var(--honey-600)]">
                    <Box size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm font-mono text-[var(--honey-600)]">{hive.hiveCode}</h3>
                    <p className="text-[11px] text-[var(--text-muted)]">{hive.location}</p>
                  </div>
                </div>
                <StatusBadge
                  state={hive.status === "ACTIVE" ? "pass" : "fail"}
                  label={hive.status}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border-default)]">
                  <Thermometer size={14} className="mx-auto text-[var(--text-muted)] mb-1" />
                  <span className="text-[var(--text-muted)] block text-[10px]">Temp</span>
                  <span className="font-bold text-[var(--text-primary)] tabular-data">{hive.latestReading?.temperature}°C</span>
                </div>
                <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border-default)]">
                  <Droplets size={14} className="mx-auto text-[var(--text-muted)] mb-1" />
                  <span className="text-[var(--text-muted)] block text-[10px]">Humidity</span>
                  <span className="font-bold text-[var(--text-primary)] tabular-data">{hive.latestReading?.humidity}%</span>
                </div>
                <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border-default)]">
                  <Scale size={14} className="mx-auto text-[var(--text-muted)] mb-1" />
                  <span className="text-[var(--text-muted)] block text-[10px]">Weight</span>
                  <span className="font-bold text-[var(--text-primary)] tabular-data">{hive.latestReading?.weight} KG</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-[var(--text-secondary)] flex items-center gap-1">
                  <Flower2 size={12} className="text-[var(--honey-500)]" />
                  {hive.flowerSource}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--text-muted)]">Health:</span>
                  <span className="font-bold text-[var(--color-success)] tabular-data">{hive.healthScore}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
