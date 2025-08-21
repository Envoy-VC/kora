import "@fhevm/hardhat-plugin";

import { type HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";

const MNEMONIC: string = vars.get(
  "MNEMONIC",
  "test test test test test test test test test test test junk",
);

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      sepolia: vars.get("ETHERSCAN_API_KEY", ""),
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS === "true",
    excludeContracts: [],
  },

  networks: {
    anvil: {
      accounts: {
        count: 10,
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0/",
      },
      chainId: 31337,
      url: "http://localhost:8545",
    },
    hardhat: {
      accounts: {
        mnemonic: MNEMONIC,
      },
      allowUnlimitedContractSize: true,
      chainId: 31337,
    },
    sepolia: {
      accounts: {
        count: 10,
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0/",
      },
      chainId: 11155111,
      url: vars.get("SEPOLIA_RPC_URL", ""),
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./src",
    tests: "./test",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.24", // your contracts
      },
      {
        version: "0.6.6", // uniswap v2 periphery
      },
      {
        version: "0.5.16", // uniswap v2 core
      },
    ],
    settings: {
      evmVersion: "cancun",
      metadata: {
        bytecodeHash: "none",
      },
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;
