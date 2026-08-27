import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { formatDistanceToNow } from "date-fns";

export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth(["ADMIN"]);
    if (errorResponse) return errorResponse;

    const events = await prisma.supplyChainEvent.findMany({
      take: 5,
      orderBy: { timestamp: "desc" },
      include: {
        batch: { select: { batchId: true } },
        actor: { select: { name: true, role: true } }
      }
    });

    const formattedEvents = events.map(e => {
      let icon = "📋";
      if (e.stage === "COMPLETED") icon = "✅";
      if (e.stage === "QUALITY_TESTED") icon = "🧪";
      if (e.stage === "HARVESTED") icon = "🍯";

      return {
        action: `Batch ${e.batch.batchId} - ${e.stage.replace("_", " ")}`,
        actor: e.actor.name,
        time: formatDistanceToNow(new Date(e.timestamp), { addSuffix: true }),
        icon
      };
    });

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("Activities API Error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}