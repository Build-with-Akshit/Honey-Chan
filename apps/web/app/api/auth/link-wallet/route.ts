import { getSession, encrypt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminContract } from "@/lib/blockchain";
import { keccak256, toUtf8Bytes } from "ethers";


export async function POST(request: Request) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Check if wallet is already linked to another user
    const existingWallet = await prisma.user.findFirst({
      where: { 
        walletAddress: { equals: walletAddress, mode: "insensitive" } 
      },
    });

    if (existingWallet && existingWallet.id !== user.id) {
      return NextResponse.json(
        { error: "This wallet is already linked to another account." },
        { status: 400 }
      );
    }

    // Update user in DB
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { walletAddress },
    });

    // Auto-grant role on blockchain (Async so it doesn't block the API response)
    const mapRole = (role: string) => {
      switch (role) {
        case "BEEKEEPER": return "BEEKEEPER_ROLE";
        case "PROCESSOR": return "PROCESSOR_ROLE";
        case "LAB": return "LAB_ROLE";
        case "DISTRIBUTOR":
        case "WHOLESALER": return "DISTRIBUTOR_ROLE";
        case "RETAILER": return "RETAILER_ROLE";
        default: return null;
      }
    };

    const onChainRole = mapRole(updatedUser.role);
    if (onChainRole) {
      try {
        const contract = getAdminContract();
        const roleHash = keccak256(toUtf8Bytes(onChainRole));
        console.log(`[Auto-Grant] Granting ${onChainRole} to ${walletAddress}...`);
        
        // We do NOT await tx.wait() here to keep the API fast. It will mine in the background.
        const tx = await contract.registerParticipant(walletAddress, roleHash, updatedUser.name);
        console.log(`[Auto-Grant] Tx sent: ${tx.hash}`);
      } catch (err) {
        console.error(`[Auto-Grant] Failed to grant role to ${walletAddress}:`, err);
      }
    }

    // Update session cookie
    const { password: _, ...userWithoutPassword } = updatedUser;
    const session = await encrypt({ user: userWithoutPassword, time: new Date().getTime() });
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    (await cookies()).set("session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json(
      { message: "Wallet linked successfully", user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error("Link Wallet Error:", error);
    return NextResponse.json(
      { error: "An error occurred while linking wallet." },
      { status: 500 }
    );
  }
}
