import { login } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ethers } from "ethers";
import bcrypt from "bcryptjs";

const DEMO_USERS_MAP: Record<
  string,
  { name: string; role: string; phone: string; walletAddress: string }
> = {
  "distributor@honeychain.in": {
    name: "Apex Logistics & Honey Distribution",
    role: "DISTRIBUTOR",
    phone: "+91 98444 55667",
    walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  },
  "wholesaler@honeychain.in": {
    name: "National Honey Wholesalers",
    role: "WHOLESALER",
    phone: "+91 98666 77889",
    walletAddress: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
  },
};

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
      const normalizedEmail = email.toLowerCase().trim();
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      // Auto-provision demo accounts on-demand if database hasn't been re-seeded
      if (!user && DEMO_USERS_MAP[normalizedEmail] && password === "password123") {
        const demoConfig = DEMO_USERS_MAP[normalizedEmail];
        const passwordHash = await bcrypt.hash("password123", 12);
        try {
          user = await prisma.user.create({
            data: {
              email: normalizedEmail,
              password: passwordHash,
              name: demoConfig.name,
              role: demoConfig.role,
              phone: demoConfig.phone,
              walletAddress: demoConfig.walletAddress,
              isVerified: true,
            },
          });
        } catch (createErr) {
          console.error("Auto-provisioning demo user failed:", createErr);
        }
      }

      // BUG-03 fix: unknown user and wrong password return the SAME 401 +
      // message so the endpoint can't be used to enumerate registered emails.
      if (!user) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      // Password check: bcrypt hash (current) with transparent plaintext
      // migration for rows not yet re-hashed (legacy demo rows).
      const isBcryptHash = user.password.startsWith("$2");
      const passwordMatches = isBcryptHash
        ? await bcrypt.compare(password, user.password)
        : user.password === password;

      if (!passwordMatches) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      // Opportunistic upgrade: re-hash legacy plaintext on successful login.
      if (!isBcryptHash) {
        const upgradedHash = await bcrypt.hash(password, 12);
        await prisma.user
          .update({ where: { id: user.id }, data: { password: upgradedHash } })
          .catch((e) => console.error("Password upgrade failed:", e));
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
