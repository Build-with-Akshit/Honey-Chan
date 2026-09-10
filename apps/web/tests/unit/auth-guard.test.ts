import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireAuth } from "@/lib/auth-guard";

// Mock the getSession function
vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

import { getSession } from "@/lib/auth";

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const { user, errorResponse } = await requireAuth();

    expect(user).toBeNull();
    expect(errorResponse).not.toBeNull();
    expect(errorResponse!.status).toBe(401);
  });

  it("returns user when session exists and no role restriction", async () => {
    const mockUser = { id: 1, role: "BEEKEEPER", name: "Test" };
    vi.mocked(getSession).mockResolvedValue(mockUser);

    const { user, errorResponse } = await requireAuth();

    expect(user).toEqual(mockUser);
    expect(errorResponse).toBeNull();
  });

  it("allows access when user has correct role", async () => {
    const mockUser = { id: 1, role: "BEEKEEPER", name: "Test" };
    vi.mocked(getSession).mockResolvedValue(mockUser);

    const { user, errorResponse } = await requireAuth(["BEEKEEPER", "ADMIN"]);

    expect(user).toEqual(mockUser);
    expect(errorResponse).toBeNull();
  });

  it("returns 403 when user lacks required role", async () => {
    const mockUser = { id: 1, role: "RETAILER", name: "Test" };
    vi.mocked(getSession).mockResolvedValue(mockUser);

    const { user, errorResponse } = await requireAuth(["BEEKEEPER", "ADMIN"]);

    expect(user).toBeNull();
    expect(errorResponse).not.toBeNull();
    expect(errorResponse!.status).toBe(403);
  });

  it("allows any authenticated user when allowedRoles is empty", async () => {
    const mockUser = { id: 1, role: "RETAILER", name: "Test" };
    vi.mocked(getSession).mockResolvedValue(mockUser);

    const { user, errorResponse } = await requireAuth([]);

    expect(user).toEqual(mockUser);
    expect(errorResponse).toBeNull();
  });

  it("allows any authenticated user when allowedRoles is undefined", async () => {
    const mockUser = { id: 1, role: "LAB", name: "Test" };
    vi.mocked(getSession).mockResolvedValue(mockUser);

    const { user, errorResponse } = await requireAuth();

    expect(user).toEqual(mockUser);
    expect(errorResponse).toBeNull();
  });

  it("returns user with all expected fields", async () => {
    const mockUser = {
      id: 42,
      email: "test@example.com",
      name: "Test User",
      role: "ADMIN",
      phone: "+91 12345",
      walletAddress: "0xabc",
      isVerified: true,
    };
    vi.mocked(getSession).mockResolvedValue(mockUser);

    const { user } = await requireAuth();

    expect(user).toMatchObject({
      id: 42,
      email: "test@example.com",
      role: "ADMIN",
    });
  });
});
