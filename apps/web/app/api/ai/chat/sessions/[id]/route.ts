import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { decryptChatMessage } from "@/lib/crypto-chat";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ai/chat/sessions/[id]
 * Fetches decrypted message thread for a specific chat session.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId } = await params;

    const session = await prisma.aiChatSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    const decryptedMessages = session.messages.map((chat) => ({
      id: `chat-${chat.id}`,
      role: chat.role as "user" | "assistant",
      text: decryptChatMessage(chat.encryptedText, chat.iv, chat.tag, user.id),
      time: chat.createdAt
        ? new Date(chat.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      provider: chat.provider || undefined,
      hiveCode: chat.hiveCode,
      isEncrypted: true,
    }));

    return NextResponse.json({
      session: {
        id: session.id,
        title: session.title,
        hiveCode: session.hiveCode,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      messages: decryptedMessages,
    });
  } catch (error) {
    console.error("[Chat Session GET ID] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session messages" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ai/chat/sessions/[id]
 * Renames a chat session title.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId } = await params;
    const body = await req.json();
    const title = String(body?.title || "").trim().slice(0, 100);

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const existing = await prisma.aiChatSession.findFirst({
      where: { id: sessionId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    const updated = await prisma.aiChatSession.update({
      where: { id: sessionId },
      data: { title, updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      session: {
        id: updated.id,
        title: updated.title,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("[Chat Session PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to rename chat session" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/chat/sessions/[id]
 * Deletes a chat session and all its messages (cascade).
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId } = await params;

    const existing = await prisma.aiChatSession.findFirst({
      where: { id: sessionId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    await prisma.aiChatSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({
      success: true,
      message: "Chat session deleted successfully",
    });
  } catch (error) {
    console.error("[Chat Session DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete chat session" },
      { status: 500 }
    );
  }
}
