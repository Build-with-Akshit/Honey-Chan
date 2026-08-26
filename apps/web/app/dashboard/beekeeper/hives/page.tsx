"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import Link from "next/link";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Beehives</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            KVIC registered smart bee boxes equipped with IoT micro-climate sensors
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/beekeeper/iot" className="btn-outline text-xs py-2 px-3">
            📡 Live IoT Stream
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2 px-4 shadow-sm"
          >
            + Register New Hive
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="card p-6 bg-white border-amber-300 page-enter">
          <h2 className="font-bold text-gray-800 text-sm mb-4">Register Smart Bee Box (KVIC Honey Mission)</h2>
          <form onSubmit={handleAddHive} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hive Code</label>
              <input
                type="text"
                placeholder="e.g. HIVE-024"
                value={newHiveCode}
                onChange={(e) => setNewHiveCode(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Apiary Location</label>
              <input
                type="text"
                placeholder="e.g. Sonipat Field 2"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Flower Source</label>
              <input
                type="text"
                placeholder="e.g. Mustard Flower"
                value={newFlower}
                onChange={(e) => setNewFlower(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-outline text-xs py-1.5 px-4"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs py-1.5 px-4">
                Register on System
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <div className="animate-spin h-7 w-7 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs">Loading Registered Hives...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hives.map((hive) => (
            <div key={hive.id} className="card p-5 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 font-mono">{hive.hiveCode}</h3>
                    <p className="text-[11px] text-gray-400">{hive.location}</p>
                  </div>
                </div>
                <span className={`badge ${hive.status === "ACTIVE" ? "badge-verified" : "badge-warning"}`}>
                  {hive.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-gray-100">
                <div className="p-2 rounded-lg bg-amber-50/60">
                  <span className="text-gray-400 block text-[10px]">Temperature</span>
                  <span className="font-bold text-amber-800">{hive.latestReading?.temperature}°C</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-50/60">
                  <span className="text-gray-400 block text-[10px]">Humidity</span>
                  <span className="font-bold text-blue-800">{hive.latestReading?.humidity}%</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/60">
                  <span className="text-gray-400 block text-[10px]">Weight</span>
                  <span className="font-bold text-emerald-800">{hive.latestReading?.weight} KG</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-gray-500">🌸 {hive.flowerSource}</span>
                <span className="font-bold text-emerald-700">Health: {hive.healthScore}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
