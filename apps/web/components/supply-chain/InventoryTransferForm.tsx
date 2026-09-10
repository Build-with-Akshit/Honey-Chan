"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Truck } from "lucide-react";

export function InventoryTransferForm() {
  const [batchId, setBatchId] = useState("");
  const [destination, setDestination] = useState("");
  const [transferType, setTransferType] = useState("B2B");
  const [posConfirmed, setPosConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setBatchId(""); setDestination(""); setPosConfirmed(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
            Inventory Dispatch & Transfer
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Transfer custody to the next supply chain node.
          </p>
        </div>
        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-info-bg)] flex items-center justify-center text-[var(--color-info)]">
          <Truck size={18} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Input
            label="Batch ID to Transfer"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="e.g. HC-2026-000127"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Transfer Type
            </label>
            <select
              className="input"
              value={transferType}
              onChange={(e) => setTransferType(e.target.value)}
            >
              <option value="B2B">Business-to-Business (Wholesale)</option>
              <option value="WAREHOUSE">Internal Warehouse Transfer</option>
              <option value="RETAIL">To Retail Shelf</option>
              <option value="POS">Final Point of Sale (Consumer)</option>
            </select>
          </div>
        </div>

        {transferType !== "POS" ? (
          <Input
            label="Destination Identity"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Ethereum Address or Retailer ID"
            required={transferType !== "POS"}
            hint="Custody transfers on-chain to this entity"
          />
        ) : (
          <div className="p-4 bg-[var(--honey-50)] border border-[var(--honey-200)] rounded-[var(--radius-lg)]">
            <h3 className="text-sm font-bold text-[var(--honey-700)] mb-2">Final Consumer Sale</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Marking as POS Finalized ends the supply chain journey permanently.
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--border-default)] accent-[var(--honey-600)]"
                checked={posConfirmed}
                onChange={(e) => setPosConfirmed(e.target.checked)}
              />
              <span className="text-sm text-[var(--text-primary)] font-medium">
                I confirm this batch has been sold to a consumer.
              </span>
            </label>
          </div>
        )}

        <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={
              !batchId ||
              (transferType !== "POS" && !destination) ||
              (transferType === "POS" && !posConfirmed) ||
              loading ||
              submitted
            }
          >
            {loading ? "Signing Tx..." : submitted ? "Transfer Complete ✓" : "Execute Transfer"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
