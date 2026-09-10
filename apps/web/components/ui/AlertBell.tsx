"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, X, Check, CheckCheck, AlertTriangle, AlertCircle, Info, Wifi, WifiOff } from "lucide-react";

interface Alert {
  id: string;
  hiveId: number;
  hiveCode: string;
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  sensorData: Record<string, number>;
  healthScore?: number;
  riskLevel?: string;
  acknowledged: boolean;
  createdAt: string;
}

const SEVERITY_CONFIG = {
  CRITICAL: { icon: AlertTriangle, color: "text-[var(--color-danger)]", bg: "bg-[var(--color-danger-bg)]", border: "border-[var(--color-danger-border)]" },
  WARNING: { icon: AlertCircle, color: "text-[var(--color-warning)]", bg: "bg-[var(--color-warning-bg)]", border: "border-[var(--color-warning-border)]" },
  INFO: { icon: Info, color: "text-[var(--color-info)]", bg: "bg-[var(--color-info-bg)]", border: "border-[var(--color-info-border)]" },
};

export function AlertBell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts?limit=20");
      const data = await res.json();
      setAlerts(data.alerts || []);
      setUnacknowledgedCount(data.unacknowledgedCount || 0);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch("/api/alerts/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });
      setAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, acknowledged: true } : a));
      setUnacknowledgedCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    }
  };

  const acknowledgeAll = async () => {
    setLoading(true);
    try {
      await fetch("/api/alerts/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acknowledgeAll: true }),
      });
      setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
      setUnacknowledgedCount(0);
    } catch (err) {
      console.error("Failed to acknowledge all:", err);
    }
    setLoading(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] cursor-pointer transition-colors"
      >
        <Bell size={18} />
        {unacknowledgedCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--color-danger)] text-white text-[10px] font-bold rounded-full px-1">
            {unacknowledgedCount > 99 ? "99+" : unacknowledgedCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[500px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-[var(--text-primary)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-outfit)" }}>
                  Hive Alerts
                </h3>
                {unacknowledgedCount > 0 && (
                  <span className="text-[10px] font-bold bg-[var(--color-danger)] text-white px-1.5 py-0.5 rounded-full">
                    {unacknowledgedCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unacknowledgedCount > 0 && (
                  <button
                    onClick={acknowledgeAll}
                    disabled={loading}
                    className="text-[10px] text-[var(--color-success)] hover:text-[var(--color-success)] font-semibold px-2 py-1 rounded hover:bg-[var(--color-success-bg)] transition-colors cursor-pointer"
                  >
                    <CheckCheck size={12} className="inline mr-1" />
                    Dismiss All
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-[var(--bg-muted)] rounded cursor-pointer">
                  <X size={14} className="text-[var(--text-muted)]" />
                </button>
              </div>
            </div>

            {/* Alert List */}
            <div className="overflow-y-auto max-h-[400px]">
              {alerts.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell size={24} className="text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-xs text-[var(--text-muted)]">No alerts yet</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">Alerts appear when IoT sensors detect anomalies</p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.INFO;
                  const Icon = config.icon;
                  return (
                    <div
                      key={alert.id}
                      className={`px-4 py-3 border-b border-[var(--border-default)] hover:bg-[var(--bg-muted)] transition-colors ${alert.acknowledged ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon size={14} className={config.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-[var(--text-primary)] truncate">{alert.title}</p>
                            <span className="text-[10px] text-[var(--text-muted)] shrink-0">{timeAgo(alert.createdAt)}</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-mono text-[var(--text-muted)]">{alert.hiveCode}</span>
                            {alert.healthScore !== undefined && (
                              <span className={`text-[10px] font-bold ${alert.healthScore >= 88 ? "text-[var(--color-success)]" : alert.healthScore >= 72 ? "text-[var(--color-warning)]" : "text-[var(--color-danger)]"}`}>
                                Score: {alert.healthScore}
                              </span>
                            )}
                            {!alert.acknowledged && (
                              <button
                    
                                onClick={() => acknowledgeAlert(alert.id)}
                                className="text-[10px] text-[var(--color-success)] hover:underline ml-auto cursor-pointer"
                              >
                                <Check size={10} className="inline mr-0.5" />
                                Dismiss
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="px-4 py-2 border-t border-[var(--border-default)] bg-[var(--bg-muted)]">
                <p className="text-[10px] text-[var(--text-muted)] text-center">
                  Showing {alerts.length} alert{alerts.length !== 1 ? "s" : ""} (newest first)
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
