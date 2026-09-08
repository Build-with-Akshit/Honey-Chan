import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { decryptChatMessage } from "@/lib/crypto-chat";

/**
 * GET /api/ai/chat/history
 * Fetches and decrypts the authenticated user's private chat history.
 */
export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await prisma.aiEncryptedChat.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    const decryptedMessages = chats.map((chat) => {
      const plaintext = decryptChatMessage(
        chat.encryptedText,
        chat.iv,
        chat.tag,
        user.id
      );

      return {
        id: `chat-${chat.id}`,
        role: chat.role as "user" | "assistant",
        text: plaintext,
        time: chat.createdAt
          ? new Date(chat.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        provider: chat.provider || undefined,
        hiveCode: chat.hiveCode,
        isEncrypted: true,
      };
    });

    return NextResponse.json({
      messages: decryptedMessages,
      count: decryptedMessages.length,
      encrypted: true,
      encryptionAlgorithm: "AES-256-GCM (HMAC-SHA256 User Key Derivation)",
    });
  } catch (error) {
    console.error("[Chat History GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve encrypted chat history" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/chat/history
 * Clears the authenticated user's private encrypted chat history.
 */
export async function DELETE() {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleteResult = await prisma.aiEncryptedChat.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Encrypted chat history deleted successfully",
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error("[Chat History DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete chat history" },
      { status: 500 }
    );
  }
}
