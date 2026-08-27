import { NextResponse } from "next/server";
import { getOnChainBatch, getOnChainHistory } from "@/lib/blockchain";

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

    return NextResponse.json({ batch, history });
  } catch (error) {
    console.error("Trace API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blockchain data." },
      { status: 500 }
    );
  }
}
