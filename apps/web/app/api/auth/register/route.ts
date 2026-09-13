import { login } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/**
 * Public registration: BEEKEEPER only (role whitelist).
 * ADMIN/LAB/supply-chain accounts are created by an admin via seed/tooling,
 * never through this public endpoint.
 */
const PUBLIC_ROLE = "BEEKEEPER" as const;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const { name, email, password, phone } = body as Record<string, unknown>;

    // Type/shape validation — malformed bodies must 400, not 500.
    if (
      typeof name !== "string" || name.trim().length === 0 ||
      typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== "string" || password.length < 6
    ) {
      return NextResponse.json(
        { error: "Valid name, email and a password of at least 6 characters are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
    }

    // Hash the password — plaintext is never stored.
    const passwordHash = await bcrypt.hash(password, 12);

    // Create the new user (role forced to BEEKEEPER regardless of input)
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: passwordHash,
        role: PUBLIC_ROLE,
        phone: typeof phone === "string" && phone.length > 0 ? phone : null,
        isVerified: false, // New users start as unverified
      },
    });

    // Don't put the password in the JWT session
    const { password: _, ...userWithoutPassword } = newUser;

    // Immediately log them in
    await login(userWithoutPassword);

    return NextResponse.json(
      { message: "Registration successful", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration." },
      { status: 500 }
    );
  }
}
