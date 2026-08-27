import { login } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { ethers } from "ethers";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

      // 2. Find user by wallet address
      user = await prisma.user.findUnique({
        where: { walletAddress },
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

      if (!user) {
        return NextResponse.json(
          { error: "User not found. Please register first." },
          { status: 404 }
        );
      }

      // In a real app, hash and compare. Plaintext used here for demo seeding.
      if (user.password !== password) {
        return NextResponse.json(
          { error: "Invalid credentials." },
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
