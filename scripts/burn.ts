/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ethers } from "hardhat";
import { getEnvironment } from "../src/utils/env";

const { CONTRACT_ADDRESS } = getEnvironment();

async function test() {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === undefined)
    throw new Error("No contract address.");
  const cryptoTwitter = await ethers.getContractAt(
    "CryptoTwitter",
    CONTRACT_ADDRESS
  );

  const mintTx = await cryptoTwitter.burn(3);
  const response = await mintTx.wait();
  
  console.log(response);
}

test().catch((err) => console.log(err));
