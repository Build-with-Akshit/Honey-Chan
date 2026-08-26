import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await requireAuth(); // Allow any authenticated user (including BEEKEEPER) to transfer
    if (errorResponse) return errorResponse;

    const params = await props.params;
    const data = await req.json();
    const { stage, location, notes, txHash, recipientWallet } = data;
    
    const batchId = params.id;

    const batch = await prisma.honeyBatch.findFirst({
      where: {
        OR: [
          { batchId: batchId },
          { id: !isNaN(Number(batchId)) ? Number(batchId) : undefined }
        ]
      }
    });

    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    // Find recipient user
    let recipientId = user!.id; // Default to sender if no recipient provided (for self-transfers or older logic)
    if (recipientWallet) {
      const recipient = await prisma.user.findFirst({
        where: { 
          walletAddress: {
            equals: recipientWallet,
            mode: 'insensitive'
          }
        }
      });
      
      if (recipient) {
        recipientId = recipient.id;
      } else {
        return NextResponse.json({ error: `No registered user found with wallet ${recipientWallet}` }, { status: 404 });
      }
    }

    const generatedTx = txHash || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    
    // Update batch status and blockchainTx (new hash)
    await prisma.honeyBatch.update({
      where: { id: batch.id },
      data: { 
        status: stage,
        blockchainTx: generatedTx
      }
    });

    // Create the Supply Chain Event associating it with the recipient!
    const newEvent = await prisma.supplyChainEvent.create({
      data: {
        batchId: batch.id,
        stage,
        location: location || "India",
        notes: notes || `Transferred to ${stage}`,
        txHash: generatedTx,
        actorId: recipientId, // Associate with recipient so they can see it
      }
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to transfer batch" }, { status: 500 });
  }
}
