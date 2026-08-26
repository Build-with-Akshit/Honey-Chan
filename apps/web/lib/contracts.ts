// Contract ABI - will be updated after deployment
// For now, this contains the interface derived from HoneyChain.sol

export const HONEY_CHAIN_ABI = [
  // ─── Role Constants ───
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function BEEKEEPER_ROLE() view returns (bytes32)",
  "function PROCESSOR_ROLE() view returns (bytes32)",
  "function LAB_ROLE() view returns (bytes32)",
  "function DISTRIBUTOR_ROLE() view returns (bytes32)",
  "function RETAILER_ROLE() view returns (bytes32)",

  // ─── Admin Functions ───
  "function registerParticipant(address participant, bytes32 role, string name)",
  "function removeParticipant(address participant, bytes32 role)",

  // ─── Beekeeper Functions ───
  "function createBatch(string batchId, bytes32 metadataHash, uint256 quantity, uint256 harvestTimestamp)",
  "function recordHiveData(string batchId, uint256 temperature, uint256 humidity, uint256 weight, bytes32 dataHash)",

  // ─── Lab Functions ───
  "function submitQualityTest(string batchId, bytes32 reportHash, bool passed)",

  // ─── Transfer & Retail Functions ───
  "function initiateTransfer(string batchId, address newOwner, uint8 stage)",
  "function acceptTransfer(string batchId)",
  "function rejectTransfer(string batchId)",
  "function completeRetailSale(string batchId, bytes32 billHash)",

  // ─── View Functions ───
  "function getBatch(string batchId) view returns (string, address, uint256, uint256, bytes32, address, uint8, bytes32, bool, uint256, address, bool)",
  "function getBatchHistory(string batchId) view returns (tuple(uint8 stage, address actor, uint256 timestamp, bytes32 dataHash)[])",
  "function getHiveDataHistory(string batchId) view returns (tuple(uint256 temperature, uint256 humidity, uint256 weight, uint256 timestamp, bytes32 dataHash)[])",
  "function verifyBatch(string batchId, bytes32 currentHash) view returns (bool verified, bytes32 onChainHash)",
  "function doesBatchExist(string batchId) view returns (bool)",
  "function getAllBatchIds() view returns (string[])",
  "function getParticipantRole(address participant) view returns (bool isAdmin, bool isBeekeeper, bool isProcessor, bool isLab, bool isDistributor, bool isRetailer)",
  "function participantNames(address) view returns (string)",
  "function totalBatches() view returns (uint256)",
  "function hasRole(bytes32 role, address account) view returns (bool)",

  // ─── Events ───
  "event ParticipantRegistered(address indexed participant, bytes32 indexed role, string name)",
  "event BatchCreated(string indexed batchId, address indexed beekeeper, uint256 quantity, bytes32 metadataHash, uint256 timestamp)",
  "event HarvestRecorded(string indexed batchId, uint256 quantity, uint256 timestamp)",
  "event HiveDataRecorded(string indexed batchId, uint256 temperature, uint256 humidity, uint256 weight, uint256 timestamp)",
  "event QualityVerified(string indexed batchId, address indexed lab, bool passed, bytes32 reportHash, uint256 timestamp)",
  "event TransferInitiated(string indexed batchId, address indexed from, address indexed pendingTo, uint8 pendingStage, uint256 timestamp)",
  "event TransferRejected(string indexed batchId, address indexed from, address indexed pendingTo, uint256 timestamp)",
  "event BatchTransferred(string indexed batchId, address indexed from, address indexed to, uint8 stage, uint256 timestamp)",
  "event ProcessingCompleted(string indexed batchId, address indexed processor, uint256 timestamp)",
  "event BatchReceived(string indexed batchId, address indexed receiver, uint8 stage, uint256 timestamp)",
] as const;

// Contract address - Force hardcoded to ignore Vercel env variable for now
export const CONTRACT_ADDRESS: string = "0x8a518a619fD9A9d040d1f47b9dD789420d648167";

// Network config
export const NETWORK_CONFIG = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337"),
  chainIdHex: `0x${parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337").toString(16)}`,
  networkName: "Sepolia",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545",
  currencySymbol: "ETH",
  blockExplorerUrl: "",
};

// Role types
export type UserRole = "ADMIN" | "BEEKEEPER" | "PROCESSOR" | "LAB" | "DISTRIBUTOR" | "WHOLESALER" | "RETAILER" | "NONE";

// Batch status mapping
export const BATCH_STATUS_MAP: Record<number, string> = {
  0: "Created",
  1: "Harvested",
  2: "Processing",
  3: "Quality Tested",
  4: "Distributed",
  5: "Retail",
  6: "Completed",
};

// Supply chain stage mapping
export const SUPPLY_CHAIN_STAGE_MAP: Record<number, string> = {
  0: "Harvest",
  1: "Collection",
  2: "Processing",
  3: "Lab Testing",
  4: "Distribution",
  5: "Retail",
};

export const SUPPLY_CHAIN_ICONS: Record<number, string> = {
  0: "🐝",
  1: "📦",
  2: "🏭",
  3: "🧪",
  4: "🚚",
  5: "🏪",
};
