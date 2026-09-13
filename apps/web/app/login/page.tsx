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
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-[#FFFDF9]">
      {/* Left — The Honey Vault Hero (hidden on mobile, synchronized full-height column on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#92400E] via-[#B45309] to-[#78350F] text-white p-8 xl:p-12 flex-col justify-between h-full shadow-2xl">
        {/* Subtle Honeycomb Hexagonal SVG Mesh */}
        <div 
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23ffffff' fill-opacity='1' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 49l12.98-7.5v-15L0 19v30zm1 1.16V20.16l10.98 6.34v12.69L1 47.84zm14 1.16l13-7.5v-15L15 19v30zm1-1.16V20.16l11 6.34v12.69L16 47.84zM13.99 0L27 7.5v15l-13-7.5L1 7.5v-15L13.99 0zM3 8.65v12.7l10.99-6.35 11 6.35V8.65L14 2.3 3 8.65z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient radial lighting */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-orange-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-[-20px] w-64 h-64 bg-yellow-300/15 rounded-full blur-2xl pointer-events-none" />

        {/* Left Top: Brand Identity & Network Status */}
        <div className="relative z-10 flex items-center justify-between w-full max-w-lg mx-auto">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md overflow-hidden border border-white/30 shadow-lg group-hover:scale-105 transition-transform">
              <Image src="/favicon.png" alt="HoneyChain" width={44} height={44} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-extrabold text-2xl font-[family-name:var(--font-outfit)] tracking-tight block leading-none text-white drop-shadow-sm">
                HoneyChain
              </span>
              <span className="text-[11px] text-amber-100/80 font-semibold tracking-wider uppercase mt-0.5 block">
                Decentralized Provenance
              </span>
            </div>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md border border-white/25 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
            <span>Sepolia Live</span>
          </div>
        </div>

        {/* Left Middle: Hero Content & Value Highlights */}
        <div className="relative z-10 max-w-lg mx-auto w-full space-y-5 my-auto py-2">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-300/20 text-amber-200 text-xs font-bold uppercase tracking-wider mb-2.5 backdrop-blur-sm border border-amber-300/30">
              <Sparkles size={13} className="text-amber-300" />
              <span>Purity Guaranteed On-Chain</span>
            </span>
            <h1 className="font-[family-name:var(--font-outfit)] text-3xl xl:text-4xl font-extrabold leading-[1.18] text-white drop-shadow-sm">
              From Apiary to Table. Pure Honey on Blockchain.
            </h1>
            <p className="text-white/85 mt-2.5 text-xs sm:text-sm leading-relaxed max-w-md">
              Log in to manage your hives, track batches on blockchain, and monitor IoT sensor telemetry in real-time.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {[
              {
                icon: <Shield size={17} className="text-amber-300" />,
                title: "Cryptographic Batch Custody",
                desc: "100% on-chain Ethereum smart contract proof from harvest to consumer.",
                tag: "Tamper-Proof",
              },
              {
                icon: <Hexagon size={17} className="text-amber-300" />,
                title: "Real-Time IoT Telemetry",
                desc: "Live colony sensors monitoring temperature, humidity, and weight.",
                tag: "Live Telemetry",
              },
              {
                icon: <Sparkles size={17} className="text-amber-300" />,
                title: "AI Purity Intelligence",
                desc: "Automated FSSAI & Agmark compliance verification and adulteration alerts.",
                tag: "FSSAI & Agmark",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all duration-200 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/30 border border-white/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <span className="text-[10px] font-semibold text-amber-200 bg-white/10 px-2 py-0.5 rounded-full border border-white/15 shrink-0">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/75 truncate mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Micro Stats Row */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-center">
            <div className="p-2 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
              <p className="text-base font-extrabold text-white">14,280+</p>
              <p className="text-[10px] text-amber-100/75 uppercase tracking-wider font-semibold">KG Verified</p>
            </div>
            <div className="p-2 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
              <p className="text-base font-extrabold text-white">100%</p>
              <p className="text-[10px] text-amber-100/75 uppercase tracking-wider font-semibold">On-Chain</p>
            </div>
            <div className="p-2 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
              <p className="text-base font-extrabold text-white">&lt;45°C</p>
              <p className="text-[10px] text-amber-100/75 uppercase tracking-wider font-semibold">Raw Standard</p>
            </div>
          </div>
        </div>

        {/* Left Bottom: Trust & Regulatory Guarantee */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-white/70 max-w-lg mx-auto w-full pt-3 border-t border-white/15">
          <span>© 2026 HoneyChain Consortium</span>
          <span className="flex items-center gap-1.5 font-semibold text-amber-100">
            <span className="text-emerald-300">●</span> Sepolia Smart Contract Verified
          </span>
        </div>
      </div>

      {/* Right — Elevated Frosted Glass Auth Card */}
      <div className="flex-1 relative flex flex-col justify-between p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-[#FFFDF9] via-[#FFFBEB]/40 to-[#FEF3C7]/20 h-full overflow-y-auto">
        {/* Soft Ambient Light Glows */}
        <div className="pointer-events-none absolute top-1/4 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-1/4 left-1/4 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl" />

        {/* Right Top: Navigation & Quick Scan */}
        <div className="relative z-10 flex items-center justify-between w-full max-w-[440px] mx-auto shrink-0 mb-1">
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-amber-800 transition-colors bg-white/90 hover:bg-white px-3 py-1.5 rounded-full border border-gray-200/80 shadow-2xs"
          >
            <ArrowLeft size={13} />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/scan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100/90 hover:bg-amber-200/90 px-3 py-1.5 rounded-full border border-amber-300/70 transition-all shadow-2xs"
          >
            <span>📱</span>
            <span>Scan Batch QR</span>
          </Link>
        </div>

        {/* Right Middle: Elevated Frosted Card */}
        <div className="relative z-10 w-full max-w-[440px] mx-auto my-auto py-1">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-amber-200/80 shadow-[0_16px_40px_-10px_rgba(217,119,6,0.12)] p-6 sm:p-7 transition-all">
            
            {/* Header with Honey Seal Icon */}
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/25 shrink-0">
                🍯
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-gray-900 leading-tight">
                  Welcome Back
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sign in with MetaMask or email credentials
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-3 p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Web3 1-Click Login */}
            <button
              type="button"
              onClick={handleWeb3Login}
              disabled={web3Loading || loading}
              className="w-full bg-gradient-to-r from-[#F6851B] to-[#E2761B] hover:from-[#E2761B] hover:to-[#CD6116] text-white font-bold h-9.5 px-4 rounded-xl flex justify-center items-center gap-2 transition-all mb-2.5 text-xs cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              <span className="text-sm">🦊</span>
              <span>{web3Loading ? "Connecting to MetaMask..." : "1-Click Login with MetaMask"}</span>
            </button>

            <div className="relative flex py-0.5 items-center mb-2.5">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-3 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
                Or continue with Email
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div>
                <label htmlFor="login-email" className="block text-[11px] font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl transition-all outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-[11px] font-bold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-9 pl-9 pr-9 text-xs bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl transition-all outline-none"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-9.5 mt-1 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-xs shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-2 text-center text-xs text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-amber-700 hover:text-amber-800 transition-colors underline-offset-2 hover:underline"
              >
                Create Account
              </Link>
            </div>

            {/* Quick Demo Accounts — VIP Interactive Selector */}
            <div className="mt-3 pt-3 border-t border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-amber-950 flex items-center gap-1">
                  <span>⚡</span>
                  <span>Demo Roles</span>
                </span>
                {selectedRole ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    Loaded: {selectedRole} ✓
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-800/70">Click to autofill</span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5 mb-1.5">
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
                      setSelectedRole(account.label);
                    }}
                    title={`Autofill ${account.label}`}
                    className={`p-1.5 rounded-xl border text-center cursor-pointer transition-all ${
                      selectedRole === account.label
                        ? "border-amber-500 bg-amber-100/90 shadow-2xs scale-[1.02] ring-1 ring-amber-500/50"
                        : "border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-400"
                    }`}
                  >
                    <span className="text-xs block leading-none">{account.icon}</span>
                    <span className="font-bold text-[10px] text-gray-800 block truncate mt-0.5">
                      {account.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
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
                      setSelectedRole(account.label);
                    }}
                    title={`Autofill ${account.label}`}
                    className={`py-1.5 px-2 rounded-xl border text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      selectedRole === account.label
                        ? "border-amber-500 bg-amber-100/90 shadow-2xs scale-[1.02] ring-1 ring-amber-500/50"
                        : "border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-400"
                    }`}
                  >
                    <span className="text-xs">{account.icon}</span>
                    <span className="font-bold text-[10px] text-gray-800 truncate">
                      {account.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Bottom: Protocol & Compliance Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-gray-400 max-w-[440px] mx-auto w-full pt-2 shrink-0">
          <span>HoneyChain Provenance Protocol</span>
          <span className="font-semibold text-gray-500 flex items-center gap-1">
            <span>🛡️</span>
            <span>Agmark & FSSAI Compliant</span>
          </span>
        </div>
      </div>
    </div>
  );
}
