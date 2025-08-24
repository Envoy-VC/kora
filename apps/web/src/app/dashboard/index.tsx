import { useMemo, useState } from "react";

import { cn } from "@kora/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { AlignHorizontalDistributeCenter, RotateCcwIcon } from "lucide-react";
import { useAccount } from "wagmi";

import { StrategiesTable } from "@/components";
import { api } from "@/convex/_generated/api";
import { useFhevm } from "@/hooks";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { address } = useAccount();
  const { getUserEncryptedBalance, getEncryptedTokenBalance } = useFhevm();

  const balances = useMemo(() => {
    return {
      eUSDC: getUserEncryptedBalance("eUSDC"),
      eWETH: getUserEncryptedBalance("eWETH"),
    };
  }, [getUserEncryptedBalance]);

  const strategies = useQuery(api.functions.strategy.getStrategiesForUser, {
    userAddress: address,
  });

  const [isUSDCRefreshing, setIsUSDCRefreshing] = useState(false);
  const [isWETHRefreshing, setIsWETHRefreshing] = useState(false);

  return (
    <div className="space-y-6 px-4">
      <div className="flex w-full flex-row items-center gap-4 rounded-2xl border bg-[#09090B] p-5">
        <div className=" flex h-32 w-full max-w-xs items-center justify-between rounded-xl border bg-[#0f0f0f] p-4">
          <div className="flex flex-col gap-2">
            <div className="text-2xl">{strategies?.length ?? 0}</div>
            <div className="text-neutral-500">Total Strategies</div>
          </div>
          <AlignHorizontalDistributeCenter className="text-neutral-300" />
        </div>
        <div className=" flex h-32 w-full max-w-xs items-center justify-between rounded-xl border bg-[#0f0f0f] p-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
              <div className="text-2xl">{balances.eUSDC.formatted}</div>
              <button
                onClick={async () => {
                  try {
                    setIsUSDCRefreshing(true);
                    await getEncryptedTokenBalance("eUSDC");
                  } catch (error) {
                    console.log(error);
                  } finally {
                    setIsUSDCRefreshing(false);
                  }
                }}
                type="button"
              >
                <RotateCcwIcon
                  className={cn(
                    "size-5",
                    isUSDCRefreshing && "animate-spin-fast-reverse",
                  )}
                />
              </button>
            </div>
            <div className="text-neutral-500">eUSDC Balance</div>
          </div>
          <img alt="eUSDC" className="size-10" src="/icons/eusdc.svg" />
        </div>
        <div className=" flex h-32 w-full max-w-xs items-center justify-between rounded-xl border bg-[#0f0f0f] p-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
              <div className="text-2xl">{balances.eWETH.formatted}</div>
              <button
                onClick={async () => {
                  try {
                    setIsWETHRefreshing(true);
                    await getEncryptedTokenBalance("eWETH");
                  } catch (error) {
                    console.log(error);
                  } finally {
                    setIsWETHRefreshing(false);
                  }
                }}
                type="button"
              >
                <RotateCcwIcon
                  className={cn(
                    "size-5",
                    isWETHRefreshing && "animate-spin-fast-reverse",
                  )}
                />
              </button>
            </div>
            <div className="text-neutral-500">eWETH Balance</div>
          </div>
          <img alt="eWETH" className="size-10" src="/icons/eweth.svg" />
        </div>
      </div>
      <div className="card-gradient mx-auto my-0 flex max-w-screen-xl flex-cpl flex-col gap-4 rounded-2xl border p-4">
        <div className="flex w-full flex-col rounded-xl border bg-[#101010] p-3">
          <div className="text-2xl">My Strategies</div>
        </div>
        <div>
          <StrategiesTable strategies={strategies ?? []} />
        </div>
      </div>
    </div>
  );
}
