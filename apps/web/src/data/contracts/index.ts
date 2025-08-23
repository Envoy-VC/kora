import {
  budgetHookAbi,
  encryptedErc20Abi,
  frequencyHookAbi,
  koraExecutorAbi,
  mockErc20Abi,
  purchaseAmountHookAbi,
  timeframeHookAbi,
} from "../abi";

export const Contracts = {
  eUSDC: {
    abi: encryptedErc20Abi,
    address: "0x724a39308024ECc6f78121113F14a07383522E8F",
  },
  eWETH: {
    abi: encryptedErc20Abi,
    address: "0xfEd4Ca483dAC8ed7e35294264ec466f0F4785A31",
  },
  hooks: {
    budgetHook: {
      abi: budgetHookAbi,
      address: "0xD57622C4fa83ff905c3759cE43F4a0E34f812470",
    },
    frequencyHook: {
      abi: frequencyHookAbi,
      address: "0xBd31D70F7276891D2E706E6F2502E5AB3e0d2800",
    },
    purchaseAmountHook: {
      abi: purchaseAmountHookAbi,
      address: "0x8B8d51005d88cCc1C66AfC8B613383DE519457bB",
    },
    timeframeHook: {
      abi: timeframeHookAbi,
      address: "0xd41e281ebc8060E4a996912b18e6A8905c64f462",
    },
  },
  koraExecutor: {
    abi: koraExecutorAbi,
    address: "0x8B2421509a49bAC33A3c19133F60B3187Da34514",
  },
  usdc: {
    abi: mockErc20Abi,
    address: "0x14DF2A4c1E70edad89476853a6cEC32Cb21e9300",
  },
  weth: {
    abi: mockErc20Abi,
    address: "0x36d9620916a78777Ea7c4194cAa80B97c4F1BCfA",
  },
} as const;
