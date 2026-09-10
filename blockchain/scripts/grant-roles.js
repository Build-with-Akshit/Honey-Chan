const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/alch_NjOgwXx5A-WCqKXRTXSfP");
    const wallet = new ethers.Wallet("64b11ed451d6826acd4f23a2811324b01effcbb24df115c02d7226b29686feb1", provider);
    const contractAddress = "0x8a518a619fD9A9d040d1f47b9dD789420d648167";

    const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/HoneyChain.sol/HoneyChain.json", "utf8"));
    const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

    const RETAILER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RETAILER_ROLE"));

    const targetAddress1 = "0xa06984eae24ea3c28c795b5b94e96929a339326e";
    const targetAddress2 = "0x110da8715c0c6aa85191d9a9d040d1147b9dd789";

    console.log("Granting role to:", targetAddress1);
    try {
        let tx1 = await contract.registerParticipant(targetAddress1, RETAILER_ROLE, "Retailer");
        await tx1.wait();
        console.log("Granted to", targetAddress1);
    } catch(e) { console.error(e.message) }

    console.log("Granting role to:", targetAddress2);
    try {
        let tx2 = await contract.registerParticipant(targetAddress2, RETAILER_ROLE, "Retailer");
        await tx2.wait();
        console.log("Granted to", targetAddress2);
    } catch(e) { console.error(e.message) }
}

main().catch(console.error);
