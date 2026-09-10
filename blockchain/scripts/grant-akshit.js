const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/alch_NjOgwXx5A-WCqKXRTXSfP");
    // Admin private key
    const wallet = new ethers.Wallet("64b11ed451d6826acd4f23a2811324b01effcbb24df115c02d7226b29686feb1", provider);
    const contractAddress = "0x6d89DBdAfABB2B26485276AE4714593f6d75fE2F";

    const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/HoneyChain.sol/HoneyChain.json", "utf8"));
    const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

    const BEEKEEPER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BEEKEEPER_ROLE"));
    const targetAddress = "0xb36465c84c124ef7bbd40952a0a5897f7d7a4ab5";

    console.log("Granting BEEKEEPER_ROLE to:", targetAddress);
    try {
        let tx = await contract.registerParticipant(targetAddress, BEEKEEPER_ROLE, "Akshit Gupta");
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("Role successfully granted on-chain to", targetAddress);
    } catch(e) { 
        console.error("Failed:", e.message || e);
    }
}

main().catch(console.error);
