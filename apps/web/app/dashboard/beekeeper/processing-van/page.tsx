"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import { AudioSpeaker } from "@/components/ui/AudioSpeaker";
import {
  Truck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Scale,
  ShieldCheck,
  Zap,
  PhoneCall,
  FileCheck,
  Layers,
  Sparkles,
} from "lucide-react";

interface VanSchedule {
  id: string;
  vanNumber: string;
  driver: string;
  contact: string;
  cluster: string;
  location: string;
  arrivalDate: string;
  capacityDaily: string;
  slotsRemaining: number;
  status: "EN_ROUTE" | "SCHEDULED" | "OPERATIONAL";
}

const VAN_SCHEDULES: VanSchedule[] = [
  {
    id: "VAN-01",
    vanNumber: "KVIC-MPU-01 (Haryana Cluster)",
    driver: "Harpreet Singh (KVIC Certified Operator)",
    contact: "+91 98761 23450",
    cluster: "Sonipat Honey Cluster",
    location: "Ganaur Village Mandi Ground, Sonipat",
    arrivalDate: "02 Sep 2026",
    capacityDaily: "300 KG / 8 Hours",
    slotsRemaining: 4,
    status: "EN_ROUTE",
  },
  {
    id: "VAN-02",
    vanNumber: "KVIC-MPU-02 (NCR / UP Cluster)",
    driver: "Satish Verma",
    contact: "+91 98112 34567",
    cluster: "Ghaziabad & Sirora Cluster",
    location: "Sirora Apiary Hub, Ghaziabad",
    arrivalDate: "05 Sep 2026",
    capacityDaily: "300 KG / 8 Hours",
    slotsRemaining: 6,
    status: "SCHEDULED",
  },
  {
    id: "VAN-03",
    vanNumber: "KVIC-MPU-03 (Bihar Litchi Cluster)",
    driver: "Anil Kumar Jha",
    contact: "+91 94310 98765",
    cluster: "Muzaffarpur Cluster",
    location: "Kanti Orchard Center, Muzaffarpur",
    arrivalDate: "08 Sep 2026",
    capacityDaily: "300 KG / 8 Hours",
    slotsRemaining: 2,
    status: "OPERATIONAL",
  },
];

export default function MobileProcessingVanPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [selectedVan, setSelectedVan] = useState(VAN_SCHEDULES[0].id);
  const [honeyQuantity, setHoneyQuantity] = useState("35");
  const [honeyType, setHoneyType] = useState("Mustard Flower (Sarson)");
  const [hiveCode, setHiveCode] = useState("HIVE-007");
  const [booked, setBooked] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = "KVIC-BK-" + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(ref);
    setBooked(true);
  };

  const audioText = isHindi
    ? "केवीआईसी मोबाइल प्रोसेसिंग वैन सुविधा। वैन नंबर पीयू शून्य एक दो सितंबर को आपके सोनीपत क्लस्टर आ रही है। यह वैन खेत पर ही तीन सौ किलोग्राम तक शहद का फिल्ट्रेशन और नमी परीक्षण करती है। आप अपना स्लॉट अभी बुक कर सकते हैं।"
    : "KVIC Mobile Honey Processing Van service. Van number PU-01 arrives at Sonipat cluster on 2nd September. It features on-the-spot filtration and moisture testing for up to 300 kilograms per day. You can book your slot now.";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--honey-50)] border border-[var(--honey-200)] text-[var(--honey-700)] text-xs font-semibold mb-2">
            <Sparkles size={13} className="text-[var(--honey-600)]" />
            {isHindi ? "केवीआईसी 2022 नवाचार पहल" : "KVIC 2022 PIB Flagship Initiative"}
          </div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
            {isHindi ? "केवीआईसी मोबाइल हनी प्रोसेसिंग वैन" : "KVIC Mobile Honey Processing Van"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {isHindi
              ? "गाँव-खेत पर ही 300 किग्रा/दिन शुद्धिकरण, नमी नियंत्रण एवं त्वरित लैब टेस्टिंग"
              : "In-situ 300 KG/8-hr filtration, moisture reduction & instant lab testing at farm gate"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AudioSpeaker text={audioText} label={isHindi ? "वैन की जानकारी सुनें" : "Listen Van Info"} />
        </div>
      </div>

      {/* Feature Highlight Banner */}
      <div className="bg-gradient-to-r from-[var(--honey-600)] via-[var(--honey-700)] to-[var(--orange-700)] rounded-[var(--radius-xl)] p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 grid md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-white/80 font-medium">{isHindi ? "दैनिक क्षमता" : "Processing Speed"}</p>
              <p className="text-lg font-bold font-[family-name:var(--font-outfit)]">300 KG / 8 Hours</p>
              <p className="text-xs text-white/70 mt-0.5">{isHindi ? "खेत पर तुरंत शुद्धिकरण" : "Zero transport delay"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <FlaskConical size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-white/80 font-medium">{isHindi ? "नमी नियंत्रण (FSSAI)" : "Moisture Control"}</p>
              <p className="text-lg font-bold font-[family-name:var(--font-outfit)]">&lt; 20% Standard</p>
              <p className="text-xs text-white/70 mt-0.5">{isHindi ? "खमीर (fermentation) से बचाव" : "Prevents crystallization"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Scale size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-white/80 font-medium">{isHindi ? "किसान बचत" : "Farmer Cost Saving"}</p>
              <p className="text-lg font-bold font-[family-name:var(--font-outfit)]">₹15 – 20 / KG</p>
              <p className="text-xs text-white/70 mt-0.5">{isHindi ? "बिचौलियों और ढुलाई से मुक्ति" : "No middleman cuts"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-white/80 font-medium">{isHindi ? "डिजिटल प्रमाण पत्र" : "Instant On-Chain"}</p>
              <p className="text-lg font-bold font-[family-name:var(--font-outfit)]">Tamper-Proof QR</p>
              <p className="text-xs text-white/70 mt-0.5">{isHindi ? "तुरंत ब्लॉकचेन पर दर्ज" : "Live FSSAI purity report"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Van Fleet Schedule & Booking Form */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fleet Schedules */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-outfit)] text-lg font-bold text-[var(--text-primary)]">
              {isHindi ? "मोबाइल वैन का भ्रमण कार्यक्रम (Schedule)" : "Active Mobile Van Cluster Fleet"}
            </h2>
            <span className="text-xs font-semibold text-[var(--honey-700)] bg-[var(--honey-50)] px-2.5 py-1 rounded-full border border-[var(--honey-200)]">
              {isHindi ? "3 वैन कार्यरत" : "3 Vans Active"}
            </span>
          </div>

          <div className="space-y-4">
            {VAN_SCHEDULES.map((van) => {
              const isSelected = selectedVan === van.id;
              return (
                <div
                  key={van.id}
                  onClick={() => setSelectedVan(van.id)}
                  className={`p-5 rounded-[var(--radius-lg)] border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[var(--honey-500)] bg-[var(--honey-50)]/40 shadow-sm"
                      : "border-[var(--border-default)] bg-white hover:border-[var(--honey-300)]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-default)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--honey-100)] flex items-center justify-center text-[var(--honey-700)] font-bold">
                        <Truck size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[var(--text-primary)]">{van.vanNumber}</h3>
                        <p className="text-xs text-[var(--text-muted)]">{van.cluster}</p>
                      </div>
                    </div>
                    <div>
                      {van.status === "EN_ROUTE" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                          {isHindi ? "रास्ते में है (En Route)" : "En Route"}
                        </span>
                      )}
                      {van.status === "OPERATIONAL" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                          {isHindi ? "सक्रिय प्रोसेसिंग चालू" : "Operational"}
                        </span>
                      )}
                      {van.status === "SCHEDULED" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={12} />
                          {isHindi ? "निर्धारित (Scheduled)" : "Scheduled"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 pt-3 text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <MapPin size={14} className="text-[var(--honey-600)] shrink-0" />
                      <span className="truncate">{van.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Calendar size={14} className="text-[var(--honey-600)] shrink-0" />
                      <span>{isHindi ? "आगमन तिथि:" : "Arrival:"} <strong>{van.arrivalDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <PhoneCall size={14} className="text-[var(--honey-600)] shrink-0" />
                      <span>{van.contact}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[var(--border-default)]/60 flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">
                      {isHindi ? "उपलब्ध स्लॉट:" : "Available Slots:"} <strong className="text-[var(--text-primary)]">{van.slotsRemaining} Beekeepers</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedVan(van.id)}
                      className={`text-xs font-semibold px-3 py-1 rounded-[var(--radius-md)] transition-colors ${
                        isSelected
                          ? "bg-[var(--honey-600)] text-white"
                          : "bg-[var(--honey-100)] text-[var(--honey-800)] hover:bg-[var(--honey-200)]"
                      }`}
                    >
                      {isSelected ? (isHindi ? "चयनित (Selected)" : "Selected") : (isHindi ? "यह वैन चुनें" : "Select Van")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* How Mobile Processing Works */}
          <Card className="p-5">
            <h3 className="font-bold text-sm text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Layers size={16} className="text-[var(--honey-600)]" />
              {isHindi ? "मोबाइल प्रोसेसिंग वैन कैसे कार्य करती है?" : "KVIC Mobile Van Processing Stages"}
            </h3>
            <div className="grid sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[var(--bg-muted)] rounded-lg">
                <span className="font-bold text-[var(--honey-600)]">1. {isHindi ? "कच्चा शहद भार" : "Weighing"}</span>
                <p className="text-[var(--text-secondary)] mt-1">{isHindi ? "डिजिटल कांटे पर सटीक वजन व रिकॉर्ड" : "Digital calibrated weighment"}</p>
              </div>
              <div className="p-3 bg-[var(--bg-muted)] rounded-lg">
                <span className="font-bold text-[var(--honey-600)]">2. {isHindi ? "फिल्ट्रेशन" : "Micro-Filtration"}</span>
                <p className="text-[var(--text-secondary)] mt-1">{isHindi ? "मोम व अशुद्धियों को हटाना, पराग बचाना" : "Removes wax while preserving pollen"}</p>
              </div>
              <div className="p-3 bg-[var(--bg-muted)] rounded-lg">
                <span className="font-bold text-[var(--honey-600)]">3. {isHindi ? "नमी नियंत्रण" : "Vacuum Moisture"}</span>
                <p className="text-[var(--text-secondary)] mt-1">{isHindi ? "नमी को 20% से नीचे लाकर सुरक्षित करना" : "Moisture lowered below 20%"}</p>
              </div>
              <div className="p-3 bg-[var(--bg-muted)] rounded-lg">
                <span className="font-bold text-[var(--honey-600)]">4. {isHindi ? "लैब टेस्ट व QR" : "Lab Test & QR"}</span>
                <p className="text-[var(--text-secondary)] mt-1">{isHindi ? "FSSAI रिपोर्ट और ब्लॉकचेन QR जारी" : "FSSAI purity cert & batch QR"}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Slot Reservation Form */}
        <div>
          <Card className="p-5 sticky top-20">
            <h2 className="font-[family-name:var(--font-outfit)] text-lg font-bold text-[var(--text-primary)] mb-1">
              {isHindi ? "प्रोसेसिंग स्लॉट बुक करें" : "Book Processing Slot"}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              {isHindi
                ? "वैन आपके गाँव में आने पर आपका शहद प्राथमिकता से प्रोसेस किया जाएगा"
                : "Reserve priority processing and moisture testing for your harvested honey"}
            </p>

            {booked ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[var(--radius-lg)] text-emerald-800 text-center space-y-3">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h3 className="font-bold text-sm">{isHindi ? "स्लॉट सफलतापूर्वक बुक हुआ!" : "Slot Reserved Successfully!"}</h3>
                <p className="text-xs text-emerald-700 font-mono font-bold bg-white/70 py-1.5 px-3 rounded border border-emerald-200">
                  {isHindi ? "बुकिंग संदर्भ संख्या:" : "Booking Ref:"} {bookingRef}
                </p>
                <div className="text-xs text-left space-y-1 text-emerald-900 border-t border-emerald-200/60 pt-2">
                  <p>• <strong>{isHindi ? "मात्रा:" : "Quantity:"}</strong> {honeyQuantity} KG</p>
                  <p>• <strong>{isHindi ? "फूल स्रोत:" : "Flora:"}</strong> {honeyType}</p>
                  <p>• <strong>{isHindi ? "वैन:" : "Assigned Van:"}</strong> {VAN_SCHEDULES.find((v) => v.id === selectedVan)?.vanNumber}</p>
                  <p>• <strong>{isHindi ? "आगमन तिथि:" : "Date:"}</strong> {VAN_SCHEDULES.find((v) => v.id === selectedVan)?.arrivalDate}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBooked(false)}
                  className="btn-outline w-full text-xs py-2 mt-2 bg-white"
                >
                  {isHindi ? "दूसरा स्लॉट बुक करें" : "Book Another Slot"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    {isHindi ? "चयनित मोबाइल वैन" : "Selected Mobile Van"}
                  </label>
                  <select
                    value={selectedVan}
                    onChange={(e) => setSelectedVan(e.target.value)}
                    className="input text-xs"
                  >
                    {VAN_SCHEDULES.map((van) => (
                      <option key={van.id} value={van.id}>
                        {van.vanNumber} — {van.arrivalDate}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    {isHindi ? "बी-बॉक्स पहचान संख्या (Hive Code)" : "Source Hive Code"}
                  </label>
                  <input
                    type="text"
                    value={hiveCode}
                    onChange={(e) => setHiveCode(e.target.value)}
                    className="input text-xs font-mono"
                    placeholder="e.g. HIVE-007"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    {isHindi ? "अनुमानित शहद मात्रा (KG)" : "Estimated Honey Quantity (KG)"}
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={honeyQuantity}
                    onChange={(e) => setHoneyQuantity(e.target.value)}
                    className="input text-xs font-mono"
                    required
                  />
                  <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                    {isHindi ? "न्यूनतम 5 KG — अधिकतम 300 KG प्रति स्लॉट" : "Min 5 KG — Max 300 KG per slot"}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    {isHindi ? "फूल का प्रकार (Flora Source)" : "Floral Origin"}
                  </label>
                  <select
                    value={honeyType}
                    onChange={(e) => setHoneyType(e.target.value)}
                    className="input text-xs"
                  >
                    <option value="Mustard Flower (Sarson)">सरसों (Mustard Flower - Sarson)</option>
                    <option value="Eucalyptus (Safeda)">सफेदा (Eucalyptus - Safeda)</option>
                    <option value="Litchi Flower">लीची (Litchi Flower - Muzaffarpur)</option>
                    <option value="Sunflower (Surajmukhi)">सूरजमुखी (Sunflower)</option>
                    <option value="Multiflora (Wild Forest)">जंगली शहद (Multiflora Forest)</option>
                    <option value="Jamun Flower">जामुन (Jamun Flower)</option>
                  </select>
                </div>

                <div className="p-3 bg-[var(--honey-50)] rounded-lg border border-[var(--honey-200)] text-[11px] text-[var(--honey-800)] space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <FileCheck size={14} className="text-[var(--honey-600)]" />
                    {isHindi ? "केवीआईसी नि:शुल्क सुविधा" : "Zero Processing Charges"}
                  </p>
                  <p className="text-[10px] text-[var(--honey-700)]">
                    {isHindi
                      ? "केवीआईसी हनी मिशन के पंजीकृत पालकों के लिए ऑन-साइट प्रोसेसिंग पूर्णतया नि:शुल्क है।"
                      : "Processing is 100% subsidized under KVIC Honey Mission for registered apiaries."}
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Truck size={14} />
                  {isHindi ? "स्लॉट आरक्षित करें (Book Slot)" : "Confirm Reservation"}
                </button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
