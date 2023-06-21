import { ethers } from "hardhat";
import { getEnvironment } from "./env";

const { CONTRACT_ADDRESS } = getEnvironment();

export const mintNFT = async (
  createdAt: number,
  postID: string,
  content: string,
  author: string,
  parentID: string
) => {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === null)
    throw new Error("Env variable CONTRACT_ADDRESS undefined");

  const cryptoTwitter = await ethers.getContractAt(
    "CryptoTwitter",
    CONTRACT_ADDRESS
  );

  const mintTx = await cryptoTwitter.mintNFT(
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
