import { ethers } from "ethers";
import contractAddress from "./contractAddress.json";
// ABI from Hardhat deployment artifacts
import HoneyChainABI from "./contractABI.json"; 

export const getWeb3Provider = async () => {
  if (typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined") {
    // Request account access
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
  } else {
    throw new Error("Please install MetaMask to interact with the blockchain.");
  }
};

export const getHoneyChainContract = async (signerOrProvider: any) => {
  return new ethers.Contract(
    contractAddress.HoneyChain,
    HoneyChainABI,
    signerOrProvider
  );
};

export const createBlockchainBatch = async (
  batchId: string, 
  metadataHash: string, 
  quantity: number, 
  harvestTimestamp: number
) => {
  const { signer } = await getWeb3Provider();
  const contract = await getHoneyChainContract(signer);
  
  // quantity in grams
  const tx = await contract.createBatch(
    batchId,
    ethers.encodeBytes32String(metadataHash.substring(0, 31)), // Ensure it fits bytes32
    quantity,
    harvestTimestamp
  );
  
  await tx.wait();
  return tx.hash;
};

export const submitLabQualityTest = async (
  batchId: string,
  reportHash: string,
  passed: boolean
) => {
  const { signer } = await getWeb3Provider();
  const contract = await getHoneyChainContract(signer);
  
  const tx = await contract.submitQualityTest(
    batchId,
    ethers.encodeBytes32String(reportHash.substring(0, 31)),
    passed
  );
  
  await tx.wait();
  return tx.hash;
};
