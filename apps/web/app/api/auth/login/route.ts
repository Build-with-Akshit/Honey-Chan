import { login } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ethers } from "ethers";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    // BUG-03 fix: validate types — malformed bodies must 400, not 500.
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      (body.email !== undefined && typeof body.email !== "string") ||
      (body.password !== undefined && typeof body.password !== "string")
    ) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }
    const { email, password, walletAddress, signature, message } = body;

    let user;

    // --- Web3 MetaMask Auth Flow ---
    if (walletAddress && signature && message) {
      // 1. Verify the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return NextResponse.json(
          { error: "Invalid signature. Authentication failed." },
          { status: 401 }
        );
      }

      // 2. Find user by wallet address (case-insensitive to handle checksummed addresses)
      user = await prisma.user.findFirst({
        where: { 
          walletAddress: { equals: walletAddress, mode: "insensitive" } 
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Wallet not registered. Please register first." },
          { status: 404 }
        );
      }
    } 
    // --- Legacy Email/Password Flow (Demo Fallback) ---
    else if (email && password) {
      user = await prisma.user.findUnique({
        where: { email },
      });

      // BUG-03 fix: unknown user and wrong password return the SAME 401 +
      // message so the endpoint can't be used to enumerate registered emails.
      if (!user || user.password !== password) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Missing authentication parameters." },
        { status: 400 }
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
