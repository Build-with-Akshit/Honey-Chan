const hre = require("hardhat");

async function main() {
  const userAddress = hre.ethers.getAddress("0xb36465c84c124ef7bbd40952a0a5897f7d7a4ab5");
  const contractAddress = hre.ethers.getAddress("0x8a518a619fD9A9d040d1f47b9dD789420d648167");

  console.log(`Assigning roles to ${userAddress} on Sepolia contract ${contractAddress}...`);

  const HoneyChain = await hre.ethers.getContractFactory("HoneyChain");
  const honeyChain = HoneyChain.attach(contractAddress);

  const beekeeperRole = await honeyChain.BEEKEEPER_ROLE();
  const processorRole = await honeyChain.PROCESSOR_ROLE();
  const retailerRole = await honeyChain.RETAILER_ROLE();

  console.log("Registering BEEKEEPER_ROLE...");
  let tx = await honeyChain.registerParticipant(userAddress, beekeeperRole, "Ramesh Kumar (Beekeeper)");
  await tx.wait();
  console.log("✅ Registered as Beekeeper!");

  console.log("Registering PROCESSOR_ROLE...");
  tx = await honeyChain.registerParticipant(userAddress, processorRole, "ABC Honey Processing");
  await tx.wait();
  console.log("✅ Registered as Processor!");

  console.log("Registering RETAILER_ROLE...");
  tx = await honeyChain.registerParticipant(userAddress, retailerRole, "Fresh Mart Retail");
  await tx.wait();
  console.log("✅ Registered as Retailer!");

  console.log("🎉 All roles granted on Sepolia!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
