import { type InterfaceAbi, ethers } from "ethers";
import { getEnvironment } from "./env";

const { CONTRACT_ADDRESS, PRIVATE_KEY, NETWORK } = getEnvironment();

let NETWORK_URL: string;

if (NETWORK === "goerli") {
  NETWORK_URL = "https://ethereum-goerli.publicnode.com";
} else if (NETWORK === "sepolia") {
  NETWORK_URL = "https://rpc.sepolia.org";
} else {
  NETWORK_URL = "http://127.0.0.1:7545";
}

console.log(NETWORK);
import fs from "fs";
import path from "path";
import { type CryptoTwitter } from "typechain-types";

interface ContractArtifact {
  abi: InterfaceAbi;
  // Other fields in the artifact if needed
}

export const getContractAbi = (): InterfaceAbi => {
  // Assuming your contract's JSON artifact is stored in the artifacts directory
  const contractArtifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "CryptoTwitter.sol",
    "CryptoTwitter.json"
  );
  const contractArtifact = JSON.parse(
    fs.readFileSync(contractArtifactPath, "utf-8")
  ) as ContractArtifact;
  const contractAbi = contractArtifact.abi;
  return contractAbi;
};

// Usage example
const contractAbi = getContractAbi();

export const mintPostNFT = async (
  address: string,
  createdAt: number,
  postID: string,
  content: string,
  author: string,
  parentID: string
) => {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === null)
    throw new Error("Env variable CONTRACT_ADDRESS undefined");
  if (!PRIVATE_KEY || PRIVATE_KEY === null)
    throw new Error("Env variable PRIVATE_KEY undefined");

  if (!NETWORK || NETWORK === null)
    throw new Error("Env variable NETWORK undefined");

  // Create a provider based on the RPC URL
  const provider = new ethers.JsonRpcProvider(NETWORK_URL);

  // Create a wallet instance using the private key and the provider
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Connect the wallet to the contract using the contract address
  const cryptoTwitter = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractAbi,
    wallet
  ) as unknown as CryptoTwitter;

  const mintTx = await cryptoTwitter.mintNFT(
    address,
    createdAt,
    postID,
    content,
    author,
    parentID
  );
  const response = await mintTx.wait();

  if (!response || response === null) throw new Error("Transaction failed");

  const logs = response.logs[2];
  if (!logs || logs === null) throw new Error("Transaction log format invalid");

  console.log("Token ", logs.topics[1], " minted.");
};
