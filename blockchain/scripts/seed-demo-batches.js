const hre = require("hardhat");

async function main() {
  const userAddress = hre.ethers.getAddress("0xb36465c84c124ef7bbd40952a0a5897f7d7a4ab5");
  const contractAddress = hre.ethers.getAddress("0x8a518a619fD9A9d040d1f47b9dD789420d648167");
  console.log(`Seeding demo batches on Sepolia contract: ${contractAddress}...`);

  const HoneyChain = await hre.ethers.getContractFactory("HoneyChain");
  const honeyChain = HoneyChain.attach(contractAddress);

  const demoBatches = [
    {
      id: "HC-2026-000127",
      quantity: 18500, // 18.5 kg in grams
      metadata: "Pure Mustard Flower Honey - Ganaur Apiary Sonipat",
    },
    {
      id: "HC-2026-000128",
      quantity: 30000, // 30.0 kg in grams
      metadata: "Eucalyptus Honey - Nilgiri Forest Apiary",
    }
  ];

  for (const b of demoBatches) {
    const exists = await honeyChain.doesBatchExist(b.id);
    if (exists) {
      console.log(`ℹ️ Batch ${b.id} already exists on Sepolia.`);
      continue;
    }

    console.log(`Creating batch ${b.id}...`);
    const metadataHash = hre.ethers.id(b.metadata);
    const harvestTime = Math.floor(Date.now() / 1000) - 86400 * 3; // 3 days ago

    const tx = await honeyChain.createBatch(b.id, metadataHash, b.quantity, harvestTime);
    await tx.wait();
    console.log(`✅ Batch ${b.id} created successfully on Sepolia!`);
  }

  console.log("🎉 All demo batches seeded on Sepolia!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
