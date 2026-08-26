const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🍯 Deploying HoneyChain Smart Contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy HoneyChain
  const HoneyChain = await hre.ethers.getContractFactory("HoneyChain");
  const honeyChain = await HoneyChain.deploy();
  await honeyChain.waitForDeployment();

  const contractAddress = await honeyChain.getAddress();
  console.log("✅ HoneyChain deployed to:", contractAddress);

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());

  // Verify admin role
  const adminRole = await honeyChain.DEFAULT_ADMIN_ROLE();
  const isAdmin = await honeyChain.hasRole(adminRole, deployer.address);
  console.log("Admin role verified:", isAdmin);

  // Export deployment info
  const deploymentInfo = {
    contractAddress,
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: (await hre.ethers.provider.getBlockNumber()),
  };

  // Save to deployment file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Export ABI
  const artifact = await hre.artifacts.readArtifact("HoneyChain");
  fs.writeFileSync(
    path.join(deploymentsDir, "HoneyChain.json"),
    JSON.stringify({
      address: contractAddress,
      abi: artifact.abi,
    }, null, 2)
  );

  console.log("\n📦 Deployment info saved to: blockchain/deployments/");
  console.log("📦 Contract ABI saved to: blockchain/deployments/HoneyChain.json");

  console.log("\n─────────────────────────────────────────");
  console.log("🍯 HONEY CHAIN DEPLOYMENT SUMMARY");
  console.log("─────────────────────────────────────────");
  console.log(`Contract Address : ${contractAddress}`);
  console.log(`Network          : ${network.name}`);
  console.log(`Chain ID         : ${network.chainId}`);
  console.log(`Deployer         : ${deployer.address}`);
  console.log(`Admin Role       : ${isAdmin ? '✅ Granted' : '❌ Missing'}`);
  console.log("─────────────────────────────────────────\n");

  // Setup demo accounts if on local network
  if (network.chainId === 1337n || network.chainId === 31337n) {
    console.log("🔧 Setting up demo participants...\n");

    const signers = await hre.ethers.getSigners();

    if (signers.length >= 6) {
      const roles = [
        { signer: signers[1], role: await honeyChain.BEEKEEPER_ROLE(), name: "Ramesh Kumar (Beekeeper)" },
        { signer: signers[2], role: await honeyChain.PROCESSOR_ROLE(), name: "ABC Honey Processing" },
        { signer: signers[3], role: await honeyChain.LAB_ROLE(), name: "Quality Testing Lab" },
        { signer: signers[4], role: await honeyChain.DISTRIBUTOR_ROLE(), name: "Honey Distributors Ltd" },
        { signer: signers[5], role: await honeyChain.RETAILER_ROLE(), name: "Fresh Mart Retail" },
      ];

      for (const { signer, role, name } of roles) {
        const tx = await honeyChain.registerParticipant(signer.address, role, name);
        await tx.wait();
        console.log(`  ✅ Registered: ${name}`);
        console.log(`     Address: ${signer.address}`);
      }

      // Save demo accounts
      const demoAccounts = {
        admin: { address: deployer.address, name: "Admin" },
        ...Object.fromEntries(roles.map((r, i) => [
          ["beekeeper", "processor", "lab", "distributor", "retailer"][i],
          { address: r.signer.address, name: r.name }
        ]))
      };

      fs.writeFileSync(
        path.join(deploymentsDir, "demo-accounts.json"),
        JSON.stringify(demoAccounts, null, 2)
      );

      console.log("\n📦 Demo accounts saved to: blockchain/deployments/demo-accounts.json");
    }
  }

  console.log("\n🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
