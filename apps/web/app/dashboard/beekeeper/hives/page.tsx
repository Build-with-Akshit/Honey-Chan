"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function BeekeeperHivesPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [hives, setHives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHiveCode, setNewHiveCode] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newFlower, setNewFlower] = useState("Mustard Flower (Sarson)");
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    try {
      await honeyApi.createHive({
        hiveCode: newHiveCode.trim().toUpperCase(),
        location: newLocation.trim(),
        flowerSource: newFlower,
      });
      setShowAddModal(false);
      setNewHiveCode("");
      setNewLocation("");
      loadHives();
    } catch (err: any) {
      alert("Failed to add hive: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHive = async (id: number, code: string) => {
    const confirmMsg = isHindi
      ? `क्या आप वाकई ${code} को अपने फार्म से हटाना चाहते हैं?`
      : `Are you sure you want to remove ${code} from your apiary?`;
    if (!confirm(confirmMsg)) return;
    try {
      await honeyApi.deleteHive(id);
      loadHives();
    } catch (err: any) {
      alert("Failed to delete hive: " + err.message);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      {/* ─── Top Header Card ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-amber-100/60 to-orange-500/10 p-6 md:p-8 rounded-3xl border border-amber-300 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🐝</span>
              <h1 className="text-2xl md:text-3xl font-black text-amber-950 tracking-tight">
                {isHindi ? "मेरे स्मार्ट बी-बॉक्सेस" : "My Smart Beehives"}
              </h1>
              <span className="text-[11px] font-extrabold bg-amber-200/90 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                {isHindi ? "केवीआईसी हनी मिशन" : "KVIC Honey Mission"}
              </span>
            </div>
            <p className="text-xs font-semibold text-amber-900/80 mt-1.5 max-w-xl">
              {isHindi
                ? "ईएसपी-32 दोहरे जांच तापमान, आर्द्रता और 4-बिंदु सटीक स्केल टेलीमेट्री से सुसज्जित।"
                : "Equipped with ESP32-WROOM dual-probe temperature, humidity, and 4-point precision hive scale telemetry."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/beekeeper/iot"
              className="bg-white/95 hover:bg-amber-100 text-amber-950 border border-amber-300 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-2xs transition-all flex items-center gap-2"
            >
              <span>📡</span>
              <span>{isHindi ? "लाइव सेंसर मॉनिटर" : "Live Sensor Monitor"}</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                const nextNum = hives.length + 1;
                setNewHiveCode(`HC-HIVE-0${nextNum}`);
                setNewLocation("Sonipat Apiary Node, Haryana");
                setShowAddModal(true);
              }}
              className="btn-primary text-xs font-extrabold py-2.5 px-5 rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
            >
              <span>+</span>
              <span>{isHindi ? "नया बॉक्स जोड़ें" : "Register New Hive"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Add Hive Modal ─────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="p-6 rounded-3xl bg-white border-2 border-amber-300 shadow-lg space-y-4 page-enter">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/80">
            <div>
              <h2 className="font-black text-sm text-amber-950 flex items-center gap-2">
                <span>➕</span>{" "}
                {isHindi
                  ? "स्मार्ट बी-बॉक्स पंजीकृत करें (केवीआईसी हनी मिशन)"
                  : "Register Smart Bee Box (KVIC Honey Mission)"}
              </h2>
              <p className="text-[11px] text-amber-800/70 font-medium">
                {isHindi
                  ? "अपने खाते से एक सक्रिय आईओटी छत्ता नोड जोड़ें।"
                  : "Link an active IoT hive node to your beekeeper account."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="w-7 h-7 rounded-lg text-amber-900/60 hover:text-amber-950 hover:bg-amber-100 flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAddHive} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1.5">
                {isHindi ? "छत्ता पहचान कोड" : "Hive Identifier Code"}
              </label>
              <input
                type="text"
                placeholder="e.g. HC-HIVE-04"
                value={newHiveCode}
                onChange={(e) => setNewHiveCode(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs bg-[#fffefc] border border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 font-mono font-bold text-amber-950"
              />
              <span className="text-[10px] text-amber-800/60 mt-1 block">
                {isHindi ? "विशिष्ट ईएसपी32 डिवाइस मैपिंग कोड" : "Unique ESP32 device mapping code"}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1.5">
                {isHindi ? "फार्म का स्थान" : "Apiary Location"}
              </label>
              <input
                type="text"
                placeholder="e.g. Sonipat Orchard Node #2"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs bg-[#fffefc] border border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-amber-950"
              />
              <span className="text-[10px] text-amber-800/60 mt-1 block">
                {isHindi ? "जीपीएस या खेत का विवरण" : "GPS coordinates or farm location"}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1.5">
                {isHindi ? "प्रमुख वानस्पतिक स्रोत" : "Primary Floral Source"}
              </label>
              <select
                value={newFlower}
                onChange={(e) => setNewFlower(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#fffefc] border border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 font-bold text-amber-950 cursor-pointer"
              >
                <option value="Mustard Flower (Sarson)">Mustard Flower (Sarson)</option>
                <option value="Kashmir Acacia / Robina">Kashmir Acacia / Robina</option>
                <option value="Shimla Apple Blossom">Shimla Apple Blossom</option>
                <option value="Muzaffarpur Litchi">Muzaffarpur Litchi</option>
                <option value="Wild Himalayan Multiflora">Wild Himalayan Multiflora</option>
                <option value="Eucalyptus Flora">Eucalyptus Flora</option>
              </select>
              <span className="text-[10px] text-amber-800/60 mt-1 block">
                {isHindi ? "शहद जीआई लेबल के लिए वानस्पतिक स्रोत" : "Botanical source for Honey GI label"}
              </span>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2.5 pt-2 border-t border-amber-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-amber-900/80 hover:text-amber-950 bg-white hover:bg-amber-100 border border-amber-200 rounded-xl cursor-pointer transition-colors"
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-xs font-bold py-2 px-5 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submitting
                  ? isHindi
                    ? "पंजीकृत हो रहा है..."
                    : "Registering..."
                  : isHindi
                    ? "✓ बी-बॉक्स पंजीकृत करें"
                    : "✓ Register Beehive"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Hives Grid ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="p-16 text-center text-amber-800/70 space-y-3">
          <div className="animate-spin h-7 w-7 border-3 border-amber-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-xs font-bold">
            {isHindi ? "बी-बॉक्सेस लोड हो रहे हैं..." : "Loading Registered Beehives..."}
          </p>
        </div>
      ) : hives.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-amber-200 space-y-4 max-w-md mx-auto">
          <span className="text-4xl block">🐝</span>
          <div className="space-y-1">
            <h3 className="font-black text-sm text-amber-950">
              {isHindi ? "अभी तक कोई बी-बॉक्स पंजीकृत नहीं है" : "No Beehives Registered Yet"}
            </h3>
            <p className="text-xs text-amber-800/70">
              {isHindi
                ? "आईओटी टेलीमेट्री शुरू करने के लिए अपना पहला स्मार्ट बॉक्स जोड़ें।"
                : "Add your first smart bee box to start streaming IoT microclimate metrics."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs font-bold px-5 py-2.5 rounded-xl"
          >
            {isHindi ? "+ पहला बॉक्स जोड़ें" : "+ Register First Hive"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hives.map((hive) => {
            const temp = hive.latestReading?.temperature ?? 34.2;
            const hum = hive.latestReading?.humidity ?? 64.8;
            const weight = hive.latestReading?.weight ?? 38.45;
            const health = hive.healthScore ?? 92;

            return (
              <div
                key={hive.id}
                className="p-5 rounded-3xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-amber-950">
                          {hive.hiveCode}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                          {isHindi ? "सक्रिय" : "ACTIVE"}
                        </span>
                      </div>
                      <p className="text-xs text-amber-800/80 font-medium mt-0.5">
                        📍 {hive.location}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteHive(hive.id, hive.hiveCode)}
                      className="w-7 h-7 rounded-lg text-amber-800/40 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title={isHindi ? "हटाएं" : "Remove Hive"}
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-amber-900 bg-amber-50/70 px-3 py-1.5 rounded-xl border border-amber-100">
                    <span className="font-semibold">🌸 {hive.flowerSource}</span>
                    <span className="font-mono font-bold text-emerald-800">
                      {isHindi ? "स्वास्थ्य:" : "Health:"} {health}%
                    </span>
                  </div>
                </div>

                {/* 3 Telemetry Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#fffdf9] p-3 rounded-2xl border border-amber-200/80">
                  <div>
                    <span className="text-[10px] text-amber-800/60 block font-bold uppercase">
                      {isHindi ? "ब्रूड" : "Brood"}
                    </span>
                    <span className="font-mono font-black text-xs text-amber-950">{temp}°C</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-800/60 block font-bold uppercase">
                      {isHindi ? "आर्द्रता" : "Humidity"}
                    </span>
                    <span className="font-mono font-black text-xs text-amber-950">{hum}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-800/60 block font-bold uppercase">
                      {isHindi ? "वजन" : "Mass"}
                    </span>
                    <span className="font-mono font-black text-xs text-emerald-800">{weight} kg</span>
                  </div>
                </div>

                {/* 3 Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-amber-100">
                  <Link
                    href="/dashboard/beekeeper/iot"
                    className="flex-1 text-center py-2 px-2.5 rounded-xl text-[11px] font-bold text-amber-950 bg-white hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs"
                  >
                    📡 {isHindi ? "सेंसर" : "Sensors"}
                  </Link>

                  <Link
                    href="/dashboard/beekeeper/ai"
                    className="flex-1 text-center py-2 px-2.5 rounded-xl text-[11px] font-bold text-amber-950 bg-white hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs"
                  >
                    🤖 {isHindi ? "एआई सलाह" : "Ask AI"}
                  </Link>

                  <Link
                    href="/batches/create"
                    className="flex-1 text-center py-2 px-2.5 rounded-xl text-[11px] font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-2xs"
                  >
                    🍯 {isHindi ? "कटाई" : "Harvest"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
