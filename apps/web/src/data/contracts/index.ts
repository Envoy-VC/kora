import {
  budgetHookAbi,
  encryptedErc20Abi,
  frequencyHookAbi,
  koraExecutorAbi,
  mockErc20Abi,
  purchaseAmountHookAbi,
  timeframeHookAbi,
} from "../abi";

const usdcAddress = "0x2d83Fff32862A6FBB7518DBfEa113979B8631797";
const wethAddress = "0x0C013Aa8CfE54Af1D892759fBc35F8835Ad163F7";
const eUSDCAddress = "0xCe4Fd687fa2EFE9a04d8745753C9E364DF91De1E";
const eWETHAddress = "0xE6184Bb67cd3B797C7e36DC460c83a7A5AB87063";
const budgetHookAddress = "0x1A34059f5015362fBa4255B9ef30e884a7B142E4";
const purchaseAmountHookAddress = "0xC92e075c52F2Fe38d6389aC2b39bEE5788C341c2";
const timeframeHookAddress = "0x9dc301778C7EE60E30C7F8F89814bC5b7b3c4F41";
const frequencyHookAddress = "0xD7e7a322EaADA366C718e487FD3f2255a95C092f";
const koraExecutorAddress = "0xc82Fa85409D50De86396dCb57C08506522C33991";

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
