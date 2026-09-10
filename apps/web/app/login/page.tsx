"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Hexagon, Sparkles } from "lucide-react";

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
    <div className="min-h-screen flex">
      {/* Left — Branded Hero (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[var(--honey-600)] via-[var(--honey-700)] to-[var(--orange-700)] text-white p-12 flex-col justify-between">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/3 right-[-40px] w-48 h-48 border border-white/10 rounded-full" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-sm">HC</span>
            </div>
            <span className="font-bold text-lg font-[family-name:var(--font-outfit)]">
              HoneyChain
            </span>
          </Link>

          <h1 className="font-[family-name:var(--font-outfit)] text-4xl font-bold leading-tight max-w-md">
            Welcome back to the future of honey traceability.
          </h1>
          <p className="text-white/70 mt-4 text-sm leading-relaxed max-w-md">
            Log in to manage your hives, track batches on blockchain, and
            monitor IoT sensor data in real-time.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: <Shield size={18} />, text: "Blockchain-secured records" },
            { icon: <Hexagon size={18} />, text: "Real-time IoT monitoring" },
            { icon: <Sparkles size={18} />, text: "AI-powered hive intelligence" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-sm text-white/80">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                {item.icon}
              </div>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[var(--bg-base)]">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--honey-500)] to-[var(--orange-600)] flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">HC</span>
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
              HoneyChain
            </span>
          </div>

          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
              Sign In
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5">
              Enter your credentials or authenticate via MetaMask
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm rounded-[var(--radius-md)] border border-[var(--color-danger-border)] font-medium">
              {error}
            </div>
          )}

          {/* Web3 1-Click Login */}
          <button
            type="button"
            onClick={handleWeb3Login}
            disabled={web3Loading || loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-[var(--radius-md)] flex justify-center items-center gap-2 transition-all mb-4 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {web3Loading ? "Connecting to MetaMask..." : "🦊 Login with MetaMask"}
          </button>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-[var(--border-default)]"></div>
            <span className="flex-shrink-0 mx-4 text-[var(--text-muted)] text-xs uppercase tracking-wider font-semibold">
              Or continue with Email
            </span>
            <div className="flex-grow border-t border-[var(--border-default)]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input !pl-10 pr-4"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input !pl-10 !pr-10"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 text-sm cursor-pointer"
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
                <span className="flex items-center gap-2 justify-center">
                  Sign In
                  <ArrowRight size={14} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--honey-600)] hover:text-[var(--honey-700)] transition-colors"
            >
              Create Account
            </Link>
          </div>

          {/* Test Accounts */}
          <div className="mt-8 p-4 bg-[var(--bg-muted)] rounded-[var(--radius-lg)] border border-[var(--border-default)]">
            <p className="text-xs font-semibold text-[var(--text-secondary)] mb-3">
              Quick Access — Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Beekeeper", email: "ramesh.sonipat@gmail.com", icon: "🐝" },
                { label: "Processor", email: "contact@abchoney.in", icon: "🏭" },
                { label: "Lab", email: "lab.verify@fssai-approved.gov.in", icon: "🧪" },
                { label: "Retailer", email: "store@freshmart.in", icon: "🏪" },
              ].map((account) => (
                <button
                  key={account.email}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword("password123");
                  }}
                  className="text-left p-2.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-white hover:border-[var(--honey-300)] hover:bg-[var(--honey-50)] transition-all text-xs cursor-pointer group"
                >
                  <span className="text-sm mr-1.5">{account.icon}</span>
                  <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--honey-700)] transition-colors">
                    {account.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setEmail("admin@honeychain.gov.in");
                setPassword("password123");
              }}
              className="w-full mt-2 text-left p-2.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-white hover:border-[var(--honey-300)] hover:bg-[var(--honey-50)] transition-all text-xs cursor-pointer group"
            >
              <span className="text-sm mr-1.5">🏛️</span>
              <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--honey-700)] transition-colors">
                Admin Console
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
