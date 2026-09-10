"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Radio,
  Thermometer,
  Droplets,
  Scale,
  Bug,
  Battery,
  Zap,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function BeekeeperIoTPage() {
  const [hives, setHives] = useState<any[]>([]);
  const [selectedHiveCode, setSelectedHiveCode] = useState("HIVE-007");
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const loadHives = async () => {
    try {
      const list = await honeyApi.getHives();
      setHives(list);
    } catch (err) {
      console.error("Failed to load hives:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHives();
    const interval = setInterval(loadHives, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentHive = hives.find((h) => h.hiveCode === selectedHiveCode) || hives[0];

  const triggerReading = async (tempMod = 0, humMod = 0, weightMod = 0) => {
    if (!currentHive) return;
    setStreaming(true);
    try {
      const base = currentHive.latestReading;
      await honeyApi.postReading({
        hiveCode: currentHive.hiveCode,
        temperature: Number((base.temperature + tempMod + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        humidity: Number((base.humidity + humMod + (Math.random() * 1.0 - 0.5)).toFixed(1)),
        weight: Number((base.weight + weightMod).toFixed(1)),
        beeActivity: Number(Math.min(0.98, Math.max(0.5, base.beeActivity + (Math.random() * 0.1 - 0.05))).toFixed(2)),
        battery: base.battery,
      });
      setLastAction(`Updated ${currentHive.hiveCode} telemetry`);
      await loadHives();
    } catch (err: any) {
      setLastAction(`Error: ${err.message}`);
    } finally {
      setStreaming(false);
    }
  };

  if (loading && !currentHive) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 rounded-full border-[3px] border-[var(--honey-500)] border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm text-[var(--text-secondary)]">Connecting to IoT Gateway...</p>
      </div>
    );
  }

  const history = currentHive?.readingsHistory || [];
  const latest = currentHive?.latestReading || {
    temperature: 34.2,
    humidity: 65.4,
    weight: 38.4,
    beeActivity: 0.88,
    battery: 92,
  };

  const sensorCards = [
    {
      label: "Brood Temperature",
      value: `${latest.temperature}°C`,
      icon: <Thermometer size={18} />,
      color: "text-[var(--honey-600)]",
      status: latest.temperature >= 33.5 && latest.temperature <= 35.5 ? "pass" : "pending",
      statusLabel: latest.temperature >= 33.5 && latest.temperature <= 35.5 ? "Optimal (34°C)" : "Deviation",
    },
    {
      label: "Internal Humidity",
      value: `${latest.humidity}%`,
      icon: <Droplets size={18} />,
      color: "text-[var(--color-info)]",
      status: latest.humidity >= 55 && latest.humidity <= 70 ? "pass" : "info",
      statusLabel: latest.humidity >= 55 && latest.humidity <= 70 ? "Curing Range" : "Ventilation Active",
    },
    {
      label: "Net Hive Weight",
      value: `${latest.weight} KG`,
      icon: <Scale size={18} />,
      color: "text-[var(--color-success)]",
      status: "pass",
      statusLabel: `+${(latest.weight - 22).toFixed(1)} kg accumulation`,
    },
    {
      label: "Foraging Traffic",
      value: `${Math.round(latest.beeActivity * 100)}%`,
      icon: <Bug size={18} />,
      color: "text-purple-600",
      status: "info",
      statusLabel: `Battery: ${latest.battery}%`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
            IoT Hive Climate & Telemetry
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Real-time sensor stream · ESP32 & Simulator
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-xs">
          <Radio size={14} className="text-[var(--honey-600)]" />
          <select
            value={selectedHiveCode}
            onChange={(e) => setSelectedHiveCode(e.target.value)}
            className="text-xs font-semibold text-[var(--text-primary)] bg-transparent focus:outline-none cursor-pointer"
          >
            {hives.map((h) => (
              <option key={h.id} value={h.hiveCode}>
                {h.hiveCode} ({h.flowerSource})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Demo Controls */}
      <Card className="p-4 bg-gradient-to-r from-[var(--honey-50)] via-white to-[var(--honey-50)] border-[var(--honey-200)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <StatusBadge state="info" label="DEMO CONTROLS" showDot={false} />
            <p className="text-xs font-semibold text-[var(--text-primary)] mt-1">Simulate Telemetry Events</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={Radio}
              onClick={() => triggerReading(0, 0, 0)}
              disabled={streaming}
            >
              {streaming ? "Streaming..." : "Send Normal Tick"}
            </Button>
            <button
              onClick={() => triggerReading(2.8, 8.0, 0)}
              disabled={streaming}
              className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-warning-bg)] hover:bg-orange-100 text-[var(--color-warning)] border border-[var(--color-warning-border)] transition-colors cursor-pointer"
            >
              <AlertTriangle size={12} className="inline mr-1" />
              Heat Anomaly
            </button>
            <button
              onClick={() => triggerReading(0, 0, 1.2)}
              disabled={streaming}
              className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-success-bg)] hover:bg-green-100 text-[var(--color-success)] border border-[var(--color-success-border)] transition-colors cursor-pointer"
            >
              <TrendingUp size={12} className="inline mr-1" />
              Honey Flow
            </button>
          </div>
        </div>
        {lastAction && (
          <p className="text-[11px] text-[var(--honey-600)] mt-2 font-medium">{lastAction}</p>
        )}
      </Card>

      {/* Sensor Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sensorCards.map((card) => (
          <Card key={card.label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-[var(--radius-md)] bg-[var(--bg-muted)] flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 font-[family-name:var(--font-outfit)] tabular-data ${card.color}`}>
              {card.value}
            </p>
            <StatusBadge state={card.status as any} label={card.statusLabel} className="mt-2" />
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <Thermometer size={14} className="text-[var(--honey-600)]" />
              Temperature Trend
            </h3>
            <span className="text-xs text-[var(--text-muted)]">Target: 34.0°C</span>
          </div>
          <div className="h-40 flex items-end gap-1.5 pt-4 pb-1 px-1 bg-[var(--honey-50)] rounded-[var(--radius-md)] border border-[var(--honey-100)]">
            {history.slice(0, 12).reverse().map((r: any, idx: number) => {
              const h = Math.max(15, Math.min(95, (r.temperature - 30) * 12));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="text-[8px] font-semibold text-[var(--honey-700)] opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                    {r.temperature}°
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-[var(--honey-500)] to-[var(--honey-400)] rounded-t-sm transition-all duration-300 hover:opacity-80"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[8px] text-[var(--text-muted)]">
                    {idx === 0 ? "Now" : `-${idx}h`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Weight Trend */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <Scale size={14} className="text-[var(--color-success)]" />
              Weight Accumulation
            </h3>
            <span className="text-xs text-[var(--color-success)] font-semibold">+0.6 kg today</span>
          </div>
          <div className="h-40 flex items-end gap-1.5 pt-4 pb-1 px-1 bg-[var(--color-success-bg)] rounded-[var(--radius-md)] border border-[var(--color-success-border)]">
            {history.slice(0, 12).reverse().map((r: any, idx: number) => {
              const h = Math.max(15, Math.min(95, (r.weight - 25) * 4.5));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="text-[8px] font-semibold text-[var(--color-success)] opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                    {r.weight}k
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-[var(--color-success)] to-emerald-400 rounded-t-sm transition-all duration-300 hover:opacity-80"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[8px] text-[var(--text-muted)]">
                    {idx === 0 ? "Now" : `-${idx}h`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
