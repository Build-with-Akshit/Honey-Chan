import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    // Fetch all users who have linked wallets (potential transfer recipients)
    // Exclude the current user from the list
    const users = await prisma.user.findMany({
      where: {
        walletAddress: { not: null },
        id: { not: user!.id },
      },
      select: {
        id: true,
        name: true,
        role: true,
        walletAddress: true,
      },
      orderBy: { role: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
