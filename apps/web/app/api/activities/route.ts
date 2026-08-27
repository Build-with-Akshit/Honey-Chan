import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

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
        time: timeAgo(new Date(e.timestamp)),
        icon
      };
    });

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("Activities API Error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}