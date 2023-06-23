import { ethers } from "hardhat";
import { expect } from "chai";
import { describe } from "mocha";
import type { CryptoTwitter } from "typechain-types/contracts/CryptoTwitter";
import { getEnvironment } from "../src/utils/env";

const { CONTRACT_ADDRESS } = getEnvironment();

describe("CryptoTwitter", function () {
  let cryptoTwitter: CryptoTwitter;

  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === undefined)
    throw new Error("No CONTRACT_ADDRESS env variable.");

  beforeEach(async function () {
    cryptoTwitter = await ethers.getContractAt("CryptoTwitter", CONTRACT_ADDRESS);
  });

  it("should mint an NFT and retrieve its data", async function () {
    const tx = await cryptoTwitter.mintNFT(
      "0xa1C6f5F8fDa50a57F3614065a8d1Ed3D8293d98b",
      1546360800,
      "1",
      "Content",
      "AuthorID",
      ""
    );
    const receipt = await tx.wait();

    if (!receipt || receipt === null)
      throw new Error("No transaction receipt.");

    const logs = receipt.logs[2];
    if (!logs || logs === null)
      throw new Error("Transaction log format invalid");

    expect(logs.topics[1]).to.not.be.undefined;

    const tokenId = logs.topics[1] as string;

    const nftData = await cryptoTwitter.getNFTData(tokenId);

    expect(nftData.id).to.equal("1");
    expect(nftData.createdAt).to.equal(1546360800);
    expect(nftData.content).to.equal("Content");
    expect(nftData.authorID).to.equal("AuthorID");
    expect(nftData.parentID).to.equal("");
  });

  it("should retrieve NFT data by ID", async function () {
    const tx = await cryptoTwitter.mintNFT(
      "0xa1C6f5F8fDa50a57F3614065a8d1Ed3D8293d98b",
      1546360800,
      "1",
      "Content",
      "AuthorID",
      ""
    );
    const receipt = await tx.wait();

    if (!receipt || receipt === null)
      throw new Error("No transaction receipt.");

    const logs = receipt.logs[2];
    if (!logs || logs === null)
      throw new Error("Transaction log format invalid");

    expect(logs.topics[1]).to.not.be.undefined;

    const tokenId = logs.topics[1] as string;

    console.log(tokenId);

    const nftData = await cryptoTwitter.getNFTData(tokenId);
    const dataByPostId: {
      id: string;
      createdAt: bigint;
      content: string;
      authorId: string;
      parentId: string;
    } = await cryptoTwitter.getDataByPostId("1");

    expect(nftData).to.deep.equal(dataByPostId);
  });
});
