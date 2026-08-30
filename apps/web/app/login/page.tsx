"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";

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
      if (user.role === 'BEEKEEPER') router.push('/dashboard/beekeeper');
      else if (user.role === 'ADMIN') router.push('/dashboard/admin');
      else router.push('/dashboard/supply-chain');
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

      // 3. Send to our backend
      await login({ walletAddress, signature, message });
    } catch (err: any) {
      console.error(err);
      if (err.code === "ACTION_REJECTED" || (err.message && err.message.includes("rejected"))) {
        setError("Login cancelled. You rejected the signature request in MetaMask.");
      } else if (err.message && err.message.includes("Wallet not registered")) {
        setError("Wallet not registered. Redirecting to signup...");
        setTimeout(() => {
          router.push('/register');
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
      // Router push is handled in useAuth
    } catch (err: any) {
      setError(err.message || "Failed to login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50/50 p-4">
      <div className="card w-full max-w-md p-8 bg-white shadow-xl border border-amber-100">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🍯</div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Log in to your HoneyChain portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <button 
          type="button" 
          onClick={handleWeb3Login}
          disabled={web3Loading || loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors mb-6"
        >
          {web3Loading ? "Connecting..." : "🦊 Login with MetaMask"}
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or continue with Email</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading || web3Loading}
            className="w-full btn-primary py-2.5 mt-2 flex justify-center items-center"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
          Don't have an account? <Link href="/register" className="text-amber-600 font-bold hover:underline">Sign Up</Link>
        </div>

        <div className="mt-4 p-4 bg-amber-50/50 rounded-lg text-xs text-gray-500 space-y-2">
          <p className="font-semibold text-gray-700 mb-1">Test Accounts (Demo Fallback):</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => {setEmail('ramesh.sonipat@gmail.com'); setPassword('password123');}} className="text-left hover:text-amber-700">🐝 Beekeeper</button>
            <button onClick={() => {setEmail('contact@abchoney.in'); setPassword('password123');}} className="text-left hover:text-amber-700">🏭 Processor</button>
            <button onClick={() => {setEmail('lab.verify@fssai-approved.gov.in'); setPassword('password123');}} className="text-left hover:text-amber-700">🧪 Lab</button>
            <button onClick={() => {setEmail('store@freshmart.in'); setPassword('password123');}} className="text-left hover:text-amber-700">🏪 Retailer</button>
            <button onClick={() => {setEmail('admin@honeychain.gov.in'); setPassword('password123');}} className="text-left hover:text-amber-700 col-span-2">🏛️ Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}

