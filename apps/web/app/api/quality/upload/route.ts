import { NextResponse } from "next/server";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

export async function POST(req: Request) {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return NextResponse.json({ error: "Pinata credentials missing in .env" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const batchId = formData.get("batchId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Prepare FormData for Pinata
    const pinataData = new FormData();
    pinataData.append("file", file);
    
    // Add metadata
    const pinataMetadata = JSON.stringify({
      name: `LabReport_${batchId || "unknown"}_${Date.now()}.pdf`,
    });
    pinataData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    pinataData.append("pinataOptions", pinataOptions);

    // Upload to Pinata
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: pinataData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Pinata upload failed:", errText);
      return NextResponse.json({ error: "Failed to upload to IPFS" }, { status: 500 });
    }

    const data = await res.json();
    
    return NextResponse.json({
      success: true,
      ipfsHash: data.IpfsHash,
      pinSize: data.PinSize,
      timestamp: data.Timestamp,
      url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
    });

  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
