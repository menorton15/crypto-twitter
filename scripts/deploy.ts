import { ethers, artifacts } from "hardhat";
import { task } from "hardhat/config";

async function checkForContractChanges(): Promise<boolean> {
  const contractName = "CryptoTwitter";

  // Load the existing artifact
  const existingArtifact = await artifacts.readArtifact(contractName);

  // Compile the contract again
  const compiledArtifact = await ethers.getContractFactory(contractName);

  // Compare the bytecode of the existing and compiled artifacts
  const hasContractChanged =
    existingArtifact.bytecode !== compiledArtifact.bytecode;

  console.log(
    `Contract '${contractName}' has changed: ${String(hasContractChanged)}`
  );

  return hasContractChanged;
}

// Register a Hardhat task to check for contract changes
task("check-contract-changes", "Checks if the contract has changed").setAction(
  async function () {
    const hasContractChanged = await checkForContractChanges();

    if (hasContractChanged) {
      console.log("Redeploying the contract...");
      // Call your deployment script or function here
      await deploy();
    } else {
      console.log("No contract changes. Skipping redeployment.");
    }
  }
);

// Usage
void checkForContractChanges().then(async (hasContractChanged: boolean) => {
  if (hasContractChanged) {
    console.log("Redeploying the contract...");
    // Call your deployment script or function here
    await deploy();
  } else {
    console.log("No contract changes. Skipping redeployment.");
  }
});

async function deploy() {
  const CryptoTwitter = await ethers.getContractFactory("CryptoTwitter");

  // Start deployment, returning a promise that resolves to a contract object
  const cryptoTwitter = await CryptoTwitter.deploy();
  const response = cryptoTwitter.deploymentTransaction();

  if (!response || response === undefined)
    throw new Error("Deployment failed. No response.");

  const receipt = await response.wait(1);

  if (!receipt || receipt === undefined)
    throw new Error("Deployment failed. No receipt.");

  console.log(
    "Contract deployed to address:",
    receipt.contractAddress,
    "./nUpdate CONTRACT_ADDRESS env variables in .env files, github secrets, and vercel."
  );
}
