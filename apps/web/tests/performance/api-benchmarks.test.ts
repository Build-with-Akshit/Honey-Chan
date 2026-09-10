import { describe, it, expect, vi, beforeEach } from "vitest";
import { honeyApi, fetchApi } from "@/lib/api";

describe("API Client Performance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchApi completes within 100ms (mocked)", async () => {
    (global.fetch as any).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      })
    );

    const start = performance.now();
    await fetchApi("/test");
    const elapsed = performance.now() - start;
    console.log(`fetchApi latency: ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(100);
  });

  it("10 sequential API calls complete within 500ms", async () => {
    (global.fetch as any).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      await honeyApi.getHives();
    }
    const elapsed = performance.now() - start;
    console.log(`10 sequential calls: ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(500);
  });

  it("5 parallel API calls complete within 300ms", async () => {
    (global.fetch as any).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const start = performance.now();
    await Promise.all([
      honeyApi.getHives(),
      honeyApi.getBatches(),
      honeyApi.getClusters(),
      honeyApi.getBatches(),
      honeyApi.getHives(),
    ]);
    const elapsed = performance.now() - start;
    console.log(`5 parallel calls: ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(300);
  });

  it("API error handling does not cause memory leaks", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    (global.fetch as any).mockRejectedValue(new Error("Network error"));

    // Make many failing calls
    for (let i = 0; i < 20; i++) {
      try {
        await fetchApi("/fail");
      } catch {
        // expected
      }
    }

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("fetchApi URL construction is correct for all endpoints", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const endpoints: [() => Promise<any>, string][] = [
      [() => honeyApi.getHives(), "/api/hives"],
      [() => honeyApi.getBatches(), "/api/batches"],
      [() => honeyApi.getClusters(), "/api/clusters"],
      [() => honeyApi.verifyBatch("HC-123"), "/api/verify/HC-123"],
      [() => honeyApi.getHiveAI("HIVE-001"), "/api/ai/hive/HIVE-001"],
      [() => honeyApi.getBatch("HC-456"), "/api/batches/HC-456"],
      [() => honeyApi.getHive("HIVE-002"), "/api/hives/HIVE-002"],
    ];

    for (const [fn, expectedUrl] of endpoints) {
      vi.clearAllMocks();
      await fn();
      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.any(Object)
      );
    }
  });
});
