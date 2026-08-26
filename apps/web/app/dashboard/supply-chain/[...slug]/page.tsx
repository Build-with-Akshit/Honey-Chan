"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function GenericSupplyChainPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // E.g. /dashboard/supply-chain/purchases -> "purchases"
  const slug = pathname.split("/").pop() || "feature";
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b border-amber-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title} Module</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your {title.toLowerCase()} operations and blockchain records.
        </p>
      </div>

      <div className="card bg-white p-12 text-center border-dashed border-2 border-amber-200">
        <div className="text-5xl mb-4">🚧</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Work in Progress</h2>
        <p className="text-gray-500 max-w-md mx-auto text-sm">
          The <strong>{title}</strong> module for the <strong>{user?.role}</strong> portal is currently being connected to the blockchain smart contracts. Check back later!
        </p>
        
        <div className="mt-8 flex justify-center">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200">
             <span>🔗</span> Smart Contract Binding in Progress
           </div>
        </div>
      </div>
    </div>
  );
}
