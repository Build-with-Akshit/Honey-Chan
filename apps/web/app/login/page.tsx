"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, Shield, Hexagon, Sparkles } from "lucide-react";

export default function Login() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [web3Loading, setWeb3Loading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "BEEKEEPER") router.push("/dashboard/beekeeper");
      else if (user.role === "ADMIN") router.push("/dashboard/admin");
      else router.push("/dashboard/supply-chain");
    }
  }, [user, isLoading, router]);

  const handleWeb3Login = async () => {
    setError("");
    setWeb3Loading(true);

    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask is not installed. Please install it to use Web3 login.");
      setWeb3Loading(false);
      return;
    }

    try {
      // 1. Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      // 2. Sign a message
      const message = `Please sign this message to authenticate with HoneyChain.\n\nTimestamp: ${Date.now()}`;
      const signature = await signer.signMessage(message);

      // 3. Send to backend
      await login({ walletAddress, signature, message });
    } catch (err: any) {
      console.error(err);
      if (err.code === "ACTION_REJECTED" || (err.message && err.message.includes("rejected"))) {
        setError("Login cancelled. You rejected the signature request in MetaMask.");
      } else if (err.message && err.message.includes("Wallet not registered")) {
        setError("Wallet not registered. Redirecting to signup...");
        setTimeout(() => {
          router.push("/register");
        }, 2000);
      } else {
        setError(err.message || "Web3 Login failed");
      }
    } finally {
      setWeb3Loading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || "Failed to login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-[var(--bg-base)]">
      {/* Left — Branded Hero (hidden on mobile, synchronized full-height column on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[var(--honey-600)] via-[var(--honey-700)] to-[var(--orange-700)] text-white p-8 xl:p-12 flex-col justify-between h-full">
        {/* Decorative background shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute top-1/3 right-[-40px] w-48 h-48 border border-white/10 rounded-full pointer-events-none" />

        {/* Left Top: Brand Identity & Network Status */}
        <div className="relative z-10 flex items-center justify-between w-full max-w-lg mx-auto">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md overflow-hidden border border-white/20 shadow-sm group-hover:scale-105 transition-transform">
              <Image src="/favicon.png" alt="HoneyChain" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-bold text-xl font-[family-name:var(--font-outfit)] tracking-tight block leading-none text-white">
                HoneyChain
              </span>
              <span className="text-[11px] text-white/70 font-medium tracking-wide">
                Provenance & Quality
              </span>
            </div>
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs border border-white/15 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Sepolia Live
          </span>
        </div>

        {/* Left Middle: Hero Content & Value Highlights */}
        <div className="relative z-10 max-w-lg mx-auto w-full space-y-5 my-auto py-2">
          <div>
            <span className="inline-block px-2.5 py-1 rounded-md bg-white/15 text-amber-100 text-[11px] font-bold uppercase tracking-wider mb-2.5 backdrop-blur-xs border border-white/10">
              Decentralized Supply Chain
            </span>
            <h1 className="font-[family-name:var(--font-outfit)] text-3xl xl:text-4xl font-extrabold leading-tight text-white">
              Welcome back to the future of honey traceability.
            </h1>
            <p className="text-white/80 mt-2.5 text-xs sm:text-sm leading-relaxed">
              Log in to manage your hives, track batches on blockchain, and monitor IoT sensor data in real-time.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {[
              {
                icon: <Shield size={16} />,
                title: "Blockchain-Secured Records",
                desc: "Tamper-proof batch custody from hive to bottle",
              },
              {
                icon: <Hexagon size={16} />,
                title: "Real-Time IoT Monitoring",
                desc: "Live telemetry for hive temperature, humidity & weight",
              },
              {
                icon: <Sparkles size={16} />,
                title: "AI-Powered Colony Intelligence",
                desc: "Automated defect detection & yield optimization",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white/95"
              >
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-none text-white">{item.title}</p>
                  <p className="text-[11px] text-white/75 truncate mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left Bottom: Trust & Regulatory Guarantee */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-white/70 max-w-lg mx-auto w-full pt-3 border-t border-white/15">
          <span>© 2026 HoneyChain Consortium</span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="text-emerald-300">●</span> 100% On-Chain Ledger
          </span>
        </div>
      </div>

      {/* Right — Form (Synchronized Top, Center, and Bottom) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-10 bg-[var(--bg-base)] h-full overflow-y-auto">
        {/* Right Top: Navigation & Support */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto shrink-0">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-amber-500/30">
              <Image src="/favicon.png" alt="HoneyChain" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-base text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
              HoneyChain
            </span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-amber-700 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">Verify jar?</span>
            <Link
              href="/scan"
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
            >
              Scan Batch QR
            </Link>
          </div>
        </div>

        {/* Right Middle: Sign In Form Box */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
          <div className="mb-3">
            <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)] leading-tight">
              Sign In
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Enter your credentials or authenticate via MetaMask
            </p>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-xs rounded-lg border border-[var(--color-danger-border)] font-medium">
              {error}
            </div>
          )}

          {/* Web3 1-Click Login */}
          <button
            type="button"
            onClick={handleWeb3Login}
            disabled={web3Loading || loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold h-9 px-4 rounded-xl flex justify-center items-center gap-2 transition-all mb-2 text-xs cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50"
          >
            {web3Loading ? "Connecting to MetaMask..." : "🦊 Login with MetaMask"}
          </button>

          <div className="relative flex py-0.5 items-center mb-2">
            <div className="flex-grow border-t border-[var(--border-default)]"></div>
            <span className="flex-shrink-0 mx-3 text-[var(--text-muted)] text-[10px] uppercase tracking-wider font-semibold">
              Or continue with Email
            </span>
            <div className="flex-grow border-t border-[var(--border-default)]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <label htmlFor="login-email" className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input !h-9 !min-h-[36px] !py-1.5 !pl-9 pr-3 text-xs rounded-xl"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input !h-9 !min-h-[36px] !py-1.5 !pl-9 !pr-9 text-xs rounded-xl"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !h-9 !min-h-[36px] !py-1.5 mt-0.5 text-xs font-bold rounded-xl cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 justify-center font-bold">
                  Sign In
                  <ArrowRight size={14} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-2 text-center text-xs text-[var(--text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-amber-700 hover:text-amber-800 transition-colors"
            >
              Create Account
            </Link>
          </div>

          {/* Test Accounts — Compact, synchronized 1-click grid */}
          <div className="mt-2.5 p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                <span>⚡</span>
                <span>Demo Accounts</span>
              </span>
              <span className="text-[10px] font-semibold text-amber-800/80">1-Click Auto Fill</span>
            </div>

            <div className="grid grid-cols-4 gap-1 mb-1">
              {[
                { label: "Beekeeper", email: "ramesh.sonipat@gmail.com", icon: "🐝" },
                { label: "Processor", email: "contact@abchoney.in", icon: "🏭" },
                { label: "Lab", email: "lab.verify@fssai-approved.gov.in", icon: "🧪" },
                { label: "Distributor", email: "distributor@honeychain.in", icon: "🚚" },
              ].map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword("password123");
                  }}
                  title={`Fill ${account.label} credentials`}
                  className="p-1 rounded-lg border border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-100/60 transition-all text-center cursor-pointer shadow-2xs group"
                >
                  <span className="text-xs block leading-none">{account.icon}</span>
                  <span className="font-semibold text-[10px] text-gray-800 group-hover:text-amber-900 block truncate mt-0.5">
                    {account.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-1">
              {[
                { label: "Wholesaler", email: "wholesaler@honeychain.in", icon: "📦" },
                { label: "Retailer", email: "store@freshmart.in", icon: "🏪" },
                { label: "Admin Console", email: "admin@honeychain.gov.in", icon: "🏛️" },
              ].map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword("password123");
                  }}
                  title={`Fill ${account.label} credentials`}
                  className="p-1 rounded-lg border border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-100/60 transition-all text-center cursor-pointer shadow-2xs group flex items-center justify-center gap-1"
                >
                  <span className="text-xs">{account.icon}</span>
                  <span className="font-semibold text-[10px] text-gray-800 group-hover:text-amber-900 truncate">
                    {account.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Bottom: Protocol & Compliance Footer */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 max-w-md mx-auto w-full pt-2.5 border-t border-gray-100 shrink-0">
          <span>HoneyChain Provenance Protocol</span>
          <span className="font-medium text-gray-500">Agmark & FSSAI Compliant</span>
        </div>
      </div>
    </div>
  );
}
