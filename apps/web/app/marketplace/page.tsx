import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  // Fetch available batches (HARVESTED or QUALITY_TESTED but not sold)
  const availableBatches = await prisma.honeyBatch.findMany({
    where: {
      status: { in: ["HARVESTED", "TESTED", "DISTRIBUTED", "PROCESSING"] }
    },
    include: {
      beekeeper: true,
      hive: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-amber-50/30">
      {/* Header */}
      <header className="bg-white border-b border-amber-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍯</span>
            <span className="font-bold text-amber-900 text-lg">Honey-Chan Marketplace</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm font-semibold text-amber-700 hover:text-amber-900">
              Supply Chain Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-amber-600 text-amber-50 py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Direct from Hive to You</h1>
          <p className="text-amber-100 text-lg">
            Connect directly with verified KVIC Beekeepers. 100% Traceable. Blockchain Certified.
          </p>
        </div>
      </div>

      {/* Listings */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Available Wholesale Batches</h2>
          <span className="text-sm text-gray-500 font-semibold bg-white px-3 py-1 rounded-full border border-gray-200">
            {availableBatches.length} Batches Found
          </span>
        </div>

        {availableBatches.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-amber-200">
            <p className="text-gray-500">No batches currently available for sale.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBatches.map((batch: any) => (
              <div key={batch.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="h-48 bg-amber-100 relative">
                  {/* Decorative Image */}
                  <img 
                    src={`https://source.unsplash.com/600x400/?honey,bee,apiary&sig=${batch.id}`} 
                    alt="Honey" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1587049352847-4d4b1a511674?q=80&w=600&auto=format&fit=crop" }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-amber-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {batch.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 space-y-4">
                  <div>
                    <div className="text-xs font-mono text-gray-400 mb-1">{batch.batchId}</div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{batch.honeyType}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{batch.location}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100">
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">Quantity</div>
                      <div className="font-bold text-gray-800">{batch.quantity} KG</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">Quality Test</div>
                      <div className="font-bold text-gray-800 flex items-center gap-1">
                        {batch.qualityPassed ? (
                           <span className="text-green-600">✅ Passed</span>
                        ) : batch.status === "HARVESTED" || batch.status === "PROCESSING" ? (
                           <span className="text-amber-600">⏳ Pending</span>
                        ) : (
                           <span className="text-red-600">❌ Failed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-lg shrink-0">
                      🐝
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Beekeeper</div>
                      <div className="font-bold text-sm text-gray-900 truncate">
                        {batch.beekeeper?.name || "Unknown Apiary"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a 
                      href={`mailto:${batch.beekeeper?.email}?subject=Inquiry for Honey Batch ${batch.batchId}`}
                      className="block w-full text-center py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold rounded-xl transition-colors border border-amber-200"
                    >
                      Contact Beekeeper
                    </a>
                    <Link 
                      href={`/trace/${batch.batchId}`}
                      className="block w-full text-center py-2.5 mt-2 text-sm text-gray-500 hover:text-gray-800 font-medium"
                    >
                      View Traceability →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
