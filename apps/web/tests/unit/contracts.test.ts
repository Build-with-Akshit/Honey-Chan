import { describe, it, expect } from "vitest";
import {
  BATCH_STATUS_MAP,
  SUPPLY_CHAIN_STAGE_MAP,
  NETWORK_CONFIG,
  CONTRACT_ADDRESS,
} from "@/lib/contracts";

describe("contracts.ts", () => {
  describe("BATCH_STATUS_MAP", () => {
    it("maps all 7 batch statuses (0-6)", () => {
      expect(Object.keys(BATCH_STATUS_MAP)).toHaveLength(7);
      expect(BATCH_STATUS_MAP[0]).toBe("Created");
      expect(BATCH_STATUS_MAP[1]).toBe("Harvested");
      expect(BATCH_STATUS_MAP[2]).toBe("Processing");
      expect(BATCH_STATUS_MAP[3]).toBe("Quality Tested");
      expect(BATCH_STATUS_MAP[4]).toBe("Distributed");
      expect(BATCH_STATUS_MAP[5]).toBe("Retail");
      expect(BATCH_STATUS_MAP[6]).toBe("Completed");
    });

    it("returns undefined for unknown status codes", () => {
      expect(BATCH_STATUS_MAP[99]).toBeUndefined();
      expect(BATCH_STATUS_MAP[-1]).toBeUndefined();
    });
  });

  describe("SUPPLY_CHAIN_STAGE_MAP", () => {
    it("maps all 6 supply chain stages (0-5)", () => {
      expect(Object.keys(SUPPLY_CHAIN_STAGE_MAP)).toHaveLength(6);
      expect(SUPPLY_CHAIN_STAGE_MAP[0]).toBe("Harvest");
      expect(SUPPLY_CHAIN_STAGE_MAP[5]).toBe("Retail");
    });
  });

  describe("NETWORK_CONFIG", () => {
    it("has valid chainId", () => {
      expect(NETWORK_CONFIG.chainId).toBeGreaterThan(0);
      expect(typeof NETWORK_CONFIG.chainId).toBe("number");
    });

    it("has rpcUrl", () => {
      expect(NETWORK_CONFIG.rpcUrl).toBeTruthy();
      expect(NETWORK_CONFIG.rpcUrl).toMatch(/^https?:\/\//);
    });

    it("has matching chainIdHex", () => {
      const expected = `0x${NETWORK_CONFIG.chainId.toString(16)}`;
      expect(NETWORK_CONFIG.chainIdHex).toBe(expected);
    });
  });

  describe("CONTRACT_ADDRESS", () => {
    it("is a valid hex address or zero address", () => {
      expect(CONTRACT_ADDRESS).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });
  });
});
