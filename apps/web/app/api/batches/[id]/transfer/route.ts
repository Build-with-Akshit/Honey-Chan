import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const params = await props.params;
    const data = await req.json();
    // action can be 'INITIATE', 'ACCEPT', 'REJECT'
    const { stage, location, notes, txHash, recipientWallet, action } = data;
    
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

    const generatedTx = txHash || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    if (action === 'INITIATE') {
      // Find recipient user
      let recipientId = null;
      if (recipientWallet) {
        const recipient = await prisma.user.findFirst({
          where: { walletAddress: { equals: recipientWallet, mode: 'insensitive' } }
        });
        if (recipient) recipientId = recipient.id;
        else return NextResponse.json({ error: `No registered user found with wallet ${recipientWallet}` }, { status: 404 });
      }

      // We just log an event so it appears in the recipient's dashboard
      await prisma.supplyChainEvent.create({
        data: {
          batchId: batch.id,
          stage: "PENDING_TRANSFER",
          location: location || "Pending Accept",
          notes: notes || `Transfer initiated to ${stage}`,
          txHash: generatedTx,
          actorId: recipientId, // Associate with recipient so they see it
        }
      });
      return NextResponse.json({ success: true, message: "Transfer initiated" });

    } else if (action === 'ACCEPT') {
      // Complete the transfer
      await prisma.honeyBatch.update({
        where: { id: batch.id },
        data: { 
          status: stage,
          blockchainTx: generatedTx
        }
      });

      const newEvent = await prisma.supplyChainEvent.create({
        data: {
          batchId: batch.id,
          stage,
          location: location || "Accepted Transfer",
          notes: notes || `Transfer accepted by ${user!.name}`,
          txHash: generatedTx,
          actorId: user!.id,
        }
      });
      return NextResponse.json({ success: true, event: newEvent });

    } else if (action === 'REJECT') {
      // Just log the rejection
      await prisma.supplyChainEvent.create({
        data: {
          batchId: batch.id,
          stage: "TRANSFER_REJECTED",
          location: location || "Rejected",
          notes: notes || `Transfer rejected by ${user!.name}`,
          txHash: generatedTx,
          actorId: user!.id,
        }
      });
      return NextResponse.json({ success: true, message: "Transfer rejected" });

    } else {
      // Fallback for old transfer mechanism
      let recipientId = user!.id;
      if (recipientWallet) {
        const recipient = await prisma.user.findFirst({
          where: { walletAddress: { equals: recipientWallet, mode: 'insensitive' } }
        });
        if (recipient) recipientId = recipient.id;
      }
      
      await prisma.honeyBatch.update({
        where: { id: batch.id },
        data: { status: stage, blockchainTx: generatedTx }
      });

      const newEvent = await prisma.supplyChainEvent.create({
        data: {
          batchId: batch.id,
          stage,
          location: location || "India",
          notes: notes || `Transferred to ${stage}`,
          txHash: generatedTx,
          actorId: recipientId,
        }
      });

      return NextResponse.json({ success: true, event: newEvent });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to process transfer" }, { status: 500 });
  }
}
