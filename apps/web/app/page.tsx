"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { gsap, useGSAP } from "@/lib/gsap";
import QRScannerWidget from "@/components/QRScannerWidget";
import {
  Shield,
  Radio,
  Brain,
  QrCode,
  ArrowRight,
  ChevronRight,
  Hexagon,
  Leaf,
  Zap,
  Eye,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";

/* ─── Animated Counter Hook ─── */
function useCounter(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return { count, ref };
}

/* ─── Honeycomb SVG Decoration ─── */
function HoneycombPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute pointer-events-none opacity-[0.04] ${className}`}
      width="200"
      height="180"
      viewBox="0 0 200 180"
      fill="none"
    >
      <path
        d="M100 0L150 28.87V86.6L100 115.47L50 86.6V28.87L100 0Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M150 86.6L200 115.47V173.2L150 202.07L100 173.2V115.47L150 86.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M50 86.6L100 115.47V173.2L50 202.07L0 173.2V115.47L50 86.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const beekeepers = useCounter(1248, 2000);
  const hives = useCounter(8492, 2000);
  const honey = useCounter(182, 2000);

  useGSAP(() => {
    // Hero animations
    gsap.from(".hero-title", {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
    gsap.from(".hero-subtitle", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: "power3.out",
    });
    gsap.from(".hero-cta", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      delay: 0.4,
      ease: "power3.out",
    });
    gsap.from(".hero-badge", {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      delay: 0.6,
      ease: "back.out(1.7)",
    });

    // Floating honeycomb decorations
    gsap.to(".float-hex-1", {
      y: -15,
      rotation: 5,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(".float-hex-2", {
      y: 12,
      rotation: -3,
      duration: 3.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 0.5,
    });
    gsap.to(".float-hex-3", {
      y: -10,
      rotation: 8,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1,
    });

    // Features staggered reveal
    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 80%",
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: "power2.out",
    });

    // Timeline nodes
    gsap.from(".timeline-step", {
      scrollTrigger: {
        trigger: timelineRef.current,
        start: "top 80%",
      },
      x: -30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
    });

    // Stats
    gsap.from(".stat-card", {
      scrollTrigger: {
        trigger: ".stats-section",
        start: "top 85%",
      },
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
    });
  });

  return (
    <main className="min-h-screen relative overflow-hidden bg-[var(--bg-base)]">
      {/* ─── Floating Decorations ─── */}
      <div className="absolute top-[-120px] left-[10%] float-hex-1 text-[var(--honey-300)]">
        <HoneycombPattern />
      </div>
      <div className="absolute top-[200px] right-[5%] float-hex-2 text-[var(--orange-300)]">
        <HoneycombPattern />
      </div>
      <div className="absolute bottom-[300px] left-[5%] float-hex-3 text-[var(--honey-400)]">
        <HoneycombPattern />
      </div>

      {/* Gradient orb decorations */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[var(--honey-100)] via-[var(--honey-50)] to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute top-[400px] right-[-150px] w-[400px] h-[400px] bg-gradient-to-l from-[var(--orange-50)] to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" />

      {/* ─── Header ─── */}
      <header className="relative z-20 flex justify-between items-center p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--honey-500)] to-[var(--orange-600)] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">HC</span>
          </div>
          <div>
            <span className="font-bold text-lg text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
              HoneyChain
            </span>
            <span className="hidden sm:block text-[10px] text-[var(--honey-600)] uppercase tracking-widest font-semibold -mt-0.5">
              Blockchain Traceability
            </span>
          </div>
        </div>
        <div>
          {!isLoading && user ? (
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-sm font-medium text-[var(--text-secondary)]">
                Welcome, {user.name}
              </span>
              <div className="flex gap-2">
                <Link
                  href={
                    user.role === "BEEKEEPER"
                      ? "/dashboard/beekeeper"
                      : user.role === "ADMIN"
                        ? "/dashboard/admin"
                        : "/dashboard/supply-chain"
                  }
                  className="btn-primary text-sm"
                >
                  Dashboard
                  <ArrowRight size={14} />
                </Link>
                <button
                  onClick={logout}
                  className="btn-ghost text-sm text-[var(--text-secondary)]"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : !isLoading ? (
            <div className="flex gap-3">
              <Link
                href="/marketplace"
                className="btn-ghost text-sm text-[var(--text-secondary)] hover:text-[var(--honey-700)] transition-colors"
              >
                Marketplace
              </Link>
              <Link href="/login" className="btn-outline text-sm">
                Log In
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Get Started
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <div ref={heroRef} className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-12 lg:pt-20 pb-16 lg:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-full)] bg-[var(--honey-50)] border border-[var(--honey-200)] text-[var(--honey-700)] text-xs font-semibold mb-8">
            <Sparkles size={14} />
            KVIC Honey Mission • Blockchain Verified
          </div>

          {/* Title */}
          <h1 className="hero-title font-[family-name:var(--font-outfit)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.05]">
            From Hive to Home,{" "}
            <span className="gradient-text">Verified.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-base sm:text-lg md:text-xl text-[var(--text-secondary)] mt-6 max-w-2xl mx-auto leading-relaxed font-medium">
            Every drop of honey traced with blockchain immutability, IoT
            micro-climate monitoring, and AI-powered colony intelligence.
            Zero adulteration. Full transparency.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            {!isLoading && user ? (
              <Link
                href={
                  user.role === "BEEKEEPER"
                    ? "/dashboard/beekeeper"
                    : user.role === "ADMIN"
                      ? "/dashboard/admin"
                      : "/dashboard/supply-chain"
                }
                className="btn-primary text-base px-8 py-3"
              >
                Enter Your Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn-primary text-base px-8 py-3"
                >
                  Start Free
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary text-base px-8 py-3"
                >
                  View Demo
                </Link>
              </>
            )}
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-[var(--text-muted)] font-medium">
            {[
              { icon: <Shield size={14} />, label: "Blockchain Secured" },
              { icon: <Radio size={14} />, label: "IoT Monitored" },
              { icon: <Brain size={14} />, label: "AI Predicted" },
              { icon: <QrCode size={14} />, label: "QR Verified" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="text-[var(--honey-500)]">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Access Cards (if logged in) */}
        {!isLoading && user && (
          <div className="mt-16 max-w-2xl mx-auto">
            <Link
              href={
                user.role === "BEEKEEPER"
                  ? "/dashboard/beekeeper"
                  : user.role === "ADMIN"
                    ? "/dashboard/admin"
                    : "/dashboard/supply-chain"
              }
              className="group block p-8 bg-white border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-lg hover:shadow-xl hover:border-[var(--honey-300)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--honey-400)] to-[var(--honey-600)] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <LayoutDashboard size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
                      Continue to Dashboard
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                      Access your {user.role.toLowerCase()} operations
                    </p>
                  </div>
                </div>
                <ArrowUpRight
                  size={20}
                  className="text-[var(--honey-500)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
              </div>
            </Link>
          </div>
        )}

        {/* Portal Cards (if not logged in) */}
        {!isLoading && !user && (
          <>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
              {/* Beekeeper Portal */}
              <Link
                href="/login"
                className="group p-7 bg-white border border-[var(--border-default)] rounded-[var(--radius-xl)] hover:border-[var(--honey-300)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--honey-50)] flex items-center justify-center text-[var(--honey-600)] mb-4 group-hover:scale-110 transition-transform">
                    <Leaf size={24} />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
                    Beekeeper Portal
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                    IoT Sensor Nodes • Hive Setup • Digital Harvest Logging & Smart Contracts.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--honey-600)] mt-6 group-hover:gap-2.5 transition-all pt-4 border-t border-[var(--border-subtle)]">
                  Enter Portal
                  <ChevronRight size={16} />
                </div>
              </Link>

              {/* 4-Tier AI Suite */}
              <Link
                href="/dashboard/beekeeper/ai"
                className="group p-7 bg-gradient-to-br from-amber-500/10 via-white to-orange-500/10 border border-[var(--honey-300)] rounded-[var(--radius-xl)] hover:border-[var(--honey-500)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--honey-100)] flex items-center justify-center text-[var(--honey-700)] group-hover:scale-110 transition-transform">
                      <Brain size={24} />
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-[var(--honey-200)] text-[var(--honey-900)] border border-[var(--honey-300)]">
                      4-TIER AI
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
                    AI Agronomist Suite
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                    XGBoost Health • Edge Comb Vision • Acoustic FFT • FSSAI C4 Screener.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--honey-700)] mt-6 group-hover:gap-2.5 transition-all pt-4 border-t border-amber-200/80">
                  Launch AI Suite
                  <ChevronRight size={16} />
                </div>
              </Link>

              {/* Supply Chain Portal */}
              <Link
                href="/login"
                className="group p-7 bg-white border border-[var(--border-default)] rounded-[var(--radius-xl)] hover:border-[var(--orange-300)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--orange-50)] flex items-center justify-center text-[var(--orange-600)] mb-4 group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
                    Supply Chain Portal
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                    Factory Processing • Lab Testing • Custody Transfers • Retail.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--orange-600)] mt-6 group-hover:gap-2.5 transition-all pt-4 border-t border-[var(--border-subtle)]">
                  Enter Portal
                  <ChevronRight size={16} />
                </div>
              </Link>
            </div>

            {/* Verify a Honey Product */}
            <div className="text-center mb-16">
              <div className="inline-block p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-[var(--border-default)] shadow-sm">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center justify-center gap-2">
                  <QrCode className="text-[var(--honey-600)]" size={20} /> Verify a Honey Product
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4 max-w-sm">
                  Consumers can instantly verify the authenticity and entire supply chain journey of their honey. No account needed.
                </p>
                <div className="max-w-xs mx-auto">
                  <QRScannerWidget />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-[3px] border-[var(--honey-500)] border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* ─── Features Section ─── */}
      {!isLoading && !user && (
        <div ref={featuresRef} className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-20">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-[var(--honey-600)] uppercase tracking-widest mb-3">
              How It Works
            </p>
            <h2 className="font-[family-name:var(--font-outfit)] text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
              Technology Meets Tradition
            </h2>
            <p className="text-[var(--text-secondary)] mt-3 max-w-lg mx-auto">
              Combining centuries-old beekeeping craft with cutting-edge
              blockchain, IoT, and AI technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Hexagon size={24} />,
                title: "Blockchain Traceability",
                description:
                  "Every honey batch gets a cryptographic SHA-256 hash anchored on-chain. Any tampering triggers instant consumer alerts.",
                color: "from-[var(--honey-50)] to-[var(--honey-100)]",
                iconColor: "text-[var(--honey-600)]",
                borderColor: "hover:border-[var(--honey-300)]",
              },
              {
                icon: <Radio size={24} />,
                title: "IoT Hive Monitoring",
                description:
                  "ESP32 sensors track brood temperature, humidity, weight, and bee activity in real-time across every smart bee box.",
                color: "from-[var(--orange-50)] to-[var(--orange-100)]",
                iconColor: "text-[var(--orange-600)]",
                borderColor: "hover:border-[var(--orange-300)]",
              },
              {
                icon: <Brain size={24} />,
                title: "AI Colony Intelligence",
                description:
                  "XGBoost models predict hive health scores, disease risk, and harvest windows — giving beekeepers actionable insights.",
                color: "from-purple-50 to-indigo-50",
                iconColor: "text-purple-600",
                borderColor: "hover:border-purple-300",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`feature-card group p-7 bg-white border border-[var(--border-default)] rounded-[var(--radius-xl)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${feature.borderColor}`}
              >
                <div
                  className={`w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${feature.color} flex items-center justify-center ${feature.iconColor} mb-5 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── How It Works Timeline ─── */}
      {!isLoading && !user && (
        <div ref={timelineRef} className="relative z-10 max-w-5xl mx-auto px-4 lg:px-8 py-20">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-[var(--honey-600)] uppercase tracking-widest mb-3">
              Supply Chain Journey
            </p>
            <h2 className="font-[family-name:var(--font-outfit)] text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
              Every Step, Verified
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: "🌸", label: "Flora Source", step: "1" },
              { icon: "🐝", label: "Hive & Harvest", step: "2" },
              { icon: "🧪", label: "Quality Lab", step: "3" },
              { icon: "🏭", label: "Processing", step: "4" },
              { icon: "📦", label: "Distribution", step: "5" },
              { icon: "🛒", label: "Retail", step: "6" },
            ].map((item, i) => (
              <div key={item.step} className="timeline-step text-center">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white border-2 border-[var(--border-default)] flex items-center justify-center text-2xl shadow-sm group-hover:border-[var(--honey-300)] transition-colors">
                    {item.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--honey-600)] text-white text-[10px] font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-secondary)] mt-3">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Stats Section ─── */}
      {!isLoading && !user && (
        <div className="stats-section relative z-10 max-w-5xl mx-auto px-4 lg:px-8 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="stat-card text-center p-8 bg-white border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-sm">
              <p
                ref={beekeepers.ref}
                className="text-4xl font-bold text-[var(--honey-600)] font-[family-name:var(--font-outfit)] tabular-data"
              >
                {beekeepers.count.toLocaleString()}+
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-2 font-medium">
                Registered Beekeepers
              </p>
            </div>
            <div className="stat-card text-center p-8 bg-white border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-sm">
              <p
                ref={hives.ref}
                className="text-4xl font-bold text-[var(--honey-600)] font-[family-name:var(--font-outfit)] tabular-data"
              >
                {hives.count.toLocaleString()}+
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-2 font-medium">
                Smart IoT Hives
              </p>
            </div>
            <div className="stat-card text-center p-8 bg-white border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-sm">
              <p
                ref={honey.ref}
                className="text-4xl font-bold text-[var(--honey-600)] font-[family-name:var(--font-outfit)] tabular-data"
              >
                {honey.count}+
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-2 font-medium">
                Tons Honey Tracked
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── CTA Section ─── */}
      {!isLoading && !user && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-20">
          <div className="relative overflow-hidden bg-gradient-to-br from-[var(--honey-600)] to-[var(--orange-600)] rounded-[var(--radius-2xl)] p-10 lg:p-16 text-center text-white">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10">
              <h2 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl md:text-4xl font-bold">
                Ready to Verify Your Honey?
              </h2>
              <p className="text-white/80 mt-4 max-w-lg mx-auto text-sm sm:text-base">
                Scan any HoneyChain QR code to see the complete journey — from
                the hive it came from to the lab that tested it.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <Link
                  href="/verify/HC-2026-000127"
                  className="inline-flex items-center gap-2 bg-white text-[var(--honey-700)] font-bold px-8 py-3 rounded-[var(--radius-md)] hover:bg-white/90 transition-colors shadow-lg text-sm"
                >
                  <Eye size={16} />
                  Try Verification Demo
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-3 rounded-[var(--radius-md)] hover:bg-white/20 transition-colors border border-white/20 text-sm"
                >
                  Join as Beekeeper
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-[var(--border-default)] mt-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--honey-500)] to-[var(--orange-600)] flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs">HC</span>
                </div>
                <span className="font-bold text-lg text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
                  HoneyChain
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm">
                Digital ecosystem for rural beekeepers and consumer trust.
                Blockchain-verified honey traceability powered by IoT and AI.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
                <li>
                  <Link
                    href="/register"
                    className="hover:text-[var(--honey-600)] transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-[var(--honey-600)] transition-colors"
                  >
                    Beekeeper Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/verify/HC-2026-000127"
                    className="hover:text-[var(--honey-600)] transition-colors"
                  >
                    Verify Honey
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Initiative
              </h4>
              <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
                <li>KVIC Honey Mission</li>
                <li>Ministry of MSME</li>
                <li>FSSAI Compliance</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <p>
              &copy; 2026 HoneyChain. Built for the Khadi and Village Industries
              Commission.
            </p>
            <p className="font-medium text-[var(--text-secondary)]">
              Blockchain • IoT • AI • Trust
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
