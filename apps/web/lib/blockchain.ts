/**
 * Honey Chain — Server-Side Blockchain Utilities
 * Reads from the deployed HoneyChain smart contract on Sepolia via ethers.js.
 *
 * Used by API routes (server-side only) to verify batch integrity and
 * fetch on-chain data for the consumer QR verification page.
 */

import { JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from "ethers";
import { HONEY_CHAIN_ABI, CONTRACT_ADDRESS, NETWORK_CONFIG } from "./contracts";

// Server-side read-only provider (no wallet needed)
let _provider: JsonRpcProvider | null = null;
let _contract: Contract | null = null;

export function getProvider(): JsonRpcProvider {
  if (!_provider) {
    _provider = new JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
  }
  return _provider;
}

export function getContract(): Contract {
  if (!_contract) {
    const provider = getProvider();
    _contract = new Contract(CONTRACT_ADDRESS, HONEY_CHAIN_ABI, provider);
  }
  return _contract;
}

export async function getContractWithSigner(): Promise<Contract> {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    const { BrowserProvider } = await import("ethers");
    const browserProvider = new BrowserProvider((window as any).ethereum);
    const signer = await browserProvider.getSigner();
    return new Contract(CONTRACT_ADDRESS, HONEY_CHAIN_ABI, signer);
  }
  throw new Error("No crypto wallet found. Please connect MetaMask.");
}

/**
 * Check if a batch exists on-chain
 */
export async function doesBatchExistOnChain(batchId: string): Promise<boolean> {
  try {
    const contract = getContract();
    return await contract.doesBatchExist(batchId);
  } catch (error) {
    console.error("[Blockchain] doesBatchExist error:", error);
    return false;
  }
}

/**
 * Get batch data from blockchain
 */
export async function getOnChainBatch(batchId: string) {
  try {
    const contract = getContract();
    const exists = await contract.doesBatchExist(batchId);
    if (!exists) return null;

    const result = await contract.getBatch(batchId);
    return {
      batchId: result[0],
      beekeeper: result[1],
      quantity: Number(result[2]),
      harvestTimestamp: Number(result[3]),
      metadataHash: result[4],
      currentOwner: result[5],
      status: Number(result[6]),
      qualityReportHash: result[7],
      qualityPassed: result[8],
      createdAt: Number(result[9]),
    };
  } catch (error) {
    console.error("[Blockchain] getBatch error:", error);
    return null;
  }
}

/**
 * Get supply chain history from blockchain
 */
export async function getOnChainHistory(batchId: string) {
  try {
    const contract = getContract();
    const exists = await contract.doesBatchExist(batchId);
    if (!exists) return [];

    const events = await contract.getBatchHistory(batchId);
    return events.map((e: any) => ({
      stage: Number(e.stage),
      actor: e.actor,
      timestamp: Number(e.timestamp),
      dataHash: e.dataHash,
    }));
  } catch (error) {
    console.error("[Blockchain] getBatchHistory error:", error);
    return [];
  }
}

/**
 * Verify batch integrity by comparing a computed hash against on-chain hash.
 * This is the core tamper-detection mechanism.
 */
export async function verifyBatchHash(
  batchId: string,
  currentDataHash: string
): Promise<{ verified: boolean; onChainHash: string }> {
  try {
    const contract = getContract();
    const exists = await contract.doesBatchExist(batchId);
    if (!exists) {
      return { verified: false, onChainHash: "0x" + "0".repeat(64) };
    }

    const [verified, onChainHash] = await contract.verifyBatch(batchId, currentDataHash);
    return { verified, onChainHash };
  } catch (error) {
    console.error("[Blockchain] verifyBatch error:", error);
    return { verified: false, onChainHash: "0x" + "0".repeat(64) };
  }
}

/**
 * Compute a deterministic metadata hash from batch data.
 * This must match what was stored on-chain during createBatch().
 */
export function computeMetadataHash(data: {
  batchId: string;
  beekeeperName: string;
  hiveCode: string;
  quantity: number;
  honeyType: string;
  location: string;
}): string {
  const payload = JSON.stringify({
    batchId: data.batchId,
    beekeeper: data.beekeeperName,
    hive: data.hiveCode,
    quantity: data.quantity,
    type: data.honeyType,
    location: data.location,
  });
  return keccak256(toUtf8Bytes(payload));
}

/**
 * Check if the blockchain is reachable (health check)
 */
export async function isBlockchainReachable(): Promise<boolean> {
  try {
    const provider = getProvider();
    const blockNumber = await provider.getBlockNumber();
    return blockNumber > 0;
  } catch {
    return false;
  }
}
