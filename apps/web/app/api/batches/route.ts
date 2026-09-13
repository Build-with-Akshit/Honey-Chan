import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

/** Serialized jar codes: 8-char alphanumeric secret, unambiguous when printed. */
function jarSecret(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I/L/O/0/1 lookalikes
  const bytes = randomBytes(8);
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[bytes[i] % alphabet.length];
  return s;
}

export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    // Role-based filtering:
    // 1. BEEKEEPER: Sees only batches they harvested
    // 2. ADMIN: Sees all batches
    // 3. SUPPLY CHAIN (Processor, Lab, Distributor, Retailer, Wholesaler): Sees batches where they are the current custodian or involved in the events
    let whereClause = {};
    if (user!.role === "BEEKEEPER") {
      whereClause = { beekeeperId: user!.id };
    } else if (user!.role === "ADMIN") {
      whereClause = {};
    } else {
      // Supply chain roles: batches they own or interacted with
      whereClause = {
        OR: [
          { events: { some: { actorId: user!.id } } },
          { beekeeperId: user!.id }
        ]
      };
    }

    const batches = await prisma.honeyBatch.findMany({
      where: whereClause,
      include: {
        hive: true,
        hives: { include: { hive: true } },
        beekeeper: true,
        events: {
          orderBy: { timestamp: "asc" },
          include: { actor: { select: { id: true, name: true, role: true } } }
        },
        qualityTests: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(batches);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(["BEEKEEPER", "ADMIN"]);
    if (errorResponse) return errorResponse;

    const data = await req.json();
    const {
      batchId,
      hiveId,
      hiveIds,          // NEW: multi-hive harvest (array of hive ids or codes)
      honeyType,
      quantityKg,
      harvestDate,
      originLocation,
      notes,
      blockchainTx,
      txHash,
      metadataHash,
      jarSizeKg,         // optional: kg per jar (default 0.5)
      idempotencyKey,    // offline outbox flush — dedupes replayed submissions
    } = data;

    if (!batchId || !quantityKg) {
      return NextResponse.json({ error: "batchId and quantityKg are required" }, { status: 400 });
    }

    // Idempotency: an offline-queued harvest replays with the same key after
    // the first flush succeeded; return the existing batch instead of 500/dupe.
    if (typeof idempotencyKey === "string" && idempotencyKey.length > 0) {
      const existing = await prisma.honeyBatch.findFirst({
        where: { batchId, beekeeperId: user!.id },
        select: { id: true, batchId: true },
      });
      if (existing) {
        return NextResponse.json({ ...existing, deduped: true }, { status: 200 });
      }
    }

    // ── Resolve the hive set ─────────────────────────────────────────
    // Accepts hiveIds: number[] (ids) or string[] (codes), plus the legacy
    // single hiveId/hiveCode. Deduplicates; falls back to legacy lookup.
    const idFilter: number[] = [];
    const codeFilter: string[] = [];
    const rawHiveList = Array.isArray(hiveIds) ? hiveIds : [];
    for (const h of rawHiveList) {
      if (typeof h === "number") idFilter.push(h);
      else if (typeof h === "string" && h.length > 0) codeFilter.push(h);
    }

    const resolvedHives: { id: number; hiveCode: string; location: string | null; flowerSource: string | null; beekeeperId: number | null }[] = [];

    if (idFilter.length > 0 || codeFilter.length > 0) {
      const found = await prisma.hive.findMany({
        where: { OR: [
          ...(idFilter.length > 0 ? [{ id: { in: idFilter } }] : []),
          ...(codeFilter.length > 0 ? [{ hiveCode: { in: codeFilter } }] : []),
        ] },
      });
      resolvedHives.push(...found);
    }

    // Legacy single-hive path (also the fallback when hiveIds is absent)
    if (resolvedHives.length === 0) {
      const targetCode = data.hiveCode || (typeof hiveId === "string" ? hiveId : "HIVE-007");
      let hive = await prisma.hive.findFirst({
        where: {
          OR: [
            { id: typeof hiveId === 'number' ? hiveId : undefined },
            { hiveCode: targetCode }
          ]
        },
      });

      if (!hive) {
        // Auto-create hive if not found in database to prevent blocking batch creation
        hive = await prisma.hive.create({
          data: {
            hiveCode: targetCode,
            location: originLocation || "Ganaur Apiary, Sonipat, Haryana",
            flowerSource: honeyType || "Mustard Flower",
            beekeeperId: user?.id,
            status: "ACTIVE"
          },
        });
      }
      resolvedHives.push(hive);
    }

    const primaryHive = resolvedHives[0];
    const hashVersion = resolvedHives.length > 1 ? 2 : 1;

    // Use the authenticated user's ID as the beekeeper
    const beekeeperId = user!.role === "ADMIN" ? (primaryHive.beekeeperId || user!.id) : user!.id;

    const newBatch = await prisma.honeyBatch.create({
      data: {
        batchId,
        hiveId: primaryHive.id,
        hashVersion,
        beekeeperId: beekeeperId,
        honeyType: honeyType || primaryHive.flowerSource,
        quantity: Number(quantityKg),
        harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
        location: originLocation || primaryHive.location,
        notes,
        metadataHash: metadataHash || null,
        blockchainTx: txHash || blockchainTx || null,
        status: "HARVESTED",
        hives: resolvedHives.length > 1
          ? { create: resolvedHives.map((h) => ({ hiveId: h.id })) }
          : undefined,
        events: {
          create: {
            stage: "HARVEST",
            actorId: beekeeperId,
            location: originLocation || primaryHive.location,
            notes: notes || "Batch created via Honey Chain Web3 Portal",
            txHash: txHash || blockchainTx || null,
          }
        }
      },
      include: {
        hive: true,
        hives: { include: { hive: true } },
        beekeeper: true,
        events: true,
      }
    });

    // ── Serialized jar units (anti-photocopy) ────────────────────────
    // Each physical jar gets a row with a printed secret. Quantity jars at
    // jarSizeKg each; capped to keep insert sane for demo-scale batches.
    const size = Number(jarSizeKg) > 0 ? Number(jarSizeKg) : 0.5;
    const jarCount = Math.min(Math.max(Math.ceil(Number(quantityKg) / size), 1), 500);
    const jarData = Array.from({ length: jarCount }, (_, i) => ({
      batchId: newBatch.id,
      serial: String(i + 1).padStart(4, "0"),
      secret: jarSecret(),
    }));
    await prisma.jarUnit.createMany({ data: jarData });

    return NextResponse.json(
      {
        ...newBatch,
        jarCount,
        jars: jarData.map((j) => ({ serial: j.serial, secret: j.secret })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 });
  }
}
