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
    address: "0x37d4Bc2055E64b26075e78203913Fe9f6A73A5d4",
  },
  eWETH: {
    abi: encryptedErc20Abi,
    address: "0x316f85C3BDEf380E5ab5d862dB7aE5C42cC1D0EB",
  },
  hooks: {
    budgetHook: {
      abi: budgetHookAbi,
      address: "0x82c7d0b43E24628eC384bc114Fe94724fb073C5B",
    },
    frequencyHook: {
      abi: frequencyHookAbi,
      address: "0xce27ADed623Ee8e44caC94B756f21f9A22A76644",
    },
    purchaseAmountHook: {
      abi: purchaseAmountHookAbi,
      address: "0x15853FB2Fb81692b1c77bd507037F78c9c9ceC1B",
    },
    timeframeHook: {
      abi: timeframeHookAbi,
      address: "0x353F6092125a5a59f25BD0baB968fd20e1959D4C",
    },
  },
  koraExecutor: {
    abi: koraExecutorAbi,
    address: "0xEc73EC81e4F8c103CFb7173d3aF2eF41486D256b",
  },
  usdc: {
    abi: mockErc20Abi,
    address: "0xFC9393e786cBb8AC48656C02B4cF975D897cf28D",
  },
  weth: {
    abi: mockErc20Abi,
    address: "0x2104fDa9Ec764D228323814b4EAfAed17c471E26",
  },
} as const;
