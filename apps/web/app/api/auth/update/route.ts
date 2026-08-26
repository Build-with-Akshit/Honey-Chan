import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const data = await req.json();
    const { phone } = data;

    // Currently we only allow updating phone number in the profile
    if (phone === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user!.id },
      data: { phone },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error("[Profile Update Route] Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
