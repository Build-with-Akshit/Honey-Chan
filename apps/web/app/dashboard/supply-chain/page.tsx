"use client";

import { useAuth } from "@/hooks/useAuth";

export default function SupplyChainDashboard() {
  const { user } = useAuth();

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
            <Widget title="Incoming Raw Honey" value="12 Batches" />
            <Widget title="Processing Queue" value="3 Batches" />
            <Widget title="Processed Batches" value="45 Batches" />
            <Widget title="Quality Status" value="98% Pass" />
          </>
        )}
        {user.role === "LAB" && (
          <>
            <Widget title="Pending Tests" value="8 Samples" />
            <Widget title="Tests Completed" value="156" />
            <Widget title="Certificates Issued" value="142" />
            <Widget title="Average Turnaround" value="2.4 days" />
          </>
        )}
        {user.role === "DISTRIBUTOR" && (
          <>
            <Widget title="Incoming Shipments" value="5 Active" />
            <Widget title="In Transit" value="12 Trucks" />
            <Widget title="Warehouse Stock" value="850 kg" />
            <Widget title="Dispatched Today" value="2 Shipments" />
          </>
        )}
        {user.role === "WHOLESALER" && (
          <>
            <Widget title="My Purchases" value="18 Batches" />
            <Widget title="Inventory" value="420 kg" />
            <Widget title="Incoming" value="2 Shipments" />
            <Widget title="Retailer Transfers" value="15 Completed" />
          </>
        )}
        {user.role === "RETAILER" && (
          <>
            <Widget title="Received Stock" value="45 Batches" />
            <Widget title="Store Inventory" value="120 kg" />
            <Widget title="Products Sold" value="85 kg" />
            <Widget title="QR Verifications" value="342 Scans" />
          </>
        )}
      </div>

      {/* Example Table Section (Common for all, just with different titles) */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {user.role === "WHOLESALER" ? "My Purchased Batches" :
            user.role === "RETAILER" ? "My Inventory" : "Recent Activity"}
        </h2>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Batch ID</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Blockchain</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-amber-50/30 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900">HC-2026-000127</td>
                <td className="px-6 py-4">18.5 kg</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Received
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-gray-400">✅ Verified</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-amber-600 hover:text-amber-800 font-medium text-xs">
                    View Details →
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-amber-50/30 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900">HC-2026-000128</td>
                <td className="px-6 py-4">30.0 kg</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    In Transit
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-gray-400">✅ Verified</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-amber-600 hover:text-amber-800 font-medium text-xs">
                    View Details →
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

function Widget({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
