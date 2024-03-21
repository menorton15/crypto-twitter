///import { ethers } from "hardhat";

import { ethers } from "hardhat";

async function deploy() {
  const CryptoTwitter = await ethers.getContractFactory("CryptoTwitter");

  // Start deployment, returning a promise that resolves to a contract object
  const cryptoTwitter = await CryptoTwitter.deploy();
  const response = cryptoTwitter.deploymentTransaction();

  if (!response || response === undefined)
    throw new Error("Deployment failed. No response.");

  const receipt = await response.wait(1);

  console.log(receipt?.blockHash)

  if (!receipt || receipt === undefined)
    throw new Error("Deployment failed. No receipt.");

  console.log(
    "Contract deployed to address:",
    receipt.contractAddress,
    ".\nUpdate CONTRACT_ADDRESS env variables in .env files, github secrets, and vercel."
  );
}

deploy();
