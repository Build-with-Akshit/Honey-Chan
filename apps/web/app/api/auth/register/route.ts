import { login } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  try {
    const { name, email, password, role, phone } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
    }

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // Using plain text for prototype
        role,
        phone: phone || null,
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
