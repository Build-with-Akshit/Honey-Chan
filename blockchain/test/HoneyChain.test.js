const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HoneyChain", function () {
  let honeyChain;
  let admin, beekeeper, processor, lab, distributor, retailer, unauthorized;

  // Role constants
  let BEEKEEPER_ROLE, PROCESSOR_ROLE, LAB_ROLE, DISTRIBUTOR_ROLE, RETAILER_ROLE, ADMIN_ROLE;

  beforeEach(async function () {
    [admin, beekeeper, processor, lab, distributor, retailer, unauthorized] =
      await ethers.getSigners();

    const HoneyChain = await ethers.getContractFactory("HoneyChain");
    honeyChain = await HoneyChain.deploy();
    await honeyChain.waitForDeployment();

    // Get role constants
    ADMIN_ROLE = await honeyChain.DEFAULT_ADMIN_ROLE();
    BEEKEEPER_ROLE = await honeyChain.BEEKEEPER_ROLE();
    PROCESSOR_ROLE = await honeyChain.PROCESSOR_ROLE();
    LAB_ROLE = await honeyChain.LAB_ROLE();
    DISTRIBUTOR_ROLE = await honeyChain.DISTRIBUTOR_ROLE();
    RETAILER_ROLE = await honeyChain.RETAILER_ROLE();

    // Register participants
    await honeyChain.registerParticipant(beekeeper.address, BEEKEEPER_ROLE, "Ramesh Kumar");
    await honeyChain.registerParticipant(processor.address, PROCESSOR_ROLE, "ABC Processing");
    await honeyChain.registerParticipant(lab.address, LAB_ROLE, "Quality Lab");
    await honeyChain.registerParticipant(distributor.address, DISTRIBUTOR_ROLE, "Honey Distributors");
    await honeyChain.registerParticipant(retailer.address, RETAILER_ROLE, "Fresh Mart");
  });

  describe("Deployment", function () {
    it("should set deployer as admin", async function () {
      expect(await honeyChain.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("should initialize with zero batches", async function () {
      expect(await honeyChain.totalBatches()).to.equal(0);
    });

    it("should store admin name", async function () {
      expect(await honeyChain.participantNames(admin.address)).to.equal("Admin");
    });
  });

  describe("Participant Registration", function () {
    it("should register participants with correct roles", async function () {
      expect(await honeyChain.hasRole(BEEKEEPER_ROLE, beekeeper.address)).to.be.true;
      expect(await honeyChain.hasRole(PROCESSOR_ROLE, processor.address)).to.be.true;
      expect(await honeyChain.hasRole(LAB_ROLE, lab.address)).to.be.true;
      expect(await honeyChain.hasRole(DISTRIBUTOR_ROLE, distributor.address)).to.be.true;
      expect(await honeyChain.hasRole(RETAILER_ROLE, retailer.address)).to.be.true;
    });

    it("should store participant names", async function () {
      expect(await honeyChain.participantNames(beekeeper.address)).to.equal("Ramesh Kumar");
    });

    it("should emit ParticipantRegistered event", async function () {
      await expect(
        honeyChain.registerParticipant(unauthorized.address, BEEKEEPER_ROLE, "New Beekeeper")
      ).to.emit(honeyChain, "ParticipantRegistered")
        .withArgs(unauthorized.address, BEEKEEPER_ROLE, "New Beekeeper");
    });

    it("should reject registration from non-admin", async function () {
      await expect(
        honeyChain.connect(beekeeper).registerParticipant(
          unauthorized.address, BEEKEEPER_ROLE, "Hack"
        )
      ).to.be.reverted;
    });

    it("should correctly return all roles via getParticipantRole", async function () {
      const roles = await honeyChain.getParticipantRole(beekeeper.address);
      expect(roles.isAdmin).to.be.false;
      expect(roles.isBeekeeper).to.be.true;
      expect(roles.isProcessor).to.be.false;
      expect(roles.isLab).to.be.false;
      expect(roles.isDistributor).to.be.false;
      expect(roles.isRetailer).to.be.false;
    });
  });

  describe("Batch Creation", function () {
    const batchId = "HC-2026-000001";
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("test-metadata"));
    const quantity = 18500; // 18.5 KG in grams
    const harvestTimestamp = Math.floor(Date.now() / 1000);

    it("should create a honey batch", async function () {
      const tx = await honeyChain.connect(beekeeper).createBatch(
        batchId, metadataHash, quantity, harvestTimestamp
      );
      await expect(tx).to.emit(honeyChain, "BatchCreated");

      expect(await honeyChain.totalBatches()).to.equal(1);
    });

    it("should store correct batch data", async function () {
      await honeyChain.connect(beekeeper).createBatch(
        batchId, metadataHash, quantity, harvestTimestamp
      );

      const batch = await honeyChain.getBatch(batchId);
      expect(batch._batchId).to.equal(batchId);
      expect(batch.beekeeper).to.equal(beekeeper.address);
      expect(batch.quantity).to.equal(quantity);
      expect(batch.metadataHash).to.equal(metadataHash);
      expect(batch.currentOwner).to.equal(beekeeper.address);
      expect(batch.status).to.equal(0); // Created
    });

    it("should reject duplicate batch IDs", async function () {
      await honeyChain.connect(beekeeper).createBatch(
        batchId, metadataHash, quantity, harvestTimestamp
      );

      await expect(
        honeyChain.connect(beekeeper).createBatch(
          batchId, metadataHash, quantity, harvestTimestamp
        )
      ).to.be.revertedWithCustomError(honeyChain, "BatchAlreadyExists");
    });

    it("should reject empty batch ID", async function () {
      await expect(
        honeyChain.connect(beekeeper).createBatch(
          "", metadataHash, quantity, harvestTimestamp
        )
      ).to.be.revertedWithCustomError(honeyChain, "InvalidBatchId");
    });

    it("should reject zero quantity", async function () {
      await expect(
        honeyChain.connect(beekeeper).createBatch(
          batchId, metadataHash, 0, harvestTimestamp
        )
      ).to.be.revertedWithCustomError(honeyChain, "InvalidQuantity");
    });

    it("should reject creation from unauthorized address", async function () {
      await expect(
        honeyChain.connect(unauthorized).createBatch(
          batchId, metadataHash, quantity, harvestTimestamp
        )
      ).to.be.reverted;
    });

    it("should reject creation from non-beekeeper role", async function () {
      await expect(
        honeyChain.connect(processor).createBatch(
          batchId, metadataHash, quantity, harvestTimestamp
        )
      ).to.be.reverted;
    });

    it("should record initial supply chain event", async function () {
      await honeyChain.connect(beekeeper).createBatch(
        batchId, metadataHash, quantity, harvestTimestamp
      );

      const history = await honeyChain.getBatchHistory(batchId);
      expect(history.length).to.equal(1);
      expect(history[0].stage).to.equal(0); // Harvest
      expect(history[0].actor).to.equal(beekeeper.address);
    });
  });

  describe("Hive Data Recording", function () {
    const batchId = "HC-2026-000001";

    beforeEach(async function () {
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await honeyChain.connect(beekeeper).createBatch(
        batchId, metadataHash, 18500, Math.floor(Date.now() / 1000)
      );
    });

    it("should record hive data", async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("iot-data"));
      const tx = await honeyChain.connect(beekeeper).recordHiveData(
        batchId, 3420, 6700, 38400, dataHash
      );
      await expect(tx).to.emit(honeyChain, "HiveDataRecorded");
    });

    it("should store hive data history", async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("iot-data"));
      await honeyChain.connect(beekeeper).recordHiveData(
        batchId, 3420, 6700, 38400, dataHash
      );

      const history = await honeyChain.getHiveDataHistory(batchId);
      expect(history.length).to.equal(1);
      expect(history[0].temperature).to.equal(3420);
      expect(history[0].humidity).to.equal(6700);
      expect(history[0].weight).to.equal(38400);
    });

    it("should reject hive data for nonexistent batch", async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("iot-data"));
      await expect(
        honeyChain.connect(beekeeper).recordHiveData(
          "FAKE-001", 3420, 6700, 38400, dataHash
        )
      ).to.be.revertedWithCustomError(honeyChain, "BatchNotFound");
    });
  });

  describe("Quality Verification", function () {
    const batchId = "HC-2026-000001";

    beforeEach(async function () {
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await honeyChain.connect(beekeeper).createBatch(
        batchId, metadataHash, 18500, Math.floor(Date.now() / 1000)
      );
    });

    it("should submit passing quality test", async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("lab-report"));
      const tx = await honeyChain.connect(lab).submitQualityTest(batchId, reportHash, true);
      await expect(tx).to.emit(honeyChain, "QualityVerified");

      const batch = await honeyChain.getBatch(batchId);
      expect(batch.qualityPassed).to.be.true;
      expect(batch.qualityReportHash).to.equal(reportHash);
      expect(batch.status).to.equal(3); // QualityTested
    });

    it("should submit failing quality test", async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("fail-report"));
      await honeyChain.connect(lab).submitQualityTest(batchId, reportHash, false);

      const batch = await honeyChain.getBatch(batchId);
      expect(batch.qualityPassed).to.be.false;
    });

    it("should reject quality test from non-lab", async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("fake-report"));
      await expect(
        honeyChain.connect(beekeeper).submitQualityTest(batchId, reportHash, true)
      ).to.be.reverted;
    });

    it("should add lab testing event to supply chain history", async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("lab-report"));
      await honeyChain.connect(lab).submitQualityTest(batchId, reportHash, true);

      const history = await honeyChain.getBatchHistory(batchId);
      expect(history.length).to.equal(2); // Harvest + LabTesting
      expect(history[1].stage).to.equal(3); // LabTesting
      expect(history[1].actor).to.equal(lab.address);
    });
  });

  describe("Batch Transfer", function () {
    const batchId = "HC-2026-000001";

    beforeEach(async function () {
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await honeyChain.connect(beekeeper).createBatch(
        batchId, metadataHash, 18500, Math.floor(Date.now() / 1000)
      );
    });

    it("should transfer batch to processor", async function () {
      const tx = await honeyChain.connect(beekeeper).transferBatch(
        batchId, processor.address, 2 // Processing
      );
      await expect(tx).to.emit(honeyChain, "BatchTransferred");

      const batch = await honeyChain.getBatch(batchId);
      expect(batch.currentOwner).to.equal(processor.address);
      expect(batch.status).to.equal(2); // Processing
    });

    it("should allow chain of transfers", async function () {
      // Beekeeper → Processor
      await honeyChain.connect(beekeeper).transferBatch(
        batchId, processor.address, 2
      );
      // Processor → Distributor
      await honeyChain.connect(processor).transferBatch(
        batchId, distributor.address, 4 // Distribution
      );
      // Distributor → Retailer
      await honeyChain.connect(distributor).transferBatch(
        batchId, retailer.address, 5 // Retail
      );

      const batch = await honeyChain.getBatch(batchId);
      expect(batch.currentOwner).to.equal(retailer.address);
      expect(batch.status).to.equal(5); // Retail
    });

    it("should reject transfer from non-owner", async function () {
      await expect(
        honeyChain.connect(processor).transferBatch(
          batchId, distributor.address, 4
        )
      ).to.be.revertedWithCustomError(honeyChain, "NotBatchOwner");
    });

    it("should reject transfer for nonexistent batch", async function () {
      await expect(
        honeyChain.connect(beekeeper).transferBatch(
          "FAKE-001", processor.address, 2
        )
      ).to.be.revertedWithCustomError(honeyChain, "BatchNotFound");
    });

    it("should record supply chain events for transfers", async function () {
      await honeyChain.connect(beekeeper).transferBatch(
        batchId, processor.address, 2
      );
      await honeyChain.connect(processor).transferBatch(
        batchId, distributor.address, 4
      );

      const history = await honeyChain.getBatchHistory(batchId);
      expect(history.length).to.equal(3); // Harvest + Processing + Distribution
    });
  });

  describe("Batch Verification", function () {
    const batchId = "HC-2026-000001";
    const originalMetadata = "test-metadata-original";
    let metadataHash;

    beforeEach(async function () {
      metadataHash = ethers.keccak256(ethers.toUtf8Bytes(originalMetadata));
      await honeyChain.connect(beekeeper).createBatch(
        batchId, metadataHash, 18500, Math.floor(Date.now() / 1000)
      );
    });

    it("should verify matching hash", async function () {
      const currentHash = ethers.keccak256(ethers.toUtf8Bytes(originalMetadata));
      const [verified, onChainHash] = await honeyChain.verifyBatch(batchId, currentHash);
      expect(verified).to.be.true;
      expect(onChainHash).to.equal(metadataHash);
    });

    it("should detect tampered data", async function () {
      const tamperedHash = ethers.keccak256(ethers.toUtf8Bytes("tampered-metadata"));
      const [verified] = await honeyChain.verifyBatch(batchId, tamperedHash);
      expect(verified).to.be.false;
    });

    it("should reject verification for nonexistent batch", async function () {
      await expect(
        honeyChain.verifyBatch("FAKE-001", metadataHash)
      ).to.be.revertedWithCustomError(honeyChain, "BatchNotFound");
    });
  });

  describe("Batch Queries", function () {
    it("should check batch existence", async function () {
      expect(await honeyChain.doesBatchExist("HC-2026-000001")).to.be.false;

      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await honeyChain.connect(beekeeper).createBatch(
        "HC-2026-000001", metadataHash, 18500, Math.floor(Date.now() / 1000)
      );

      expect(await honeyChain.doesBatchExist("HC-2026-000001")).to.be.true;
    });

    it("should return all batch IDs", async function () {
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await honeyChain.connect(beekeeper).createBatch(
        "HC-2026-000001", metadataHash, 18500, Math.floor(Date.now() / 1000)
      );
      await honeyChain.connect(beekeeper).createBatch(
        "HC-2026-000002", metadataHash, 25000, Math.floor(Date.now() / 1000)
      );

      const ids = await honeyChain.getAllBatchIds();
      expect(ids.length).to.equal(2);
      expect(ids[0]).to.equal("HC-2026-000001");
      expect(ids[1]).to.equal("HC-2026-000002");
    });

    it("should reject getBatch for nonexistent batch", async function () {
      await expect(
        honeyChain.getBatch("FAKE-001")
      ).to.be.revertedWithCustomError(honeyChain, "BatchNotFound");
    });
  });

  describe("Full Supply Chain Flow", function () {
    it("should complete entire Harvest → Lab → Distribute → Retail flow", async function () {
      const batchId = "HC-2026-FULL";
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("full-flow-meta"));
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("lab-report-full"));

      // 1. Beekeeper creates batch
      await honeyChain.connect(beekeeper).createBatch(
        batchId, metadataHash, 18500, Math.floor(Date.now() / 1000)
      );

      // 2. Record hive data
      const iotHash = ethers.keccak256(ethers.toUtf8Bytes("iot-snapshot"));
      await honeyChain.connect(beekeeper).recordHiveData(
        batchId, 3420, 6700, 38400, iotHash
      );

      // 3. Transfer to processor
      await honeyChain.connect(beekeeper).transferBatch(
        batchId, processor.address, 2 // Processing
      );

      // 4. Lab verifies quality
      await honeyChain.connect(lab).submitQualityTest(
        batchId, reportHash, true
      );

      // 5. Processor transfers to distributor
      await honeyChain.connect(processor).transferBatch(
        batchId, distributor.address, 4 // Distribution
      );

      // 6. Distributor transfers to retailer
      await honeyChain.connect(distributor).transferBatch(
        batchId, retailer.address, 5 // Retail
      );

      // Verify final state
      const batch = await honeyChain.getBatch(batchId);
      expect(batch.currentOwner).to.equal(retailer.address);
      expect(batch.qualityPassed).to.be.true;
      expect(batch.status).to.equal(5); // Retail

      // Verify supply chain history
      const history = await honeyChain.getBatchHistory(batchId);
      expect(history.length).to.equal(5);
      // Harvest → Processing → LabTesting → Distribution → Retail

      // Verify tamper detection still works
      const [verified] = await honeyChain.verifyBatch(batchId, metadataHash);
      expect(verified).to.be.true;

      // Verify IoT data was recorded
      const hiveData = await honeyChain.getHiveDataHistory(batchId);
      expect(hiveData.length).to.equal(1);
    });
  });

  // Helper to get approximate block timestamp
  async function getBlockTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
});
