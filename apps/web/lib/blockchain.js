import { ethers } from "ethers";
import HoneyChainABI from "./abi.json";

// Replace with your actual contract address from deployments
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || HoneyChainABI.address;

/**
 * Get read-only provider (for users who don't have MetaMask)
 */
export const getProvider = () => {
  // Can use Infura/Alchemy or local RPC based on environment
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
  return new ethers.JsonRpcProvider(rpcUrl);
};

/**
 * Get read-write signer (Requires MetaMask or similar injected wallet)
 */
export const getSigner = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider.getSigner();
  }
  throw new Error("No crypto wallet found. Please install MetaMask.");
};

/**
 * Get the HoneyChain smart contract instance (Read-only)
 */
export const getContract = () => {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, HoneyChainABI.abi, provider);
};

/**
 * Get the HoneyChain smart contract instance (Read-Write)
 */
export const getContractWithSigner = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, HoneyChainABI.abi, signer);
};
