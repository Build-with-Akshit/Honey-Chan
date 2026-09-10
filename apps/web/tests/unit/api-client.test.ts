import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchApi, honeyApi } from "@/lib/api";

describe("fetchApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("makes a GET request with correct URL", async () => {
    const mockData = { success: true };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchApi("/test-endpoint");
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/test-endpoint",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("throws on non-OK response", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: () => Promise.resolve({}),
    });

    await expect(fetchApi("/missing")).rejects.toThrow("API Error: 404");
  });

  it("passes custom headers", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await fetchApi("/test", {
      headers: { Authorization: "Bearer token123" },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token123",
          "Content-Type": "application/json",
        }),
      })
    );
  });
});

describe("honeyApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getHives calls GET /hives", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await honeyApi.getHives();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/hives",
      expect.any(Object)
    );
  });

  it("getBatches calls GET /batches", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await honeyApi.getBatches();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/^\/api\/batches/),
      expect.any(Object)
    );
  });

  it("createBatch calls POST /batches with data", async () => {
    const batchData = { batchId: "HC-2026-999999", quantityKg: "18.5" };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    });

    await honeyApi.createBatch(batchData);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/batches",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(batchData),
      })
    );
  });

  it("verifyBatch calls GET /verify/:batchId", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ verified: true }),
    });

    await honeyApi.verifyBatch("HC-2026-000127");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/verify/HC-2026-000127",
      expect.any(Object)
    );
  });

  it("tamperBatch calls POST /batches/:id/tamper", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await honeyApi.tamperBatch("HC-2026-000127");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/batches/HC-2026-000127/tamper",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("getHiveAI calls GET /ai/hive/:id", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ health_score: 91 }),
    });

    const result = await honeyApi.getHiveAI("HIVE-007");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/ai/hive/HIVE-007",
      expect.any(Object)
    );
    expect(result.health_score).toBe(91);
  });

  it("getClusters calls GET /clusters", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await honeyApi.getClusters();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/clusters",
      expect.any(Object)
    );
  });
});
