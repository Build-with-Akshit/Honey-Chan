"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const { register, user, isLoading } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("BEEKEEPER");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'BEEKEEPER') router.push('/dashboard/beekeeper');
      else if (user.role === 'ADMIN') router.push('/dashboard/admin');
      else router.push('/dashboard/supply-chain');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await register({ name, email, password, role, phone });
    } catch (err: any) {
      setError(err.message || "Failed to register");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50/50 p-4 py-12">
      <div className="card w-full max-w-md p-8 bg-white shadow-xl border border-amber-100">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🍯</div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join the HoneyChain ecosystem</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name / Organization</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                minLength={6}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <optgroup label="Production">
                <option value="BEEKEEPER">🐝 Beekeeper</option>
              </optgroup>
              <optgroup label="Supply Chain">
                <option value="PROCESSOR">🏭 Factory / Processor</option>
                <option value="LAB">🧪 Quality Lab</option>
                <option value="DISTRIBUTOR">🚚 Distributor Logistics</option>
                <option value="WHOLESALER">📦 Wholesaler</option>
                <option value="RETAILER">🏪 Retail Storefront</option>
              </optgroup>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-2.5 mt-4 flex justify-center items-center"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
          Already have an account? <Link href="/login" className="text-amber-600 font-bold hover:underline">Log In</Link>
        </div>
      </div>
    </div>
  );
}
