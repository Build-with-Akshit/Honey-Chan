"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  Package,
  Warehouse,
  FlaskConical,
  CheckCircle2,
  Truck,
  Store,
  ShoppingCart,
  BarChart3,
  ExternalLink,
} from "lucide-react";

export default function SupplyChainDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
          Welcome, {user.name}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Overview for your {user.role.toLowerCase()} operations
        </p>
      </div>

      {/* Dynamic Summary Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {user.role === "PROCESSOR" && (
          <>
            <Widget title="Incoming Raw" value="12 Batches" icon={<Package size={18} />} color="text-[var(--honey-600)]" bg="bg-[var(--honey-50)]" />
            <Widget title="Processing Queue" value="3 Batches" icon={<Warehouse size={18} />} color="text-[var(--color-warning)]" bg="bg-[var(--color-warning-bg)]" />
            <Widget title="Processed" value="45 Batches" icon={<CheckCircle2 size={18} />} color="text-[var(--color-success)]" bg="bg-[var(--color-success-bg)]" />
            <Widget title="Quality Pass" value="98%" icon={<FlaskConical size={18} />} color="text-[var(--color-info)]" bg="bg-[var(--color-info-bg)]" />
          </>
        )}
        {user.role === "LAB" && (
          <>
            <Widget title="Pending Tests" value="8 Samples" icon={<FlaskConical size={18} />} color="text-[var(--color-warning)]" bg="bg-[var(--color-warning-bg)]" />
            <Widget title="Completed" value="156" icon={<CheckCircle2 size={18} />} color="text-[var(--color-success)]" bg="bg-[var(--color-success-bg)]" />
            <Widget title="Certificates" value="142" icon={<Package size={18} />} color="text-[var(--honey-600)]" bg="bg-[var(--honey-50)]" />
            <Widget title="Turnaround" value="2.4 days" icon={<BarChart3 size={18} />} color="text-[var(--color-info)]" bg="bg-[var(--color-info-bg)]" />
          </>
        )}
        {user.role === "DISTRIBUTOR" && (
          <>
            <Widget title="Incoming" value="5 Active" icon={<Package size={18} />} color="text-[var(--honey-600)]" bg="bg-[var(--honey-50)]" />
            <Widget title="In Transit" value="12 Trucks" icon={<Truck size={18} />} color="text-[var(--color-info)]" bg="bg-[var(--color-info-bg)]" />
            <Widget title="Warehouse" value="850 kg" icon={<Warehouse size={18} />} color="text-[var(--color-warning)]" bg="bg-[var(--color-warning-bg)]" />
            <Widget title="Dispatched" value="2 Today" icon={<Truck size={18} />} color="text-[var(--color-success)]" bg="bg-[var(--color-success-bg)]" />
          </>
        )}
        {user.role === "WHOLESALER" && (
          <>
            <Widget title="Purchases" value="18 Batches" icon={<ShoppingCart size={18} />} color="text-[var(--honey-600)]" bg="bg-[var(--honey-50)]" />
            <Widget title="Inventory" value="420 kg" icon={<Package size={18} />} color="text-[var(--color-info)]" bg="bg-[var(--color-info-bg)]" />
            <Widget title="Incoming" value="2 Shipments" icon={<Truck size={18} />} color="text-[var(--color-warning)]" bg="bg-[var(--color-warning-bg)]" />
            <Widget title="Transfers" value="15 Done" icon={<CheckCircle2 size={18} />} color="text-[var(--color-success)]" bg="bg-[var(--color-success-bg)]" />
          </>
        )}
        {user.role === "RETAILER" && (
          <>
            <Widget title="Received" value="45 Batches" icon={<Package size={18} />} color="text-[var(--honey-600)]" bg="bg-[var(--honey-50)]" />
            <Widget title="Inventory" value="120 kg" icon={<Store size={18} />} color="text-[var(--color-info)]" bg="bg-[var(--color-info-bg)]" />
            <Widget title="Sold" value="85 kg" icon={<CheckCircle2 size={18} />} color="text-[var(--color-success)]" bg="bg-[var(--color-success-bg)]" />
            <Widget title="QR Scans" value="342" icon={<BarChart3 size={18} />} color="text-purple-600" bg="bg-purple-50" />
          </>
        )}
      </div>

      {/* Table Section */}
      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--border-default)]">
          <h2 className="font-semibold text-sm text-[var(--text-primary)]">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-muted)] text-[var(--text-muted)] text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Batch ID</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Blockchain</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              <tr className="hover:bg-[var(--bg-muted)] transition-colors">
                <td className="px-6 py-4 font-semibold text-[var(--text-primary)] font-mono text-xs">HC-2026-000127</td>
                <td className="px-6 py-4 text-[var(--text-secondary)]">18.5 kg</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]">
                    Received
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-[var(--text-muted)] font-mono flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[var(--color-success)]" />
                  Verified
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[var(--honey-600)] hover:text-[var(--honey-700)] font-semibold text-xs cursor-pointer transition-colors flex items-center gap-1 ml-auto">
                    Details <ExternalLink size={12} />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-[var(--bg-muted)] transition-colors">
                <td className="px-6 py-4 font-semibold text-[var(--text-primary)] font-mono text-xs">HC-2026-000128</td>
                <td className="px-6 py-4 text-[var(--text-secondary)]">30.0 kg</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info-border)]">
                    In Transit
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-[var(--text-muted)] font-mono flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[var(--color-success)]" />
                  Verified
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[var(--honey-600)] hover:text-[var(--honey-700)] font-semibold text-xs cursor-pointer transition-colors flex items-center gap-1 ml-auto">
                    Details <ExternalLink size={12} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Widget({ title, value, icon, color, bg }: { title: string; value: string; icon: React.ReactNode; color: string; bg: string }) {
  return (
    <div className="card p-5">
      <div className={`w-9 h-9 rounded-[var(--radius-md)] ${bg} flex items-center justify-center ${color} mb-3`}>
        {icon}
      </div>
      <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{title}</h3>
      <p className="text-xl font-bold text-[var(--text-primary)] mt-1 font-[family-name:var(--font-outfit)]">{value}</p>
    </div>
  );
}
