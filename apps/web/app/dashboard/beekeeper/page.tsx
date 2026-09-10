"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { AudioSpeaker } from "@/components/ui/AudioSpeaker";
import {
  Box,
  FlaskConical,
  Scale,
  Heart,
  AlertTriangle,
  Info,
  TrendingUp,
  Brain,
  Shield,
  ArrowRight,
  Truck,
  Compass,
  Stethoscope,
  Coins,
  Building,
  Tag,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const DEMO_HIVES = [
  { id: "HIVE-001", location: "Sonipat, Haryana", flower: "Mustard", health: 94, temp: 34.2, humidity: 65, weight: 42.1, status: "active" },
  { id: "HIVE-003", location: "Sonipat, Haryana", flower: "Eucalyptus", health: 88, temp: 33.8, humidity: 68, weight: 38.5, status: "active" },
  { id: "HIVE-007", location: "Sonipat, Haryana", flower: "Mustard", health: 91, temp: 34.5, humidity: 67, weight: 38.4, status: "active" },
  { id: "HIVE-012", location: "Panipat, Haryana", flower: "Litchi", health: 72, temp: 36.1, humidity: 75, weight: 31.2, status: "warning" },
  { id: "HIVE-018", location: "Panipat, Haryana", flower: "Sunflower", health: 96, temp: 33.9, humidity: 62, weight: 45.8, status: "active" },
];

const DEMO_BATCHES = [
  { id: "HC-2026-000127", honey: "Mustard Flower", qty: "18.5 KG", date: "22 Aug 2026", status: "pass", label: "Verified" },
  { id: "HC-2026-000125", honey: "Eucalyptus", qty: "22.0 KG", date: "18 Aug 2026", status: "processing", label: "Processing" },
  { id: "HC-2026-000121", honey: "Litchi", qty: "15.2 KG", date: "12 Aug 2026", status: "tested", label: "Lab Testing" },
  { id: "HC-2026-000118", honey: "Mustard Flower", qty: "28.4 KG", date: "05 Aug 2026", status: "distributed", label: "Distributed" },
];

function getHealthColor(health: number) {
  if (health >= 90) return "bg-emerald-500";
  if (health >= 75) return "bg-[var(--honey-500)]";
  return "bg-[var(--color-danger)]";
}

export default function BeekeeperDashboard() {
  const { language, t } = useLanguage();
  const isHindi = language === "hi";
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      label: t("totalHives"),
      value: "24",
      icon: <Box size={20} />,
      change: isHindi ? "+3 इस माह" : "+3 this month",
      color: "from-[var(--honey-50)] to-[var(--honey-100)]",
      iconColor: "text-[var(--honey-600)]",
    },
    {
      label: t("activeBatches"),
      value: "8",
      icon: <FlaskConical size={20} />,
      change: isHindi ? "5 ब्लॉकचेन सत्यापित" : "5 on-chain verified",
      color: "from-blue-50 to-indigo-50",
      iconColor: "text-blue-600",
    },
    {
      label: t("honeyProduced"),
      value: "486 KG",
      icon: <Scale size={20} />,
      change: isHindi ? "+62 KG इस सप्ताह" : "+62 KG this week",
      color: "from-orange-50 to-amber-50",
      iconColor: "text-orange-600",
    },
    {
      label: t("avgHiveHealth"),
      value: "91%",
      icon: <Heart size={20} />,
      change: isHindi ? "उत्कृष्ट स्थिति (A+)" : "Excellent (A+)",
      color: "from-emerald-50 to-green-50",
      iconColor: "text-emerald-600",
    },
  ];

  const quickTools = [
    {
      title: isHindi ? "केवीआईसी मोबाइल प्रोसेसिंग वैन" : "KVIC Mobile Processing Van",
      sub: isHindi ? "गाँव में ऑन-साइट 300 किग्रा/दिन फिल्ट्रेशन व तत्काल लैब टेस्ट" : "In-situ 300kg/day filtration & on-the-spot lab purity testing",
      icon: <Truck size={20} className="text-white" />,
      bg: "from-amber-600 to-orange-700",
      badge: isHindi ? "आगमन: 02 Sep (सोनीपत)" : "Arrival: 02 Sep (Sonipat)",
      href: "/dashboard/beekeeper/processing-van",
    },
    {
      title: isHindi ? "फूल एवं प्रवास कैलेंडर" : "Flora & Migratory Calendar",
      sub: isHindi ? "सरसों, सफेदा व लीची का समय देखें और बक्से समय पर शिफ्ट करें" : "Nectar bloom forecasting across Haryana, UP & Bihar orchards",
      icon: <Compass size={20} className="text-white" />,
      bg: "from-emerald-600 to-teal-700",
      badge: isHindi ? "सरसों सक्रिय (Peak Yield)" : "Mustard Active (Peak)",
      href: "/dashboard/beekeeper/flora-calendar",
    },
    {
      title: isHindi ? "मधुमक्खी डॉक्टर (रोग निवारण)" : "Bee Doctor & Disease Guide",
      sub: isHindi ? "वारोआ माइट, मोम का कीड़ा और रोगों के जैविक देसी इलाज" : "Visual symptoms & KVIC-approved organic treatments (Thymol, Neem)",
      icon: <Stethoscope size={20} className="text-white" />,
      bg: "from-red-600 to-rose-700",
      badge: isHindi ? "CBRTI पुणे हेल्पलाइन" : "CBRTI Helpline Active",
      href: "/dashboard/beekeeper/disease-guide",
    },
    {
      title: isHindi ? "मंडी भाव एवं उचित मूल्य" : "Mandi vs Fair Price Calc",
      sub: isHindi ? "बिचौलियों की सस्ती दर बनाम केवीआईसी खरीद मूल्य में तुलना करें" : "Compare middleman rates vs KVIC MSP and calculate extra profit",
      icon: <Coins size={20} className="text-white" />,
      bg: "from-blue-600 to-indigo-700",
      badge: isHindi ? "+₹150/KG अतिरिक्त मुनाफा" : "+₹150/KG Net Gain",
      href: "/dashboard/beekeeper/fair-pricing",
    },
    {
      title: isHindi ? "केवीआईसी योजनाएं एवं सब्सिडी" : "KVIC Schemes & Subsidies",
      sub: isHindi ? "10-बॉक्स हनी मिशन और PMEGP 35% पूंजीगत सब्सिडी गाइड" : "10-box Honey Mission distribution & PMEGP 35% capital subsidy",
      icon: <Building size={20} className="text-white" />,
      bg: "from-purple-600 to-indigo-800",
      badge: isHindi ? "35% सरकारी अनुदान" : "35% Grant Subsidies",
      href: "/dashboard/beekeeper/kvic-schemes",
    },
    {
      title: isHindi ? "शीशी के क्यूआर स्टीकर प्रिंट करें" : "Print Honey Jar QR Labels",
      sub: isHindi ? "हाट व मेलों में बेचने के लिए प्रामाणिक क्यूआर लेबल शीट निकालें" : "Print physical tamper-proof QR labels for direct farm-gate sales",
      icon: <Tag size={20} className="text-white" />,
      bg: "from-teal-600 to-emerald-800",
      badge: isHindi ? "A4 स्टीकर शीट तैयार" : "A4 Sheet Ready",
      href: "/dashboard/beekeeper/qr-labels",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--honey-50)] border border-[var(--honey-200)] text-[var(--honey-700)] text-xs font-semibold mb-1">
            <Sparkles size={13} className="text-[var(--honey-600)]" />
            {isHindi ? "केवीआईसी हनी मिशन — मीठी क्रांति" : "KVIC Honey Mission • Sweet Revolution"}
          </div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
            {t("dashboardTitle")}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {liveTime.toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AudioSpeaker />
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-success)] bg-[var(--color-success-bg)] px-3 py-1.5 rounded-[var(--radius-full)] border border-[var(--color-success-border)]">
            <span className="w-2 h-2 bg-[var(--color-success)] rounded-full pulse-dot" />
            {t("iotActive")}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1.5 font-[family-name:var(--font-outfit)]">
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5">{stat.change}</p>
              </div>
              <div className={`w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br ${stat.color} flex items-center justify-center ${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Rural Empowerment & KVIC Suite */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--honey-600)]" />
            {isHindi ? "ग्रामीण पालक एवं केवीआईसी सशक्तिकरण सेवाएं" : "Rural Beekeeper & KVIC Empowerment Hub"}
          </h2>
          <span className="text-xs font-semibold text-[var(--honey-700)] bg-[var(--honey-50)] px-2.5 py-1 rounded-full border border-[var(--honey-200)]">
            {isHindi ? "6 विशेष ग्रामीण टूल्स" : "6 Rural Tools"}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickTools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="p-5 rounded-[var(--radius-xl)] bg-white border border-[var(--border-default)] hover:border-[var(--honey-400)] hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.bg} flex items-center justify-center shadow-sm`}>
                    {tool.icon}
                  </div>
                  <span className="text-[10px] font-bold text-[var(--honey-800)] bg-[var(--honey-50)] px-2 py-0.5 rounded-full border border-[var(--honey-200)]">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--honey-700)] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                  {tool.sub}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-default)]/60 flex items-center justify-between text-xs font-semibold text-[var(--honey-700)]">
                <span>{isHindi ? "सुविधा देखें" : "Open Module"}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two column layout: Hives & Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hives */}
        <Card className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <Box size={16} className="text-[var(--honey-600)]" />
              {isHindi ? "मेरे बी-बॉक्सेस (Live Telemetry)" : "My Bee Hives (Live Telemetry)"}
            </h2>
            <Link href="/dashboard/beekeeper/hives" className="text-xs text-[var(--honey-600)] hover:text-[var(--honey-700)] font-semibold">
              {DEMO_HIVES.length} {isHindi ? "बक्से सक्रिय" : "active"} →
            </Link>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {DEMO_HIVES.map((hive) => (
              <div key={hive.id} className="p-4 hover:bg-[var(--bg-muted)] transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-sm text-[var(--honey-600)]">{hive.id}</span>
                    {hive.status === "warning" && (
                      <StatusBadge state="fail" label={isHindi ? "निरीक्षण आवश्यक" : "ATTENTION"} showDot={false} />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getHealthColor(hive.health)} transition-all duration-500`}
                        style={{ width: `${hive.health}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-secondary)] w-8 text-right tabular-data">
                      {hive.health}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[var(--text-muted)]">{isHindi ? "तापमान" : "Temp"}</span>
                    <p className={`font-semibold mt-0.5 tabular-data ${hive.temp > 35 ? "text-[var(--color-danger)]" : "text-[var(--text-primary)]"}`}>
                      {hive.temp}°C
                    </p>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">{isHindi ? "नमी" : "Humidity"}</span>
                    <p className="font-semibold mt-0.5 text-[var(--text-primary)] tabular-data">{hive.humidity}%</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">{isHindi ? "वजन" : "Weight"}</span>
                    <p className="font-semibold mt-0.5 text-[var(--text-primary)] tabular-data">{hive.weight} kg</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">{isHindi ? "फूल स्रोत" : "Flower"}</span>
                    <p className="font-semibold mt-0.5 text-[var(--text-primary)]">{hive.flower}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Batches */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <FlaskConical size={16} className="text-[var(--honey-600)]" />
              {isHindi ? "हालिया शहद बैच" : "Recent Honey Batches"}
            </h2>
            <Link href="/dashboard/beekeeper/batches" className="text-xs text-[var(--honey-600)] hover:text-[var(--honey-700)] font-semibold transition-colors cursor-pointer">
              {isHindi ? "सभी देखें →" : "View All →"}
            </Link>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {DEMO_BATCHES.map((batch) => (
              <div key={batch.id} className="p-4 hover:bg-[var(--bg-muted)] transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm font-medium text-[var(--text-primary)]">{batch.id}</span>
                  <StatusBadge state={batch.status as any} label={batch.label} />
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{batch.honey} · {batch.qty}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{batch.date}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Hive Intelligence */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Brain size={18} className="text-[var(--honey-600)]" />
          <h2 className="font-semibold text-sm text-[var(--text-primary)]">
            {isHindi ? "एआई छत्ता विश्लेषण (AI Hive Intelligence)" : "AI Hive Intelligence"}
          </h2>
          <StatusBadge state="info" label="AI-ASSISTED" showDot={false} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] border border-[var(--color-success-border)]">
            <p className="text-xs font-medium text-[var(--text-muted)] mb-1">
              {isHindi ? "समग्र स्वास्थ्य स्कोर" : "Overall Health Score"}
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-[var(--color-success)] tabular-data font-[family-name:var(--font-outfit)]">91</span>
              <span className="text-[var(--text-muted)] text-sm mb-1">/100</span>
            </div>
            <div className="mt-2 health-bar">
              <div className="health-bar-fill bg-[var(--color-success)]" style={{ width: "91%" }} />
            </div>
            <p className="text-xs text-[var(--color-success)] mt-2 font-semibold">
              {isHindi ? "उत्कृष्ट स्थिति (Excellent)" : "Excellent condition"}
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--honey-50)] border border-[var(--honey-200)]">
            <p className="text-xs font-medium text-[var(--text-muted)] mb-1">
              {isHindi ? "जोखिम आकलन" : "Risk Assessment"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-[var(--color-success)] font-[family-name:var(--font-outfit)]">
                {isHindi ? "न्यूनतम (LOW)" : "LOW"}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
              {isHindi
                ? "1 छत्ता (HIVE-012) सामान्य से अधिक तापमान पर है। छायादार स्थान पर रखने की सलाह है।"
                : "1 hive (HIVE-012) requires monitoring. Temperature trending above normal."}
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-info-bg)] border border-[var(--color-info-border)]">
            <p className="text-xs font-medium text-[var(--text-muted)] mb-1">
              {isHindi ? "उत्पादन पूर्वानुमान" : "Productivity Forecast"}
            </p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-3xl font-bold text-[var(--color-info)] tabular-data font-[family-name:var(--font-outfit)]">18.6</span>
              <span className="text-[var(--text-muted)] text-sm mb-1">KG</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              HIVE-007 · {isHindi ? "सटीकता: 81% · 5-8 दिन में निष्कासन" : "Confidence: 81% · Window: 5-8 days"}
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border-default)]">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">{isHindi ? "एआई विशेषज्ञ सलाह:" : "AI Recommendation:"}</strong>{" "}
            {isHindi
              ? "मौसम एवं सरसों का फूल वर्तमान में अनुकूल है। HIVE-012 की नमी पर 24 घंटे नज़र रखें। HIVE-018 इस सप्ताह भरपूर शहद निष्कासन के लिए तैयार है।"
              : "Conditions appear favorable for continued colony activity. Monitor HIVE-012 humidity closely over the next 24 hours. HIVE-018 shows strong harvest potential."}
          </p>
        </div>
      </Card>
    </div>
  );
}
