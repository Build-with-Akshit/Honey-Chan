"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flower2,
  Warehouse,
  FlaskConical,
  Truck,
  Store,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Shield,
  Hash,
  User,
  Copy,
  Check,
} from "lucide-react";

// ── Stage Configuration ─────────────────────────────────────────────
export interface SupplyChainStage {
  stage: string;
  icon?: string;
  actor?: string;
  location?: string;
  date?: string;
  txHash?: string;
  notes?: string;
  verified?: boolean;
}

export interface BatchData {
  id?: number;
  batchId: string;
  honeyType?: string;
  quantity?: number | string;
  quantityKg?: string;
  status?: string;
  harvestDate?: string;
  originLocation?: string;
  location?: string;
  beekeeperName?: string;
  hiveCode?: string;
  trustScore?: number | string;
  metadataHash?: string;
  blockchainTx?: string;
  events?: SupplyChainStage[];
  qualityTests?: any[];
}

export interface UniversalBatchTimelineProps {
  batch: BatchData;
  /** Which role is viewing — controls which stages are highlighted */
  viewerRole?: string;
  /** Show compact card list or full timeline */
  variant?: "card" | "timeline" | "compact";
  /** Show the verify link */
  showVerify?: boolean;
  /** Show batch metadata (type, quantity, etc.) */
  showMetadata?: boolean;
  /** Show tx hash footer */
  showTxHash?: boolean;
  /** Allow expanding/collapsing timeline */
  collapsible?: boolean;
  /** Initially expanded */
  defaultExpanded?: boolean;
}

const STAGE_CONFIG: Record<string, { icon: typeof Flower2; color: string; bg: string; label: string }> = {
  HARVEST: { icon: Flower2, color: "text-[var(--honey-600)]", bg: "bg-[var(--honey-50)]", label: "Harvested" },
  PROCESSING: { icon: Warehouse, color: "text-[var(--color-warning)]", bg: "bg-[var(--color-warning-bg)]", label: "Processed" },
  LAB_TESTING: { icon: FlaskConical, color: "text-[var(--color-info)]", bg: "bg-[var(--color-info-bg)]", label: "Lab Tested" },
  DISTRIBUTION: { icon: Truck, color: "text-purple-600", bg: "bg-purple-50", label: "Distributed" },
  RETAIL: { icon: Store, color: "text-[var(--color-success)]", bg: "bg-[var(--color-success-bg)]", label: "Retail" },
};

const STATUS_MAP: Record<string, { state: string; label: string }> = {
  CREATED: { state: "pending", label: "Created" },
  HARVESTED: { state: "pending", label: "Harvested" },
  PROCESSING: { state: "warning", label: "Processing" },
  QUALITY_TESTED: { state: "pass", label: "Quality Tested" },
  DISTRIBUTED: { state: "info", label: "Distributed" },
  RETAIL: { state: "pass", label: "Retail" },
  Verified: { state: "pass", label: "Verified" },
};

// ── Main Component ──────────────────────────────────────────────────
export function UniversalBatchTimeline({
  batch,
  viewerRole,
  variant = "card",
  showVerify = true,
  showMetadata = true,
  showTxHash = true,
  collapsible = false,
  defaultExpanded = true,
}: UniversalBatchTimelineProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState<string | null>(null);

  const events = batch.events || [];
  const statusInfo = STATUS_MAP[batch.status || ""] || { state: "pending", label: batch.status || "Unknown" };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Card Variant ────────────────────────────────────────────────
  if (variant === "card") {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-default)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-[var(--honey-600)]">{batch.batchId}</span>
              <StatusBadgeInline state={statusInfo.state} label={statusInfo.label} />
            </div>
            <div className="flex items-center gap-2">
              {showVerify && (
                <Link href={`/verify/${batch.batchId}`} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--honey-600)] hover:text-[var(--honey-700)] px-2.5 py-1 rounded-full border border-[var(--honey-200)] hover:bg-[var(--honey-50)] transition-colors">
                  <ExternalLink size={11} />
                  Verify
                </Link>
              )}
              {collapsible && (
                <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-[var(--bg-muted)] rounded cursor-pointer transition-colors">
                  {expanded ? <ChevronUp size={14} className="text-[var(--text-muted)]" /> : <ChevronDown size={14} className="text-[var(--text-muted)]" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Metadata */}
        {showMetadata && (
          <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-[var(--border-default)] bg-[var(--bg-muted)]">
            {batch.honeyType && (
              <MetaItem icon={<Flower2 size={12} />} label="Type" value={batch.honeyType} />
            )}
            {(batch.quantity || batch.quantityKg) && (
              <MetaItem icon={<Hash size={12} />} label="Quantity" value={`${batch.quantity || batch.quantityKg} KG`} />
            )}
            {batch.hiveCode && (
              <MetaItem icon={<MapPin size={12} />} label="Hive" value={batch.hiveCode} />
            )}
            {batch.trustScore !== undefined && (
              <MetaItem icon={<Shield size={12} />} label="Trust" value={`${batch.trustScore}/100`} highlight />
            )}
          </div>
        )}

        {/* Timeline */}
        {expanded && events.length > 0 && (
          <div className="px-5 py-4">
            <TimelineCompact events={events} viewerRole={viewerRole} />
          </div>
        )}

        {/* Tx Hash Footer */}
        {showTxHash && (batch.blockchainTx || batch.metadataHash) && (
          <div className="px-5 py-2.5 border-t border-[var(--border-default)] bg-[var(--bg-muted)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
            <span className="truncate max-w-[70%]">
              {batch.blockchainTx ? `Tx: ${batch.blockchainTx}` : `Hash: ${batch.metadataHash}`}
            </span>
            {batch.blockchainTx && (
              <button onClick={() => copyHash(batch.blockchainTx!)} className="hover:text-[var(--honey-600)] cursor-pointer transition-colors">
                {copied === batch.blockchainTx ? <Check size={10} /> : <Copy size={10} />}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Timeline Variant (full vertical timeline) ───────────────────
  if (variant === "timeline") {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-default)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-[var(--honey-600)]">{batch.batchId}</span>
              <StatusBadgeInline state={statusInfo.state} label={statusInfo.label} />
            </div>
            {showVerify && (
              <Link href={`/verify/${batch.batchId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--honey-600)] hover:text-[var(--honey-700)] px-3 py-1.5 rounded-full border border-[var(--honey-200)] hover:bg-[var(--honey-50)] transition-colors">
                <ExternalLink size={12} />
                Verify QR
              </Link>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        {showMetadata && (
          <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-5 text-xs border-b border-[var(--border-default)]">
            {batch.honeyType && <MetaItem icon={<Flower2 size={14} />} label="Honey Flora" value={batch.honeyType} />}
            {(batch.quantity || batch.quantityKg) && <MetaItem icon={<Hash size={14} />} label="Quantity" value={`${batch.quantity || batch.quantityKg} KG`} />}
            {batch.beekeeperName && <MetaItem icon={<User size={14} />} label="Beekeeper" value={batch.beekeeperName} />}
            {batch.trustScore !== undefined && <MetaItem icon={<Shield size={14} />} label="Trust Score" value={`${batch.trustScore}/100`} highlight />}
          </div>
        )}

        {/* Full Timeline */}
        {events.length > 0 ? (
          <div className="px-6 py-5">
            <TimelineFull events={events} viewerRole={viewerRole} />
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-xs text-[var(--text-muted)]">
            No supply chain events recorded yet.
          </div>
        )}

        {/* Tx Hash */}
        {showTxHash && (batch.blockchainTx || batch.metadataHash) && (
          <div className="px-6 py-3 border-t border-[var(--border-default)] bg-[var(--bg-muted)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-[80%]">
                SHA-256: {batch.metadataHash || batch.blockchainTx || "N/A"}
              </span>
              {batch.blockchainTx && (
                <button onClick={() => copyHash(batch.blockchainTx!)} className="hover:text-[var(--honey-600)] cursor-pointer transition-colors text-[var(--text-muted)]">
                  {copied === batch.blockchainTx ? <Check size={10} /> : <Copy size={10} />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Compact Variant (minimal row) ───────────────────────────────
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-lg)] hover:bg-[var(--bg-muted)] transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-xs font-bold text-[var(--honey-600)] shrink-0">{batch.batchId}</span>
        <StatusBadgeInline state={statusInfo.state} label={statusInfo.label} />
        <span className="text-[11px] text-[var(--text-secondary)] truncate hidden sm:block">
          {batch.honeyType} {batch.quantity || batch.quantityKg ? `· ${batch.quantity || batch.quantityKg} KG` : ""}
        
          </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {events.length > 0 && (
          <div className="flex items-center gap-1">
            {events.map((e, i) => {
              const config = STAGE_CONFIG[e.stage];
              if (!config) return null;
              const Icon = config.icon;
              return <Icon key={i} size={12} className={config.color} />;
            })}
          </div>
        )}
        {showVerify && (
          <Link href={`/verify/${batch.batchId}`} className="text-[10px] text-[var(--honey-600)] hover:underline">
            Verify
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────────────

function StatusBadgeInline({ state, label }: { state: string; label: string }) {
  const colors: Record<string, string> = {
    pass: "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]",
    pending: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning-border)]",
    warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning-border)]",
    info: "bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info-border)]",
    fail: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-border)]",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colors[state] || colors.pending}`}>
      {state === "pass" && <CheckCircle2 size={10} />}
      {label}
    </span>
  );
}

function MetaItem({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-[var(--text-muted)] mt-0.5">{icon}</div>
      <div>
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">{label}</span>
        <p className={`font-semibold mt-0.5 ${highlight ? "text-[var(--honey-600)]" : "text-[var(--text-primary)]"}`}>{value}</p>
      </div>
    </div>
  );
}

function TimelineCompact({ events, viewerRole }: { events: SupplyChainStage[]; viewerRole?: string }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {events.map((event, idx) => {
        const config = STAGE_CONFIG[event.stage];
        if (!config) return null;
        const Icon = config.icon;
        const isLast = idx === events.length - 1;
        return (
          <div key={idx} className="flex items-center">
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
                <Icon size={14} className={config.color} />
              </div>
              <span className="text-[9px] text-[var(--text-muted)] font-semibold text-center leading-tight">{config.label}</span>
              {event.date && <span className="text-[8px] text-[var(--text-muted)] font-mono">{event.date}</span>}
            </div>
            {!isLast && (
              <div className="w-8 h-[2px] bg-[var(--border-default)] mx-1 mt-[-12px]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TimelineFull({ events, viewerRole }: { events: SupplyChainStage[]; viewerRole?: string }) {
  return (
    <div className="relative pl-6 border-l-2 border-[var(--honey-200)] space-y-5">
      {events.map((event, idx) => {
        const config = STAGE_CONFIG[event.stage] || { icon: CheckCircle2, color: "text-[var(--text-muted)]", bg: "bg-[var(--bg-muted)]", label: event.stage };
        const Icon = config.icon;
        return (
          <div key={idx} className="relative">
            <div className={`absolute -left-[31px] w-6 h-6 rounded-full ${config.bg} border-2 border-[var(--bg-surface)] flex items-center justify-center`}>
              <Icon size={12} className={config.color} />
            </div>
            <div className="bg-[var(--bg-muted)] rounded-[var(--radius-lg)] p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[var(--text-primary)]">{config.label}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{event.date || "\u2014"}</span>
              </div>
              {event.actor && (
                <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
                  <User size={10} className="text-[var(--text-muted)]" />
                  {event.actor}
                </p>
              )}
              {event.location && (
                <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="text-[var(--text-muted)]" />
                  {event.location}
                </p>
              )}
              {event.notes && (
                <p className="text-[10px] text-[var(--text-muted)] mt-1 italic">{event.notes}</p>
              )}
              {event.txHash && (
                <p className="text-[9px] text-[var(--text-muted)] font-mono mt-1.5 flex items-center gap-1">
                  <Hash size={8} />
                  {event.txHash.slice(0, 20)}...{event.txHash.slice(-8)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
