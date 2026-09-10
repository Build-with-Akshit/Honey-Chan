import { vi } from "vitest";

export const mockUser = {
  id: 1,
  email: "test@honeychain.gov.in",
  name: "Test User",
  role: "BEEKEEPER" as const,
  phone: "+91 98765 43210",
  walletAddress: null,
  isVerified: true,
};

export const mockHive = {
  id: 1,
  hiveCode: "HIVE-007",
  location: "Sonipat, Haryana",
  flowerSource: "Mustard",
  beeColonyType: "Apis mellifera",
  status: "ACTIVE",
  healthScore: 91,
  beekeeperId: 1,
  clusterId: 1,
  createdAt: new Date("2026-01-01"),
  latestReading: {
    temperature: 34.2,
    humidity: 65,
    weight: 38.4,
    beeActivity: 0.88,
    battery: 92,
    timestamp: new Date(),
  },
  readingsHistory: [
    { temperature: 34.0, humidity: 64, weight: 38.0, timestamp: new Date() },
    { temperature: 34.1, humidity: 65, weight: 38.2, timestamp: new Date() },
    { temperature: 34.2, humidity: 65, weight: 38.4, timestamp: new Date() },
  ],
};

export const mockBatch = {
  id: 1,
  batchId: "HC-2026-000127",
  honeyType: "Mustard Flower Honey",
  quantity: 18.5,
  harvestDate: new Date("2026-08-22"),
  location: "Sonipat, Haryana",
  status: "VERIFIED",
  trustScore: 96,
  metadataHash: "0x" + "a".repeat(64),
  blockchainTx: "0x" + "b".repeat(64),
  hiveCode: "HIVE-007",
  beekeeperName: "Ramesh Kumar",
  createdAt: new Date(),
};

export const mockCluster = {
  id: 1,
  name: "Sonipat Honey Cluster",
  district: "Sonipat",
  state: "Haryana",
  totalBeekeepers: 84,
  totalHives: 1200,
  avgHealth: 87,
  totalProductionTons: 4.8,
};

export const mockVerification = {
  batchId: "HC-2026-000127",
  producer: "Ramesh Kumar",
  origin: "Sonipat, Haryana",
  honeyType: "Mustard Flower Honey",
  quantity: "18.5 KG",
  harvestDate: "2026-08-22",
  hashMatch: true,
  isTampered: false,
  trustScore: 96,
  blockchainVerified: true,
  onChainHash: "0x" + "a".repeat(64),
  currentDataHash: "0x" + "a".repeat(64),
  labVerified: true,
  labMoisture: "18.2%",
  journey: [
    { stage: "HARVEST", icon: "🐝", actor: "Ramesh Kumar", location: "Sonipat", date: "22 Aug 2026", txHash: "0x" + "1".repeat(16), notes: "Batch created", verified: true },
    { stage: "LAB_TESTING", icon: "🧪", actor: "FSSAI Lab", location: "New Delhi", date: "24 Aug 2026", txHash: "0x" + "2".repeat(16), notes: "Passed all tests", verified: true },
  ],
  trustFactors: [
    { label: "Traceability", score: 20, max: 20, passed: true },
    { label: "Lab Certification", score: 20, max: 20, passed: true },
    { label: "Blockchain Integrity", score: 20, max: 20, passed: true },
  ],
};

export function mockFetchResponse(data: any, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    json: () => Promise.resolve(data),
    headers: new Headers(),
  } as Response);
}

export function mockFetchError(message: string, status = 500) {
  return vi.fn().mockRejectedValue(new Error(message));
}
