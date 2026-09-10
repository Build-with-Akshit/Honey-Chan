import { NextResponse } from "next/server";
import { getAlerts, getUnacknowledgedCount } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const hiveId = url.searchParams.get("hiveId");
    const severity = url.searchParams.get("severity");
    const limit = url.searchParams.get("limit");

    const alerts = getAlerts({
      hiveId: hiveId ? Number(hiveId) : undefined,
      severity: severity || undefined,
      limit: limit ? Number(limit) : 50,
    });

    const unacknowledgedCount = getUnacknowledgedCount();

    return NextResponse.json({
      alerts,
      unacknowledgedCount,
      total: alerts.length,
    });
  } catch (error) {
    console.error("[Alerts API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
