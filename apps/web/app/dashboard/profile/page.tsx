"use client";

import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  User,
  Mail,
  Phone,
  Wallet,
  Shield,
  Edit3,
  Save,
  X,
  Link2,
  Lock,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const wallet = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
        window.location.reload();
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
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
          My Profile
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Manage your account settings and blockchain identity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <Card className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--honey-400)] to-[var(--honey-600)] mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-md mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
              {user.name}
            </h2>
            <StatusBadge state="pending" label={user.role} className="mt-2" />
          </Card>
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-default)]">
              <User size={16} className="text-[var(--honey-600)]" />
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Account Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border-default)] text-sm text-[var(--text-primary)]">
                  <Mail size={14} className="text-[var(--text-muted)]" />
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 98765 43210"
                    leftIcon={Phone}
                  />
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border-default)] text-sm text-[var(--text-primary)]">
                    <Phone size={14} className="text-[var(--text-muted)]" />
                    {user.phone || <span className="text-[var(--text-muted)] italic">Not provided</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              {isEditing ? (
                <>
                  <Button variant="ghost" size="sm" leftIcon={X} onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" leftIcon={Save} onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" leftIcon={Edit3} onClick={handleEditClick}>
                  Edit Details
                </Button>
              )}
            </div>
          </Card>

          {/* Web3 Identity */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-default)]">
              <Wallet size={16} className="text-[var(--honey-600)]" />
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Web3 Identity</h3>
            </div>

            <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-muted)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Linked Wallet</span>
                {user.walletAddress ? (
                  <StatusBadge state="pass" label="On-Chain" />
                ) : (
                  <StatusBadge state="pending" label="Not Linked" />
                )}
              </div>
              <div className="font-mono text-xs text-[var(--text-secondary)] break-all">
                {user.walletAddress || "No Web3 wallet bound to this account."}
              </div>
            </div>

            {!user.walletAddress ? (
              <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)]">
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                  <Lock size={14} />
                  High-Trust Actions Locked
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mb-3">
                  You must bind a MetaMask wallet to your account to sign off on shipments or verify quality results.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={Link2}
                  onClick={async () => {
                    await wallet.connect();
                    if (wallet.address) {
                      const res = await fetch("/api/auth/link-wallet", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ walletAddress: wallet.address }),
                      });
                      if (res.ok) window.location.reload();
                      else alert("Failed to link wallet: " + (await res.json()).error);
                    }
                  }}
                  className="w-full"
                >
                  Bind MetaMask Wallet
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await wallet.connect();
                    if (wallet.address) {
                      const res = await fetch("/api/auth/link-wallet", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ walletAddress: wallet.address }),
                      });
                      if (res.ok) {
                        alert("Wallet synced successfully!");
                        window.location.reload();
                      } else {
                        alert("Failed to sync wallet: " + (await res.json()).error);
                      }
                    }
                  }}
                  className="w-full"
                >
                  Sync Active MetaMask Wallet
                </Button>
                <p className="text-xs text-[var(--text-muted)] text-center">
                  Wallet bound for signing supply chain events on the HoneyChain smart contract.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
