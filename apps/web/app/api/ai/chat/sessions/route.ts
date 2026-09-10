import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/ai/chat/sessions
 * Returns all chat sessions for the authenticated user, ordered by most recent activity.
 */
export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.aiChatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { messages: true },
        },
      },
      take: 60,
    });

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        title: s.title,
        hiveCode: s.hiveCode,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        messageCount: s._count.messages,
      })),
    });
  } catch (error) {
    console.error("[Chat Sessions GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve chat sessions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/chat/sessions
 * Creates a new empty chat session thread for the authenticated user.
 */
export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let title = "New Agronomist Chat";
    let hiveCode = "H001";

    try {
      const body = await req.json();
      if (body?.title) title = String(body.title).trim().slice(0, 100);
      if (body?.hiveCode) hiveCode = String(body.hiveCode).trim().slice(0, 50);
    } catch {
      // Body is optional
    }

    const session = await prisma.aiChatSession.create({
      data: {
        userId: user.id,
        title,
        hiveCode,
      },
    });

    return NextResponse.json({
      session: {
        id: session.id,
        title: session.title,
        hiveCode: session.hiveCode,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: 0,
      },
    });
  } catch (error) {
    console.error("[Chat Sessions POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}
