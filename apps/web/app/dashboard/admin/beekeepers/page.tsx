"use client";

const BEEKEEPERS = [
  { id: "bk-1", name: "Ramesh Kumar", cluster: "Sonipat Honey Cluster", district: "Sonipat, Haryana", hives: 24, batches: 8, honey: "486 KG", wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", status: "VERIFIED" },
  { id: "bk-2", name: "Suresh Yadav", cluster: "Sonipat Honey Cluster", district: "Sonipat, Haryana", hives: 18, batches: 5, honey: "312 KG", wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", status: "VERIFIED" },
  { id: "bk-3", name: "Harpreet Singh", cluster: "Moradabad Honey Cluster", district: "Moradabad, UP", hives: 32, batches: 11, honey: "640 KG", wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", status: "VERIFIED" },
  { id: "bk-4", name: "Vikas Meena", cluster: "Alwar Mustard Cluster", district: "Alwar, Rajasthan", hives: 28, batches: 9, honey: "520 KG", wallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", status: "VERIFIED" },
];

export default function AdminBeekeepersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registered Rural Beekeepers</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Directory of beekeepers verified under KVIC Honey Mission
        </p>
      </div>

      <div className="card overflow-hidden bg-white">
        <div className="divide-y divide-gray-100">
          {BEEKEEPERS.map((b) => (
            <div key={b.id} className="p-5 flex flex-wrap items-center justify-between gap-3 hover:bg-amber-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">
                  {b.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{b.name}</h3>
                  <p className="text-xs text-gray-400">{b.cluster} • {b.district}</p>
                  <p className="font-mono text-[10px] text-gray-400 mt-0.5 truncate max-w-[200px] sm:max-w-[400px]">{b.wallet}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 text-xs w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-0 border-gray-50 pt-2 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="text-gray-400 block text-[10px]">Active Hives</span>
                  <span className="font-bold text-gray-800">{b.hives} Hives</span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-gray-400 block text-[10px]">Total Production</span>
                  <span className="font-bold text-amber-700">{b.honey}</span>
                </div>
                <span className="badge badge-verified">{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
