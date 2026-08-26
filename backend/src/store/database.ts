import crypto from "crypto";

export interface User {
  id: string;
  walletAddress: string;
  name: string;
  role: "ADMIN" | "BEEKEEPER" | "PROCESSOR" | "LAB" | "DISTRIBUTOR" | "RETAILER";
  phone: string;
  email: string;
  clusterId?: string;
  createdAt: string;
}

export interface Cluster {
  id: string;
  name: string;
  district: string;
  state: string;
  totalBeekeepers: number;
  totalHives: number;
  avgHealth: number;
  totalProductionTons: number;
  createdAt: string;
}

export interface HiveReading {
  id: string;
  hiveId: string;
  temperature: number; // °C
  humidity: number; // %
  weight: number; // kg
  beeActivity: number; // 0 - 1.0
  battery: number; // %
  timestamp: string;
}

export interface Hive {
  id: string;
  hiveCode: string;
  beekeeperId: string;
  beekeeperName: string;
  clusterId: string;
  clusterName: string;
  location: string;
  flowerSource: string;
  colonyType: string;
  status: "ACTIVE" | "WARNING" | "MAINTENANCE";
  installationDate: string;
  healthScore: number;
  latestReading: HiveReading;
  readingsHistory: HiveReading[];
}

export interface SupplyChainEvent {
  id: string;
  stage: "HARVEST" | "COLLECTION" | "PROCESSING" | "LAB_TESTING" | "DISTRIBUTION" | "RETAIL";
  stageLabel: string;
  actor: string;
  location: string;
  timestamp: string;
  txHash: string;
  notes?: string;
  verified: boolean;
}

export interface QualityTest {
  id: string;
  batchId: string;
  labName: string;
  labAddress: string;
  moisture: number; // e.g. 17.8% (FSSAI max 20%)
  sucrose: number; // %
  fructose: number; // %
  glucose: number; // %
  hfmContent: number; // mg/kg
  result: "PASS" | "FAIL";
  reportHash: string;
  testedAt: string;
  certificateNumber: string;
}

export interface HoneyBatch {
  id: string;
  batchId: string;
  hiveId: string;
  hiveCode: string;
  beekeeperId: string;
  beekeeperName: string;
  originLocation: string;
  honeyType: string;
  quantityKg: number;
  harvestDate: string;
  metadataHash: string;
  blockchainTx: string;
  currentOwner: string;
  status: "CREATED" | "HARVESTED" | "PROCESSING" | "QUALITY_TESTED" | "DISTRIBUTED" | "RETAIL" | "COMPLETED";
  statusLabel: string;
  hiveHealthAtHarvest: number;
  qualityTest?: QualityTest;
  events: SupplyChainEvent[];
  trustScore: number;
  createdAt: string;
  isTampered?: boolean;
}

export interface AIPrediction {
  hiveId: string;
  healthScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  productivityKg: number;
  confidence: number;
  windowDays: number;
  explanation: string;
  recommendation: string;
  factors: { name: string; status: "optimal" | "warning" | "alert"; value: string }[];
  anomalyDetection: {
    varroaMiteRisk: "LOW" | "MODERATE" | "HIGH";
    broodCoolingRisk: "NONE" | "MILD" | "HIGH";
    swarmingProbability: number;
  };
}

// Canonical Hash Generator
export function calculateMetadataHash(data: Record<string, any>): string {
  const canonicalString = JSON.stringify(data, Object.keys(data).sort());
  return "0x" + crypto.createHash("sha256").update(canonicalString).digest("hex");
}

// In-memory Database Store
class Database {
  users: User[] = [];
  clusters: Cluster[] = [];
  hives: Hive[] = [];
  batches: HoneyBatch[] = [];
  qualityTests: QualityTest[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    // 1. Users
    this.users = [
      {
        id: "user-1",
        walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        name: "Admin Officer (KVIC)",
        role: "ADMIN",
        phone: "+91 98123 45670",
        email: "admin@honeychain.gov.in",
        createdAt: "2026-01-10T10:00:00Z",
      },
      {
        id: "user-2",
        walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        name: "Ramesh Kumar",
        role: "BEEKEEPER",
        phone: "+91 98765 43210",
        email: "ramesh.sonipat@gmail.com",
        clusterId: "cluster-1",
        createdAt: "2026-02-15T09:30:00Z",
      },
      {
        id: "user-3",
        walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        name: "ABC Honey Processing Unit",
        role: "PROCESSOR",
        phone: "+91 98222 33445",
        email: "contact@abchoney.in",
        createdAt: "2026-02-20T11:00:00Z",
      },
      {
        id: "user-4",
        walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        name: "National Quality Testing Lab",
        role: "LAB",
        phone: "+91 98333 44556",
        email: "lab.verify@fssai-approved.gov.in",
        createdAt: "2026-02-25T14:00:00Z",
      },
      {
        id: "user-5",
        walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        name: "Honey Express Distribution Ltd",
        role: "DISTRIBUTOR",
        phone: "+91 98444 55667",
        email: "logistics@honeyexpress.in",
        createdAt: "2026-03-01T10:00:00Z",
      },
      {
        id: "user-6",
        walletAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df",
        name: "Fresh Mart Organics Retail",
        role: "RETAILER",
        phone: "+91 98555 66778",
        email: "store@freshmart.in",
        createdAt: "2026-03-05T12:00:00Z",
      },
    ];

    // 2. KVIC Clusters
    this.clusters = [
      {
        id: "cluster-1",
        name: "Sonipat Honey Cluster",
        district: "Sonipat",
        state: "Haryana",
        totalBeekeepers: 84,
        totalHives: 1200,
        avgHealth: 89,
        totalProductionTons: 4.8,
        createdAt: "2026-01-01T00:00:00Z",
      },
      {
        id: "cluster-2",
        name: "Moradabad Honey Cluster",
        district: "Moradabad",
        state: "Uttar Pradesh",
        totalBeekeepers: 62,
        totalHives: 890,
        avgHealth: 82,
        totalProductionTons: 3.6,
        createdAt: "2026-01-15T00:00:00Z",
      },
      {
        id: "cluster-3",
        name: "Alwar Mustard Cluster",
        district: "Alwar",
        state: "Rajasthan",
        totalBeekeepers: 95,
        totalHives: 1450,
        avgHealth: 91,
        totalProductionTons: 5.2,
        createdAt: "2026-02-01T00:00:00Z",
      },
    ];

    // Helper for readings history
    const createHistory = (baseTemp: number, baseHum: number, baseWeight: number): HiveReading[] => {
      const list: HiveReading[] = [];
      const now = Date.now();
      for (let i = 12; i >= 0; i--) {
        const time = new Date(now - i * 3600 * 1000).toISOString();
        const jitterTemp = Number((baseTemp + (Math.sin(i) * 0.8)).toFixed(1));
        const jitterHum = Number((baseHum + (Math.cos(i) * 2.5)).toFixed(1));
        const jitterWeight = Number((baseWeight + (12 - i) * 0.15).toFixed(1));
        list.push({
          id: `read-${Math.random().toString(36).substring(7)}`,
          hiveId: "",
          temperature: jitterTemp,
          humidity: jitterHum,
          weight: jitterWeight,
          beeActivity: Number((0.82 + Math.sin(i) * 0.08).toFixed(2)),
          battery: Number((95 - i * 0.2).toFixed(0)),
          timestamp: time,
        });
      }
      return list;
    };

    // 3. Hives
    this.hives = [
      {
        id: "hive-1",
        hiveCode: "HIVE-007",
        beekeeperId: "user-2",
        beekeeperName: "Ramesh Kumar",
        clusterId: "cluster-1",
        clusterName: "Sonipat Honey Cluster",
        location: "Ganaur Field 4, Sonipat, Haryana",
        flowerSource: "Mustard Flower (Sarson)",
        colonyType: "Apis mellifera",
        status: "ACTIVE",
        installationDate: "2026-02-01",
        healthScore: 91,
        latestReading: {
          id: "r-1",
          hiveId: "hive-1",
          temperature: 34.2,
          humidity: 65.4,
          weight: 38.4,
          beeActivity: 0.88,
          battery: 92,
          timestamp: new Date().toISOString(),
        },
        readingsHistory: createHistory(34.2, 65, 38.0),
      },
      {
        id: "hive-2",
        hiveCode: "HIVE-001",
        beekeeperId: "user-2",
        beekeeperName: "Ramesh Kumar",
        clusterId: "cluster-1",
        clusterName: "Sonipat Honey Cluster",
        location: "Rai Apiary Plot B, Sonipat",
        flowerSource: "Mustard Flower",
        colonyType: "Apis mellifera",
        status: "ACTIVE",
        installationDate: "2026-01-20",
        healthScore: 94,
        latestReading: {
          id: "r-2",
          hiveId: "hive-2",
          temperature: 33.9,
          humidity: 63.2,
          weight: 42.1,
          beeActivity: 0.92,
          battery: 88,
          timestamp: new Date().toISOString(),
        },
        readingsHistory: createHistory(33.9, 63, 41.5),
      },
      {
        id: "hive-3",
        hiveCode: "HIVE-012",
        beekeeperId: "user-2",
        beekeeperName: "Ramesh Kumar",
        clusterId: "cluster-1",
        clusterName: "Sonipat Honey Cluster",
        location: "Murthal Orchard, Sonipat",
        flowerSource: "Litchi Blossom",
        colonyType: "Apis mellifera",
        status: "WARNING",
        installationDate: "2026-03-01",
        healthScore: 72,
        latestReading: {
          id: "r-3",
          hiveId: "hive-3",
          temperature: 36.4,
          humidity: 76.5,
          weight: 31.2,
          beeActivity: 0.61,
          battery: 79,
          timestamp: new Date().toISOString(),
        },
        readingsHistory: createHistory(36.4, 76, 31.0),
      },
      {
        id: "hive-4",
        hiveCode: "HIVE-018",
        beekeeperId: "user-2",
        beekeeperName: "Ramesh Kumar",
        clusterId: "cluster-1",
        clusterName: "Sonipat Honey Cluster",
        location: "Kundli Apiary Unit 3",
        flowerSource: "Sunflower & Multi-flora",
        colonyType: "Apis mellifera",
        status: "ACTIVE",
        installationDate: "2026-02-10",
        healthScore: 96,
        latestReading: {
          id: "r-4",
          hiveId: "hive-4",
          temperature: 33.8,
          humidity: 61.8,
          weight: 45.8,
          beeActivity: 0.95,
          battery: 94,
          timestamp: new Date().toISOString(),
        },
        readingsHistory: createHistory(33.8, 61, 45.0),
      },
    ];

    // 4. Quality Test
    const test1: QualityTest = {
      id: "qt-1",
      batchId: "HC-2026-000127",
      labName: "National Quality Testing Lab",
      labAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      moisture: 17.8, // within FSSAI limit < 20%
      sucrose: 3.2, // within FSSAI limit < 5%
      fructose: 38.5,
      glucose: 31.2,
      hfmContent: 18.4, // mg/kg (< 40 mg/kg)
      result: "PASS",
      reportHash: "0x5d8b74c2e6f9a0c1e3d6b9a0f8e2c5d7a1b4f8c2e6d9a3b8a9f4c2b1e7d3a6f9",
      testedAt: "2026-08-25T14:30:00Z",
      certificateNumber: "NABL/FSSAI-2026/HC-8912",
    };
    this.qualityTests.push(test1);

    // 5. Honey Batches
    const canonicalMeta1 = {
      batchId: "HC-2026-000127",
      producer: "Ramesh Kumar",
      origin: "Sonipat, Haryana",
      flowerSource: "Mustard Flower Honey",
      quantityGrams: 18500,
      harvestDate: "2026-08-22",
      hiveCode: "HIVE-007",
    };
    const metaHash1 = calculateMetadataHash(canonicalMeta1);

    this.batches = [
      {
        id: "batch-1",
        batchId: "HC-2026-000127",
        hiveId: "hive-1",
        hiveCode: "HIVE-007",
        beekeeperId: "user-2",
        beekeeperName: "Ramesh Kumar",
        originLocation: "Sonipat, Haryana",
        honeyType: "Mustard Flower Honey",
        quantityKg: 18.5,
        harvestDate: "2026-08-22",
        metadataHash: metaHash1,
        blockchainTx: "0x8a9f4c2b1e7d3a6f9c0e5d8b2a4f7c1e3d6b9a0f8e2c5d7a1b4f8c2e6d9a3b41",
        currentOwner: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df", // Fresh Mart Retailer
        status: "RETAIL",
        statusLabel: "At Retail Store (Verified)",
        hiveHealthAtHarvest: 91,
        qualityTest: test1,
        trustScore: 94,
        createdAt: "2026-08-22T08:00:00Z",
        events: [
          {
            id: "ev-1",
            stage: "HARVEST",
            stageLabel: "Harvest Recorded",
            actor: "Ramesh Kumar (Beekeeper)",
            location: "Sonipat Apiary, Haryana",
            timestamp: "2026-08-22T08:30:00Z",
            txHash: "0x8a9f4c2b1e7d3a6f9c0e5d8b2a4f7c1e3d6b9a0f8e2c5d7a1b4f8c2e6d9a3b41",
            notes: "Harvested from healthy HIVE-007 colony. Moisture 17.8%, Raw unfiltered.",
            verified: true,
          },
          {
            id: "ev-2",
            stage: "COLLECTION",
            stageLabel: "Cluster Collection Center",
            actor: "KVIC Sonipat Collection Point",
            location: "Ganaur Mandi, Sonipat",
            timestamp: "2026-08-23T11:15:00Z",
            txHash: "0x3f1e9b2a7d4c8e5f0a6b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
            notes: "Batch weighed and sealed in food-grade steel containers.",
            verified: true,
          },
          {
            id: "ev-3",
            stage: "PROCESSING",
            stageLabel: "Cold Filtration & Bottling",
            actor: "ABC Honey Processing Unit",
            location: "Industrial Area, Kundli",
            timestamp: "2026-08-24T15:45:00Z",
            txHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
            notes: "Micro-filtered without overheating (preserving natural enzymes & pollen).",
            verified: true,
          },
          {
            id: "ev-4",
            stage: "LAB_TESTING",
            stageLabel: "Quality & Purity Certification",
            actor: "National Quality Testing Lab",
            location: "FSSAI Accredited Center, New Delhi",
            timestamp: "2026-08-25T14:30:00Z",
            txHash: "0x5d8b74c2e6f9a0c1e3d6b9a0f8e2c5d7a1b4f8c2e6d9a3b8a9f4c2b1e7d3a6f9",
            notes: "Passed all 14 FSSAI parameters. Zero C4/C3 sugars detected. Grade A.",
            verified: true,
          },
          {
            id: "ev-5",
            stage: "DISTRIBUTION",
            stageLabel: "Logistics Dispatch",
            actor: "Honey Express Distribution Ltd",
            location: "North India Hub",
            timestamp: "2026-08-26T09:00:00Z",
            txHash: "0x2c4e6a8b0d1f3e5a7b9c1d3f5a7b9c1d3f5a7b9c1d3f5a7b9c1d3f5a7b9c1d3f",
            notes: "Temperature-controlled transit to retail stores.",
            verified: true,
          },
          {
            id: "ev-6",
            stage: "RETAIL",
            stageLabel: "Retail Shelf Placement",
            actor: "Fresh Mart Organics",
            location: "Sector 14 Store, Delhi NCR",
            timestamp: "2026-08-26T10:30:00Z",
            txHash: "0x9e1f3a5b7c9d1e3f5a7b9c1d3f5a7b9c1d3f5a7b9c1d3f5a7b9c1d3f5a7b9c1d",
            notes: "Packaged jars labelled with authentic Honey Chain QR codes.",
            verified: true,
          },
        ],
      },
      {
        id: "batch-2",
        batchId: "HC-2026-000125",
        hiveId: "hive-2",
        hiveCode: "HIVE-001",
        beekeeperId: "user-2",
        beekeeperName: "Ramesh Kumar",
        originLocation: "Sonipat, Haryana",
        honeyType: "Eucalyptus Honey",
        quantityKg: 22.0,
        harvestDate: "2026-08-18",
        metadataHash: "0x4b7c1e3d6b9a0f8e2c5d7a1b4f8c2e6d9a3b8a9f4c2b1e7d3a6f9c0e5d8b2a4f",
        blockchainTx: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        currentOwner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        status: "PROCESSING",
        statusLabel: "In Processing Unit",
        hiveHealthAtHarvest: 94,
        trustScore: 82,
        createdAt: "2026-08-18T09:00:00Z",
        events: [
          {
            id: "ev-201",
            stage: "HARVEST",
            stageLabel: "Harvest Recorded",
            actor: "Ramesh Kumar",
            location: "Sonipat Apiary",
            timestamp: "2026-08-18T09:30:00Z",
            txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
            verified: true,
          },
          {
            id: "ev-202",
            stage: "PROCESSING",
            stageLabel: "Received at Processor",
            actor: "ABC Honey Processing",
            location: "Kundli Unit",
            timestamp: "2026-08-19T14:00:00Z",
            txHash: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
            verified: true,
          },
        ],
      },
    ];
  }
}

export const db = new Database();
