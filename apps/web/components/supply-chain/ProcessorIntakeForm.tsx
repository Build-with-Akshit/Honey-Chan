"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Warehouse } from "lucide-react";

export function ProcessorIntakeForm() {
  const [batchId, setBatchId] = useState("");
  const [temperature, setTemperature] = useState("");
  const [filtrationLevel, setFiltrationLevel] = useState("Standard (100 micron)");
  const [notes, setNotes] = useState("");
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
        setBatchId(""); setTemperature(""); setNotes("");
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
            Batch Intake & Processing
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Log filtration and temperature controls for incoming raw honey.
          </p>
        </div>
        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--orange-50)] flex items-center justify-center text-[var(--orange-600)]">
          <Warehouse size={18} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Incoming Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          placeholder="e.g. HC-2026-000127"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Input
            label="Heating Temp (°C)"
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="Target < 45°C"
            required
            hint="Heating above 45°C destroys enzymes"
          />
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Filtration Level
            </label>
            <select
              className="input"
              value={filtrationLevel}
              onChange={(e) => setFiltrationLevel(e.target.value)}
            >
              <option value="Coarse (400 micron)">Coarse (400 micron)</option>
              <option value="Standard (100 micron)">Standard (100 micron)</option>
              <option value="Fine (50 micron)">Fine (50 micron)</option>
              <option value="Ultrafiltration">Ultrafiltration</option>
            </select>
          </div>
        </div>

        <Input
          label="Processing Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any deviations or observations..."
        />

        <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!batchId || !temperature || loading || submitted}
          >
            {loading ? "Logging..." : submitted ? "Batch Processed ✓" : "Log Processing Step"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
