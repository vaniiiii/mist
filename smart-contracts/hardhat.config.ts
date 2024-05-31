import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-foundry";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "shanghai",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    // npx hardhat verify --network networkName {contractAddress} [{constructor arguments}]
    apiKey:
      process.env.ETHERSCAN_API_KEY !== undefined
        ? process.env.ETHERSCAN_API_KEY
        : "",
  },
  sourcify: {
    enabled: true,
  },
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        url:
          process.env.BASE_URL || "https://developer-access-mainnet.base.org",
      },
    },
    base_sepolia: {
      url: process.env.BASE_SEPOLIA_URL || "https://sepolia.base.org",
      chainId: 84532,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    base: {
      chainId: 8453,
      url: "https://developer-access-mainnet.base.org",
      accounts:
        process.env.DEPLOYER_PRIVATE_KEY !== undefined
          ? [process.env.DEPLOYER_PRIVATE_KEY]
          : [],
    },
  },
};

export default config;
