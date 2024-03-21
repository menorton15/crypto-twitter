import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { getEnvironment } from "./src/utils/env";
import "@nomicfoundation/hardhat-ethers";

const { PRIVATE_KEY, NETWORK } = getEnvironment();

if (!PRIVATE_KEY) throw new Error("private key not configured");

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: NETWORK,
  networks: {
    hardhat: {},
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      url: "https://rpc.sepolia.org",
      accounts: [PRIVATE_KEY],
    },
    goerli: {
      url: "https://ethereum-goerli.publicnode.com",
      accounts: [PRIVATE_KEY],
    },
  },
  paths: {
    artifacts: "./artifacts",
  },
};

export default config;
