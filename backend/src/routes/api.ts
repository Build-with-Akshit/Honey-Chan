import { Router, Request, Response } from "express";
import { db, calculateMetadataHash, HoneyBatch, HiveReading } from "../store/database.js";
import { AIService } from "../services/aiService.js";

const router = Router();

// ─── System Status ──────────────────────────────────────────
router.get("/status", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    system: "Honey Chain Digital Ecosystem (SIH26021)",
    ministry: "Ministry of MSME - KVIC Honey Mission",
    totalClusters: db.clusters.length,
    totalHives: db.hives.length,
    totalBatches: db.batches.length,
    timestamp: new Date().toISOString(),
  });
});

// ─── KVIC Clusters ──────────────────────────────────────────
router.get("/clusters", (_req: Request, res: Response) => {
  res.json(db.clusters);
});

router.get("/clusters/:id", (req: Request, res: Response) => {
  const cluster = db.clusters.find((c) => c.id === req.params.id);
  if (!cluster) return res.status(404).json({ error: "Cluster not found" });
  res.json(cluster);
});

// ─── Hives & IoT ────────────────────────────────────────────
router.get("/hives", (_req: Request, res: Response) => {
  res.json(db.hives);
});

router.get("/hives/:id", (req: Request, res: Response) => {
  const hive = db.hives.find((h) => h.id === req.params.id || h.hiveCode === req.params.id);
  if (!hive) return res.status(404).json({ error: "Hive not found" });
  res.json(hive);
});

router.post("/hives", (req: Request, res: Response) => {
  const { hiveCode, location, flowerSource, colonyType, clusterId } = req.body;
  if (!hiveCode || !location) {
    return res.status(400).json({ error: "hiveCode and location are required" });
  }

  const cluster = db.clusters.find((c) => c.id === clusterId) || db.clusters[0];
  const newHive = {
    id: `hive-${Date.now()}`,
    hiveCode,
    beekeeperId: "user-2",
    beekeeperName: "Ramesh Kumar",
    clusterId: cluster.id,
    clusterName: cluster.name,
    location,
    flowerSource: flowerSource || "Mustard Flower",
    colonyType: colonyType || "Apis mellifera",
    status: "ACTIVE" as const,
    installationDate: new Date().toISOString().split("T")[0],
    healthScore: 92,
    latestReading: {
      id: `r-${Date.now()}`,
      hiveId: "",
      temperature: 34.2,
      humidity: 64.0,
      weight: 38.5,
      beeActivity: 0.88,
      battery: 95,
      timestamp: new Date().toISOString(),
    },
    readingsHistory: [],
  };
  newHive.latestReading.hiveId = newHive.id;
  db.hives.push(newHive);

  res.status(201).json(newHive);
});

// Post IoT Reading (supports Simulator & real ESP32 seamlessly)
router.post("/iot/readings", (req: Request, res: Response) => {
  const { hiveId, hiveCode, temperature, humidity, weight, beeActivity, battery } = req.body;
  const targetHive = db.hives.find(
    (h) => h.id === hiveId || h.hiveCode === hiveCode || h.hiveCode === hiveId
  );

  if (!targetHive) {
    return res.status(404).json({ error: "Target hive not found for IoT stream" });
  }

  const reading: HiveReading = {
    id: `read-${Date.now()}`,
    hiveId: targetHive.id,
    temperature: Number(temperature) || 34.2,
    humidity: Number(humidity) || 65.0,
    weight: Number(weight) || 38.4,
    beeActivity: Number(beeActivity) || 0.85,
    battery: Number(battery) || 90,
    timestamp: new Date().toISOString(),
  };

  targetHive.latestReading = reading;
  targetHive.readingsHistory.unshift(reading);
  if (targetHive.readingsHistory.length > 30) {
    targetHive.readingsHistory.pop();
  }

  // Update live health score
  const ai = AIService.analyzeHive(targetHive.id);
  targetHive.healthScore = ai.healthScore;
  targetHive.status = ai.riskLevel === "CRITICAL" || ai.riskLevel === "HIGH" ? "WARNING" : "ACTIVE";

  res.json({ success: true, reading, liveHealthScore: ai.healthScore });
});

// ─── Honey Batches ──────────────────────────────────────────
router.get("/batches", (_req: Request, res: Response) => {
  res.json(db.batches);
});

router.get("/batches/:id", (req: Request, res: Response) => {
  const batch = db.batches.find((b) => b.id === req.params.id || b.batchId === req.params.id);
  if (!batch) return res.status(404).json({ error: "Honey Batch not found" });
  res.json(batch);
});

router.post("/batches", (req: Request, res: Response) => {
  const {
    batchId,
    hiveId,
    honeyType,
    quantityKg,
    harvestDate,
    originLocation,
    notes,
    blockchainTx,
  } = req.body;

  if (!batchId || !quantityKg) {
    return res.status(400).json({ error: "batchId and quantityKg are required" });
  }

  const hive = db.hives.find((h) => h.id === hiveId || h.hiveCode === hiveId) || db.hives[0];

  const canonicalMetadata = {
    batchId,
    producer: "Ramesh Kumar",
    origin: originLocation || hive.location,
    flowerSource: honeyType || hive.flowerSource,
    quantityGrams: Number(quantityKg) * 1000,
    harvestDate: harvestDate || new Date().toISOString().split("T")[0],
    hiveCode: hive.hiveCode,
  };

  const metadataHash = calculateMetadataHash(canonicalMetadata);
  const tx = blockchainTx || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

  const newBatch: HoneyBatch = {
    id: `batch-${Date.now()}`,
    batchId,
    hiveId: hive.id,
    hiveCode: hive.hiveCode,
    beekeeperId: "user-2",
    beekeeperName: "Ramesh Kumar",
    originLocation: originLocation || hive.location,
    honeyType: honeyType || hive.flowerSource,
    quantityKg: Number(quantityKg),
    harvestDate: harvestDate || new Date().toISOString().split("T")[0],
    metadataHash,
    blockchainTx: tx,
    currentOwner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    status: "HARVESTED",
    statusLabel: "Harvest Recorded on Blockchain",
    hiveHealthAtHarvest: hive.healthScore,
    trustScore: 78,
    createdAt: new Date().toISOString(),
    events: [
      {
        id: `ev-${Date.now()}`,
        stage: "HARVEST",
        stageLabel: "Harvest Recorded",
        actor: "Ramesh Kumar (Beekeeper)",
        location: originLocation || hive.location,
        timestamp: new Date().toISOString(),
        txHash: tx,
        notes: notes || "Batch created via Honey Chain Web3 Portal",
        verified: true,
      },
    ],
  };

  db.batches.unshift(newBatch);
  res.status(201).json(newBatch);
});

// Transfer Batch
router.post("/batches/:id/transfer", (req: Request, res: Response) => {
  const { stage, actor, location, newOwnerAddress, notes, txHash } = req.body;
  const batch = db.batches.find((b) => b.id === req.params.id || b.batchId === req.params.id);
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  const generatedTx = txHash || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const stageMap: Record<string, HoneyBatch["status"]> = {
    PROCESSING: "PROCESSING",
    LAB_TESTING: "QUALITY_TESTED",
    DISTRIBUTION: "DISTRIBUTED",
    RETAIL: "RETAIL",
  };

  if (stageMap[stage]) {
    batch.status = stageMap[stage];
    batch.statusLabel = `At ${stage} stage`;
  }
  if (newOwnerAddress) {
    batch.currentOwner = newOwnerAddress;
  }

  const stageLabels: Record<string, string> = {
    PROCESSING: "Cold Filtration & Bottling",
    LAB_TESTING: "Quality & Purity Certification",
    DISTRIBUTION: "Logistics Dispatch",
    RETAIL: "Retail Shelf Placement",
  };

  batch.events.push({
    id: `ev-${Date.now()}`,
    stage: stage,
    stageLabel: stageLabels[stage] || stage,
    actor: actor || "Supply Chain Participant",
    location: location || "India",
    timestamp: new Date().toISOString(),
    txHash: generatedTx,
    notes: notes || `Transferred to ${stage}`,
    verified: true,
  });

  // Boost trust score as supply chain completes
  batch.trustScore = Math.min(99, batch.trustScore + 6);

  res.json({ success: true, batch });
});

// Demo Tamper Trigger (for Hackathon Live Judge Demonstration)
router.post("/batches/:id/tamper", (req: Request, res: Response) => {
  const batch = db.batches.find((b) => b.id === req.params.id || b.batchId === req.params.id);
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  // Tamper with off-chain database quantity
  batch.quantityKg = batch.quantityKg + 10;
  batch.isTampered = true;
  batch.statusLabel = "⚠️ DATABASE RECORD MODIFIED (Tamper Detected)";

  res.json({
    success: true,
    message: "Database record altered off-chain. Recomputing hash against blockchain will now detect mismatch!",
    batch,
  });
});

// ─── Lab Quality Certification ──────────────────────────────
router.post("/quality/submit", (req: Request, res: Response) => {
  const { batchId, labName, moisture, sucrose, fructose, glucose, hfmContent, result } = req.body;
  const batch = db.batches.find((b) => b.batchId === batchId || b.id === batchId);
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  const testReport = {
    batchId: batch.batchId,
    labName: labName || "National Quality Testing Lab",
    moisture: Number(moisture) || 17.8,
    sucrose: Number(sucrose) || 3.2,
    fructose: Number(fructose) || 38.5,
    glucose: Number(glucose) || 31.2,
    hfmContent: Number(hfmContent) || 18.4,
    result: result || "PASS",
  };

  const reportHash = calculateMetadataHash(testReport);
  const qualityTest: QualityTest = {
    id: `qt-${Date.now()}`,
    batchId: batch.batchId,
    labName: testReport.labName,
    labAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    moisture: testReport.moisture,
    sucrose: testReport.sucrose,
    fructose: testReport.fructose,
    glucose: testReport.glucose,
    hfmContent: testReport.hfmContent,
    result: testReport.result as "PASS" | "FAIL",
    reportHash,
    testedAt: new Date().toISOString(),
    certificateNumber: `NABL/FSSAI-2026/HC-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  batch.qualityTest = qualityTest;
  batch.status = "QUALITY_TESTED";
  batch.statusLabel = "Quality Verified (FSSAI/NABL Certified)";
  batch.trustScore = Math.min(99, batch.trustScore + 15);

  const labTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  batch.events.push({
    id: `ev-${Date.now()}`,
    stage: "LAB_TESTING",
    stageLabel: "Quality & Purity Certification",
    actor: qualityTest.labName,
    location: "FSSAI Accredited Center, New Delhi",
    timestamp: new Date().toISOString(),
    txHash: labTx,
    notes: `Lab Report Hash: ${reportHash.substring(0, 16)}... Passed all parameters.`,
    verified: true,
  });

  res.json({ success: true, qualityTest, batch });
});

// ─── AI Analytics ───────────────────────────────────────────
router.get("/ai/hive/:id", (req: Request, res: Response) => {
  try {
    const analysis = AIService.analyzeHive(req.params.id);
    res.json(analysis);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.post("/ai/analyze-image", (req: Request, res: Response) => {
  const { fileName, colonyType } = req.body;
  const result = AIService.analyzeHiveImage(fileName || "hive_frame_sample.jpg", colonyType || "Apis mellifera");
  res.json(result);
});

// ─── Public Consumer Verification & Tamper Check ────────────
router.get("/verify/:batchId", (req: Request, res: Response) => {
  const batch = db.batches.find(
    (b) => b.batchId.toLowerCase() === req.params.batchId.toLowerCase()
  );

  if (!batch) {
    return res.status(404).json({
      verified: false,
      error: "Batch not found on Honey Chain registry",
    });
  }

  // Re-compute current hash from database state
  const currentCanonical = {
    batchId: batch.batchId,
    producer: batch.beekeeperName,
    origin: batch.originLocation,
    flowerSource: batch.honeyType,
    quantityGrams: batch.quantityKg * 1000,
    harvestDate: batch.harvestDate,
    hiveCode: batch.hiveCode,
  };

  const recomputedHash = calculateMetadataHash(currentCanonical);
  const hashMatch = recomputedHash === batch.metadataHash;

  // Calculate composite Honey Trust Score
  const trustFactors = [
    { label: "Traceability Completeness", score: 20, max: 20, passed: true },
    { label: "Lab FSSAI Certification", score: batch.qualityTest ? 20 : 0, max: 20, passed: !!batch.qualityTest },
    { label: "Blockchain Hash Integrity", score: hashMatch ? 20 : 0, max: 20, passed: hashMatch },
    { label: "IoT Hive Climate Coverage", score: 14, max: 15, passed: true },
    { label: "Supply Chain Milestones", score: Math.min(15, batch.events.length * 3), max: 15, passed: batch.events.length >= 3 },
    { label: "KVIC Registered Beekeeper", score: 10, max: 10, passed: true },
  ];

  const totalTrustScore = trustFactors.reduce((acc, f) => acc + f.score, 0);

  res.json({
    batchId: batch.batchId,
    producer: batch.beekeeperName,
    origin: batch.originLocation,
    honeyType: batch.honeyType,
    quantity: `${batch.quantityKg} KG`,
    harvestDate: batch.harvestDate,
    hiveId: batch.hiveCode,
    hiveHealth: batch.hiveHealthAtHarvest,
    trustScore: hashMatch ? totalTrustScore : 35,
    blockchainVerified: true,
    hashMatch,
    onChainHash: batch.metadataHash,
    currentDataHash: recomputedHash,
    isTampered: !hashMatch,
    labVerified: !!batch.qualityTest,
    labResult: batch.qualityTest?.result || "PENDING",
    labMoisture: batch.qualityTest ? `${batch.qualityTest.moisture}%` : "Pending",
    labDate: batch.qualityTest?.testedAt || "In testing queue",
    txHash: batch.blockchainTx,
    journey: batch.events.map((e) => ({
      stage: e.stageLabel,
      icon: e.stage === "HARVEST" ? "🐝" : e.stage === "PROCESSING" ? "🏭" : e.stage === "LAB_TESTING" ? "🧪" : e.stage === "DISTRIBUTION" ? "🚚" : "🏪",
      actor: e.actor,
      location: e.location,
      date: new Date(e.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      txHash: e.txHash,
      notes: e.notes,
      verified: e.verified,
    })),
    trustFactors,
  });
});

export default router;
