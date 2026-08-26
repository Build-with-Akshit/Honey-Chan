"use client";

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { HONEY_CHAIN_ABI, CONTRACT_ADDRESS, NETWORK_CONFIG } from "@/lib/contracts";

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  shortAddress: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  contract: Contract | null;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    shortAddress: null,
    chainId: null,
    isCorrectNetwork: false,
    provider: null,
    signer: null,
    contract: null,
    error: null,
  });

  const shortenAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setState((s) => ({ ...s, error: "MetaMask not found. Please install MetaMask." }));
      return;
    }

    setState((s) => ({ ...s, isConnecting: true, error: null }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const isCorrectNetwork = chainId === NETWORK_CONFIG.chainId;

      let contract: Contract | null = null;

      if (isCorrectNetwork && CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        contract = new Contract(CONTRACT_ADDRESS, HONEY_CHAIN_ABI, signer);
      }

      setState({
        isConnected: true,
        isConnecting: false,
        address: accounts[0],
        shortAddress: shortenAddress(accounts[0]),
        chainId,
        isCorrectNetwork,
        provider,
        signer,
        contract,
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection failed";
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: message.includes("rejected") ? "Connection rejected by user" : message,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      isConnecting: false,
      address: null,
      shortAddress: null,
      chainId: null,
      isCorrectNetwork: false,
      provider: null,
      signer: null,
      contract: null,
      error: null,
    });
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
      });
    } catch (switchError: unknown) {
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: NETWORK_CONFIG.chainIdHex,
                chainName: NETWORK_CONFIG.networkName,
                nativeCurrency: {
                  name: "Ether",
                  symbol: NETWORK_CONFIG.currencySymbol,
                  decimals: 18,
                },
                rpcUrls: [NETWORK_CONFIG.rpcUrl],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else {
        connect();
      }
    };

    const handleChainChanged = () => {
      connect();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    hasMetaMask: typeof window !== "undefined" && !!window.ethereum,
  };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
