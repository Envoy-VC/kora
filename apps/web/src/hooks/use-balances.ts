import { useMemo } from "react";

import nstr from "nstr";
import { zeroAddress } from "viem";
import { useAccount, useBalance, useReadContracts } from "wagmi";

import { Contracts } from "@/data/contracts";

export const useBalances = () => {
  const { address } = useAccount();
  const { data: ethBalance } = useBalance();

  const { data: tokenBalances } = useReadContracts({
    contracts: [
      {
        ...Contracts.usdc,
        args: [address ?? zeroAddress],
        functionName: "balanceOf",
      },
      {
        ...Contracts.weth,
        args: [address ?? zeroAddress],
        functionName: "balanceOf",
      },
    ],
  });

  const balances = useMemo(() => {
    const usdcBalance = tokenBalances?.[0].result ?? 0n;
    const wethBalance = tokenBalances?.[1].result ?? 0n;
    const nativeBalance = ethBalance?.value ?? 0n;

    const decimals = 18;

    return {
      native: {
        decimals,
        formatted: nstr(Number(nativeBalance) / 10 ** decimals),
        symbol: "ETH",
        value: nativeBalance,
      },
      usdc: {
        decimals,
        formatted: nstr(Number(usdcBalance) / 10 ** decimals),
        symbol: "USDC",
        value: usdcBalance,
      },
      weth: {
        decimals,
        formatted: nstr(Number(wethBalance) / 10 ** decimals),
        symbol: "WETH",
        value: wethBalance,
      },
    };
  }, [tokenBalances, ethBalance]);

  return balances;
};
