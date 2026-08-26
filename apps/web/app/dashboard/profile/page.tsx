"use client";

import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";

import { useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const wallet = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when user loads or edit starts
  const handleEditClick = () => {
    setPhoneInput(user?.phone || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneInput }),
      });
      if (res.ok) {
        setIsEditing(false);
        window.location.reload(); // Refresh to get new user data
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      alert("Error saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b border-amber-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings and blockchain identity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6 bg-white border border-amber-100 shadow-sm text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mx-auto flex items-center justify-center text-white font-bold text-4xl shadow-md mb-4">
              {user.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              {user.role}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Account Details */}
          <div className="card p-6 bg-white border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>👤</span> Account Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                <div className="text-gray-900 font-medium px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={phoneInput} 
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full text-gray-900 font-medium px-4 py-2 bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="+91 98765 43210"
                  />
                ) : (
                  <div className="text-gray-900 font-medium px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                    {user.phone || <span className="text-gray-400 italic">Not provided</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="text-sm font-semibold bg-amber-600 text-white px-4 py-1.5 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Details"}
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleEditClick}
                  className="text-sm font-semibold text-amber-600 hover:text-amber-800"
                >
                  Edit Details
                </button>
              )}
            </div>
          </div>

          {/* Web3 Identity */}
          <div className="card p-6 bg-white border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🔗</span> Web3 Identity
            </h3>
            
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Linked Wallet</span>
                {user.walletAddress ? (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                    Verified On-Chain
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                    Not Linked
                  </span>
                )}
              </div>
              <div className="font-mono text-sm text-gray-600 break-all">
                {user.walletAddress || "No Web3 wallet is bound to this account."}
              </div>
            </div>

            {!user.walletAddress && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                <h4 className="text-sm font-bold text-amber-900 mb-1">High-Trust Actions Locked</h4>
                <p className="text-xs text-amber-700 mb-3">
                  You must bind a MetaMask wallet to your account to sign off on shipments or verify quality results.
                </p>
                <button 
                  onClick={wallet.connect}
                  className="w-full py-2 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>🦊</span> Bind MetaMask Wallet
                </button>
              </div>
            )}
            
            {user.walletAddress && (
              <p className="text-xs text-gray-500 mt-2">
                This wallet is permanently bound to your Web2 identity for signing high-trust supply chain events on the HoneyChain smart contract.
              </p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
