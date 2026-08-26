import { login } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please register first." },
        { status: 404 }
      );
    }

    // In a real app, you would hash the password and compare it.
    // For this prototype, we're doing a plain text check since the seed uses plain text.
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Don't put the password in the JWT session
    const { password: _, ...userWithoutPassword } = user;

    await login(userWithoutPassword);

    return NextResponse.json(
      { message: "Login successful", user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "An error occurred during login." },
      { status: 500 }
    );
  }
}
