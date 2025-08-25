import {
  budgetHookAbi,
  encryptedErc20Abi,
  frequencyHookAbi,
  koraExecutorAbi,
  mockErc20Abi,
  purchaseAmountHookAbi,
  timeframeHookAbi,
} from "../abi";

const usdcAddress = "0x55922139468662dBB05fde86cce4f08d08Db33F3";
const wethAddress = "0xFDEC6aD96E24316d9C305db3E29e977aE6b629B5";
const eUSDCAddress = "0xCEd8Cc99597E9F5A59Ab4B24253bB7F2ADcdF1A7";
const eWETHAddress = "0xd5a63Af1FCA951793519D572F485125CcDb92b3d";
const budgetHookAddress = "0x9054Af6f1FAB2975f6d148B6ff21cae1D104830C";
const purchaseAmountHookAddress = "0x83723D8bb09Ca8E05Ce4B659c99a1D44737EafA2";
const timeframeHookAddress = "0x2C2a201Ac482343393CE8d000139BE83846dffDF";
const frequencyHookAddress = "0x1C68D590D1CdB7ce071456D89529052Ce3B94C54";
const koraExecutorAddress = "0xa7fEA89845f65608eb02Ee768949Ac7C32ae83b3";

export const Contracts = {
  eUSDC: {
    abi: encryptedErc20Abi,
    address: eUSDCAddress,
  },
  eWETH: {
    abi: encryptedErc20Abi,
    address: eWETHAddress,
  },
  hooks: {
    budgetHook: {
      abi: budgetHookAbi,
      address: budgetHookAddress,
    },
    frequencyHook: {
      abi: frequencyHookAbi,
      address: frequencyHookAddress,
    },
    purchaseAmountHook: {
      abi: purchaseAmountHookAbi,
      address: purchaseAmountHookAddress,
    },
    timeframeHook: {
      abi: timeframeHookAbi,
      address: timeframeHookAddress,
    },
  },
  koraExecutor: {
    abi: koraExecutorAbi,
    address: koraExecutorAddress,
  },
  usdc: {
    abi: mockErc20Abi,
    address: usdcAddress,
  },
  weth: {
    abi: mockErc20Abi,
    address: wethAddress,
  },
} as const;
