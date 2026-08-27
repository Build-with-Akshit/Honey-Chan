import { NextResponse } from "next/server";
import { getOnChainBatch, getOnChainHistory } from "@/lib/blockchain";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const { batchId } = await params;
    const decodedBatchId = decodeURIComponent(batchId);

    const batch = await getOnChainBatch(decodedBatchId);
    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found on the blockchain." },
        { status: 404 }
      );
    }

    const history = await getOnChainHistory(decodedBatchId);

    // --- Anti-Counterfeit (QR Scan Tracking) ---
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";
    let anomalyWarning = false;

    // Find the internal DB ID for this batch
    const dbBatch = await prisma.honeyBatch.findUnique({
      where: { batchId: decodedBatchId }
    });

    if (dbBatch) {
      // Record this scan
      await prisma.qRScan.create({
        data: {
          batchId: dbBatch.id,
          ipAddress: ip,
          userAgent: userAgent,
          location: "Location fetched via IP" // Mock location
        }
      });

      // Detect Anomaly: Check how many distinct IPs scanned this batch today
      const recentScans = await prisma.qRScan.findMany({
        where: {
          batchId: dbBatch.id,
          scannedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // last 24h
        },
        select: { ipAddress: true }
      });

      const uniqueIps = new Set(recentScans.map(s => s.ipAddress));
      if (uniqueIps.size > 3) {
        anomalyWarning = true;
      }
    }

    return NextResponse.json({ batch, history, anomalyWarning });
  } catch (error) {
    console.error("Trace API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blockchain data." },
      { status: 500 }
    );
  }
}

