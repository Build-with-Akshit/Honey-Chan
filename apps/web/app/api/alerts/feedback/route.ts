import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

/**
 * Alert feedback (training-data capture).
 * Beekeepers label each alert as CONFIRMED / FALSE_ALARM / TREATED.
 * These labels are the supervised dataset for future ML health models.
 */

const VALID_OUTCOMES = ["CONFIRMED", "FALSE_ALARM", "TREATED"] as const;

export async function POST(request: Request) {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body." }, { status: 400 });
    }

    const { alertKey, hiveId, outcome, note } = body as Record<string, unknown>;

    if (typeof alertKey !== "string" || alertKey.length === 0 || alertKey.length > 100) {
      return NextResponse.json({ error: "alertKey is required." }, { status: 400 });
    }
    if (typeof outcome !== "string" || !VALID_OUTCOMES.includes(outcome as (typeof VALID_OUTCOMES)[number])) {
      return NextResponse.json(
        { error: `outcome must be one of: ${VALID_OUTCOMES.join(", ")}` },
        { status: 400 }
      );
    }
    if (hiveId !== undefined && hiveId !== null && typeof hiveId !== "number") {
      return NextResponse.json({ error: "hiveId must be a number." }, { status: 400 });
    }

    // One label per alert (latest wins): update in place if it already exists.
    const existing = await prisma.alertFeedback.findFirst({
      where: { alertKey },
      orderBy: { id: "desc" },
    });

    const data = {
      outcome,
      note: typeof note === "string" ? note : null,
      hiveId: typeof hiveId === "number" ? hiveId : null,
    };

    const feedback = existing
      ? await prisma.alertFeedback.update({ where: { id: existing.id }, data })
      : await prisma.alertFeedback.create({ data: { alertKey, ...data } });

    return NextResponse.json({ message: "Feedback recorded", feedback }, { status: 201 });
  } catch (error) {
    console.error("Alert feedback error:", error);
    return NextResponse.json({ error: "Failed to record feedback." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    // Aggregate summary for model-training exports.
    const grouped = await prisma.alertFeedback.groupBy({
      by: ["outcome"],
      _count: { _all: true },
    });

    const summary: Record<string, number> = {};
    for (const g of grouped) {
      summary[g.outcome] = g._count._all;
    }

    const total = Object.values(summary).reduce((a, b) => a + b, 0);
    return NextResponse.json({ total, summary });
  } catch (error) {
    console.error("Alert feedback summary error:", error);
    return NextResponse.json({ error: "Failed to fetch summary." }, { status: 500 });
  }
}
