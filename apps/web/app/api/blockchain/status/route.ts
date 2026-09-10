import { NextResponse } from "next/server";
import { isBlockchainReachable } from "@/lib/blockchain";
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from "@/lib/contracts";

export const dynamic = "force-dynamic";

let _lastCheck: { reachable: boolean; timestamp: number } | null = null;
const CACHE_TTL = 15_000; // 15 seconds

export async function GET() {
  try {
    const now = Date.now();

    // Use cached result if fresh
    if (_lastCheck && now - _lastCheck.timestamp < CACHE_TTL) {
      return NextResponse.json({
        reachable: _lastCheck.reachable,
        cached: true,
        contractAddress: CONTRACT_ADDRESS,
        network: NETWORK_CONFIG.networkName,
        rpcUrl: NETWORK_CONFIG.rpcUrl,
        chainId: NETWORK_CONFIG.chainId,
      });
    }

    const reachable = await isBlockchainReachable();
    _lastCheck = { reachable, timestamp: now };

    return NextResponse.json({
      reachable,
      cached: false,
      contractAddress: CONTRACT_ADDRESS,
      network: NETWORK_CONFIG.networkName,
      rpcUrl: NETWORK_CONFIG.rpcUrl,
      chainId: NETWORK_CONFIG.chainId,
      mode: reachable ? "on-chain" : "db-only",
    });
  } catch (error) {
    return NextResponse.json({
      reachable: false,
      cached: false,
      error: "Health check failed",
      contractAddress: CONTRACT_ADDRESS,
      network: NETWORK_CONFIG.networkName,
      mode: "db-only",
    });
  }
}
