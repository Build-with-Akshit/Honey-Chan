import contractABI from "./contractABI.json";
import contractAddress from "./contractAddress.json";

export const HONEY_CHAIN_ABI = contractABI;

// Contract address - dynamically loaded from Hardhat deployment
export const CONTRACT_ADDRESS: string = contractAddress.HoneyChain;

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
