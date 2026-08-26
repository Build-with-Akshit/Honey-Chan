// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HoneyChain
 * @dev Blockchain-based honey traceability and smart beekeeping management
 * @notice SIH26021 - Honey Chain: Traceability, QR verification, and batch tracking
 */
contract HoneyChain is AccessControl {
    // ─── Roles ───────────────────────────────────────────────────────────
    bytes32 public constant BEEKEEPER_ROLE = keccak256("BEEKEEPER_ROLE");
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant LAB_ROLE = keccak256("LAB_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    // ─── Enums ───────────────────────────────────────────────────────────
    enum BatchStatus {
        Created,
        Harvested,
        Processing,
        QualityTested,
        Distributed,
        Retail,
        Completed
    }

    enum SupplyChainStage {
        Harvest,
        Collection,
        Processing,
        LabTesting,
        Distribution,
        Retail
    }

    // ─── Structs ─────────────────────────────────────────────────────────
    struct HoneyBatch {
        string batchId;
        address beekeeper;
        uint256 quantity;          // in grams (18500 = 18.5 KG)
        uint256 harvestTimestamp;
        bytes32 metadataHash;     // SHA-256 of off-chain metadata
        address currentOwner;
        BatchStatus status;
        bytes32 qualityReportHash;
        bool qualityPassed;
        uint256 createdAt;
        uint256 lastUpdated;
        
        // Two-Step Transfer Fields
        address pendingOwner;
        SupplyChainStage pendingStage;
        bool isTransferPending;
    }

    struct SupplyChainEvent {
        SupplyChainStage stage;
        address actor;
        uint256 timestamp;
        bytes32 dataHash;         // Hash of off-chain event details
    }

    struct HiveDataRecord {
        uint256 temperature;      // multiplied by 100 (3420 = 34.20°C)
        uint256 humidity;         // multiplied by 100
        uint256 weight;           // in grams
        uint256 timestamp;
        bytes32 dataHash;         // Hash of full IoT payload
    }

    struct ConsumerSale {
        bytes32 billHash;
        uint256 saleTimestamp;
        bool isSold;
    }

    // ─── State ───────────────────────────────────────────────────────────
    mapping(string => HoneyBatch) private batches;
    mapping(string => SupplyChainEvent[]) private supplyChainHistory;
    mapping(string => HiveDataRecord[]) private hiveDataHistory;
    mapping(string => ConsumerSale) public consumerSales;
    mapping(string => bool) private batchExists;
    mapping(address => string) public participantNames;

    string[] private allBatchIds;
    uint256 public totalBatches;

    // ─── Events ──────────────────────────────────────────────────────────
    event ParticipantRegistered(
        address indexed participant,
        bytes32 indexed role,
        string name
    );

    event BatchCreated(
        string indexed batchId,
        address indexed beekeeper,
        uint256 quantity,
        bytes32 metadataHash,
        uint256 timestamp
    );

    event HarvestRecorded(
        string indexed batchId,
        uint256 quantity,
        uint256 timestamp
    );

    event HiveDataRecorded(
        string indexed batchId,
        uint256 temperature,
        uint256 humidity,
        uint256 weight,
        uint256 timestamp
    );

    event QualityVerified(
        string indexed batchId,
        address indexed lab,
        bool passed,
        bytes32 reportHash,
        uint256 timestamp
    );

    event BatchTransferred(
        string indexed batchId,
        address indexed from,
        address indexed to,
        SupplyChainStage stage,
        uint256 timestamp
    );

    event TransferInitiated(
        string indexed batchId,
        address indexed from,
        address indexed pendingTo,
        SupplyChainStage pendingStage,
        uint256 timestamp
    );

    event TransferRejected(
        string indexed batchId,
        address indexed from,
        address indexed pendingTo,
        uint256 timestamp
    );

    event ProcessingCompleted(
        string indexed batchId,
        address indexed processor,
        uint256 timestamp
    );

    event BatchReceived(
        string indexed batchId,
        address indexed receiver,
        SupplyChainStage stage,
        uint256 timestamp
    );

    event ConsumerSaleCompleted(
        string indexed batchId,
        bytes32 billHash,
        uint256 timestamp
    );

    // ─── Custom Errors ───────────────────────────────────────────────────
    error BatchAlreadyExists(string batchId);
    error BatchNotFound(string batchId);
    error NotBatchOwner(string batchId, address caller);
    error InvalidQuantity();
    error InvalidBatchId();
    error InvalidTransition(BatchStatus current, BatchStatus target);
    error QualityNotVerified(string batchId);
    error BatchClosed(string batchId);
    error TransferAlreadyPending(string batchId);
    error NoTransferPending(string batchId);
    error NotPendingOwner(string batchId, address caller);

    // ─── Modifiers ───────────────────────────────────────────────────────
    modifier notCompleted(string calldata batchId) {
        if (batches[batchId].status == BatchStatus.Completed) revert BatchClosed(batchId);
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        participantNames[msg.sender] = "Admin";
    }

    // ─── Admin Functions ─────────────────────────────────────────────────

    /**
     * @dev Register a participant with a specific role
     * @param participant Address of the participant
     * @param role Role to assign (use role constants)
     * @param name Display name of the participant
     */
    function registerParticipant(
        address participant,
        bytes32 role,
        string calldata name
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, participant);
        participantNames[participant] = name;
        emit ParticipantRegistered(participant, role, name);
    }

    /**
     * @dev Remove a participant's role
     */
    function removeParticipant(
        address participant,
        bytes32 role
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(role, participant);
    }

    // ─── Beekeeper Functions ─────────────────────────────────────────────

    /**
     * @dev Create a new honey batch
     * @param batchId Unique batch identifier (e.g., "HC-2026-000127")
     * @param metadataHash SHA-256 hash of off-chain metadata JSON
     * @param quantity Quantity in grams
     * @param harvestTimestamp Unix timestamp of harvest
     */
    function createBatch(
        string calldata batchId,
        bytes32 metadataHash,
        uint256 quantity,
        uint256 harvestTimestamp
    ) external onlyRole(BEEKEEPER_ROLE) {
        if (bytes(batchId).length == 0) revert InvalidBatchId();
        if (batchExists[batchId]) revert BatchAlreadyExists(batchId);
        if (quantity == 0) revert InvalidQuantity();

        HoneyBatch storage batch = batches[batchId];
        batch.batchId = batchId;
        batch.beekeeper = msg.sender;
        batch.quantity = quantity;
        batch.harvestTimestamp = harvestTimestamp;
        batch.metadataHash = metadataHash;
        batch.currentOwner = msg.sender;
        batch.status = BatchStatus.Created;
        batch.createdAt = block.timestamp;
        batch.lastUpdated = block.timestamp;

        batchExists[batchId] = true;
        allBatchIds.push(batchId);
        totalBatches++;

        // Record initial supply chain event
        supplyChainHistory[batchId].push(SupplyChainEvent({
            stage: SupplyChainStage.Harvest,
            actor: msg.sender,
            timestamp: block.timestamp,
            dataHash: metadataHash
        }));

        emit BatchCreated(batchId, msg.sender, quantity, metadataHash, block.timestamp);
        emit HarvestRecorded(batchId, quantity, harvestTimestamp);
    }

    /**
     * @dev Record IoT hive data for a batch
     */
    function recordHiveData(
        string calldata batchId,
        uint256 temperature,
        uint256 humidity,
        uint256 weight,
        bytes32 dataHash
    ) external onlyRole(BEEKEEPER_ROLE) {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);

        hiveDataHistory[batchId].push(HiveDataRecord({
            temperature: temperature,
            humidity: humidity,
            weight: weight,
            timestamp: block.timestamp,
            dataHash: dataHash
        }));

        emit HiveDataRecorded(batchId, temperature, humidity, weight, block.timestamp);
    }

    // ─── Lab Functions ───────────────────────────────────────────────────

    /**
     * @dev Submit quality test results for a batch
     * @param batchId Batch to verify
     * @param reportHash SHA-256 hash of lab report
     * @param passed Whether quality test passed
     */
    function submitQualityTest(
        string calldata batchId,
        bytes32 reportHash,
        bool passed
    ) external onlyRole(LAB_ROLE) notCompleted(batchId) {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);

        HoneyBatch storage batch = batches[batchId];
        batch.qualityReportHash = reportHash;
        batch.qualityPassed = passed;
        batch.status = BatchStatus.QualityTested;
        batch.lastUpdated = block.timestamp;

        supplyChainHistory[batchId].push(SupplyChainEvent({
            stage: SupplyChainStage.LabTesting,
            actor: msg.sender,
            timestamp: block.timestamp,
            dataHash: reportHash
        }));

        emit QualityVerified(batchId, msg.sender, passed, reportHash, block.timestamp);
    }

    // ─── Transfer Functions ──────────────────────────────────────────────

    /**
     * @dev Step 1: Initiate a transfer to next actor in supply chain
     */
    function initiateTransfer(
        string calldata batchId,
        address newOwner,
        SupplyChainStage stage
    ) external notCompleted(batchId) {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);

        HoneyBatch storage batch = batches[batchId];
        if (batch.currentOwner != msg.sender) revert NotBatchOwner(batchId, msg.sender);
        if (batch.isTransferPending) revert TransferAlreadyPending(batchId);

        batch.pendingOwner = newOwner;
        batch.pendingStage = stage;
        batch.isTransferPending = true;
        batch.lastUpdated = block.timestamp;

        emit TransferInitiated(batchId, msg.sender, newOwner, stage, block.timestamp);
    }

    /**
     * @dev Step 2: Accept a pending transfer
     */
    function acceptTransfer(string calldata batchId) external notCompleted(batchId) {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);

        HoneyBatch storage batch = batches[batchId];
        if (!batch.isTransferPending) revert NoTransferPending(batchId);
        if (batch.pendingOwner != msg.sender) revert NotPendingOwner(batchId, msg.sender);

        address previousOwner = batch.currentOwner;
        address newOwner = batch.pendingOwner;
        SupplyChainStage stage = batch.pendingStage;

        // Clear pending state
        batch.currentOwner = newOwner;
        batch.pendingOwner = address(0);
        batch.isTransferPending = false;
        batch.lastUpdated = block.timestamp;

        // Update status based on stage
        if (stage == SupplyChainStage.Processing) {
            batch.status = BatchStatus.Processing;
            emit ProcessingCompleted(batchId, newOwner, block.timestamp);
        } else if (stage == SupplyChainStage.Distribution) {
            batch.status = BatchStatus.Distributed;
        } else if (stage == SupplyChainStage.Retail) {
            batch.status = BatchStatus.Retail;
        }

        supplyChainHistory[batchId].push(SupplyChainEvent({
            stage: stage,
            actor: newOwner,
            timestamp: block.timestamp,
            dataHash: bytes32(0) // Hash will be captured off-chain if needed
        }));

        emit BatchTransferred(batchId, previousOwner, newOwner, stage, block.timestamp);
        emit BatchReceived(batchId, newOwner, stage, block.timestamp);
    }

    /**
     * @dev Reject/Cancel a pending transfer
     */
    function rejectTransfer(string calldata batchId) external notCompleted(batchId) {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);

        HoneyBatch storage batch = batches[batchId];
        if (!batch.isTransferPending) revert NoTransferPending(batchId);
        
        // Either current owner (cancel) or pending owner (reject) can call this
        if (msg.sender != batch.currentOwner && msg.sender != batch.pendingOwner) {
            revert NotPendingOwner(batchId, msg.sender);
        }

        address pendingTo = batch.pendingOwner;
        batch.pendingOwner = address(0);
        batch.isTransferPending = false;
        batch.lastUpdated = block.timestamp;

        emit TransferRejected(batchId, batch.currentOwner, pendingTo, block.timestamp);
    }

    /**
     * @dev Retailer records the final consumer sale, locking the batch permanently
     * @param batchId Batch that was sold
     * @param billHash SHA-256 hash of the consumer bill / receipt details
     */
    function completeRetailSale(
        string calldata batchId,
        bytes32 billHash
    ) external onlyRole(RETAILER_ROLE) notCompleted(batchId) {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);

        HoneyBatch storage batch = batches[batchId];
        if (batch.currentOwner != msg.sender) revert NotBatchOwner(batchId, msg.sender);
        if (batch.status != BatchStatus.Retail) revert InvalidTransition(batch.status, BatchStatus.Completed);

        // Lock the batch
        batch.status = BatchStatus.Completed;
        batch.lastUpdated = block.timestamp;

        // Record the sale
        consumerSales[batchId] = ConsumerSale({
            billHash: billHash,
            saleTimestamp: block.timestamp,
            isSold: true
        });

        // Add final supply chain event
        supplyChainHistory[batchId].push(SupplyChainEvent({
            stage: SupplyChainStage.Retail, // Final stage
            actor: msg.sender,
            timestamp: block.timestamp,
            dataHash: billHash
        }));

        emit ConsumerSaleCompleted(batchId, billHash, block.timestamp);
    }

    // ─── View Functions ──────────────────────────────────────────────────

    /**
     * @dev Get batch details (public - consumer verification)
     */
    function getBatch(string calldata batchId) external view returns (
        string memory _batchId,
        address beekeeper,
        uint256 quantity,
        uint256 harvestTimestamp,
        bytes32 metadataHash,
        address currentOwner,
        BatchStatus status,
        bytes32 qualityReportHash,
        bool qualityPassed,
        uint256 createdAt,
        address pendingOwner,
        bool isTransferPending
    ) {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);
        HoneyBatch storage batch = batches[batchId];

        return (
            batch.batchId,
            batch.beekeeper,
            batch.quantity,
            batch.harvestTimestamp,
            batch.metadataHash,
            batch.currentOwner,
            batch.status,
            batch.qualityReportHash,
            batch.qualityPassed,
            batch.createdAt,
            batch.pendingOwner,
            batch.isTransferPending
        );
    }

    /**
     * @dev Get supply chain history for a batch
     */
    function getBatchHistory(string calldata batchId) 
        external view returns (SupplyChainEvent[] memory) 
    {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);
        return supplyChainHistory[batchId];
    }

    /**
     * @dev Get hive data history for a batch
     */
    function getHiveDataHistory(string calldata batchId)
        external view returns (HiveDataRecord[] memory)
    {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);
        return hiveDataHistory[batchId];
    }

    /**
     * @dev Verify batch integrity by comparing metadata hash
     * @param batchId Batch to verify
     * @param currentHash Current computed hash of metadata
     * @return verified Whether hashes match (true = not tampered)
     * @return onChainHash The hash stored on blockchain
     */
    function verifyBatch(string calldata batchId, bytes32 currentHash) 
        external view returns (bool verified, bytes32 onChainHash) 
    {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);
        HoneyBatch storage batch = batches[batchId];
        onChainHash = batch.metadataHash;
        verified = (onChainHash == currentHash);
    }

    /**
     * @dev Check if a batch exists
     */
    function doesBatchExist(string calldata batchId) external view returns (bool) {
        return batchExists[batchId];
    }

    /**
     * @dev Get all batch IDs (for admin dashboard)
     */
    function getAllBatchIds() external view returns (string[] memory) {
        return allBatchIds;
    }

    /**
     * @dev Get participant role check
     */
    function getParticipantRole(address participant) external view returns (
        bool isAdmin,
        bool isBeekeeper,
        bool isProcessor,
        bool isLab,
        bool isDistributor,
        bool isRetailer
    ) {
        return (
            hasRole(DEFAULT_ADMIN_ROLE, participant),
            hasRole(BEEKEEPER_ROLE, participant),
            hasRole(PROCESSOR_ROLE, participant),
            hasRole(LAB_ROLE, participant),
            hasRole(DISTRIBUTOR_ROLE, participant),
            hasRole(RETAILER_ROLE, participant)
        );
    }
}
