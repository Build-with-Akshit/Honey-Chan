const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying HoneyChain...");

  // Get the contract factory
  const HoneyChain = await hre.ethers.getContractFactory("HoneyChain");

  // Deploy the contract
  const honeyChain = await HoneyChain.deploy();
  await honeyChain.waitForDeployment();

  const contractAddress = await honeyChain.getAddress();
  console.log("HoneyChain deployed to:", contractAddress);

  // Export the ABI and Contract Address for the Next.js frontend
  const frontendLibDir = path.join(__dirname, "..", "..", "apps", "web", "lib");
  
  if (!fs.existsSync(frontendLibDir)) {
    fs.mkdirSync(frontendLibDir, { recursive: true });
  }

  // Save the address
  const addressConfig = { HoneyChain: contractAddress };
  fs.writeFileSync(
    path.join(frontendLibDir, "contractAddress.json"),
    JSON.stringify(addressConfig, null, 2)
  );

  // Save the ABI
  const artifact = await hre.artifacts.readArtifact("HoneyChain");
  fs.writeFileSync(
    path.join(frontendLibDir, "contractABI.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  console.log("✅ ABI and Contract Address exported to apps/web/lib/");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
