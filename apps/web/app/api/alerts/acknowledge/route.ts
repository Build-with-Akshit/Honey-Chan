import { NextResponse } from "next/server";
import { acknowledgeAlert, acknowledgeAllAlerts } from "@/lib/pipeline";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alertId, acknowledgeAll } = body;

    if (acknowledgeAll) {
      const count = acknowledgeAllAlerts();
      return NextResponse.json({ success: true, acknowledged: count });
    }

    if (!alertId) {
      return NextResponse.json({ error: "alertId is required" }, { status: 400 });
    }

    const success = acknowledgeAlert(alertId);
    if (!success) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Alert Acknowledge API] Error:", error);
    return NextResponse.json({ error: "Failed to acknowledge alert" }, { status: 500 });
  }
}
