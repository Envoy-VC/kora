import { useMemo, useState } from "react";

import { cn } from "@kora/ui/lib/utils";
import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { useFhevm } from "@/hooks";
import { parseErrorMessage } from "@/lib/helpers/error";

interface EncryptedTokenBalanceProps {
  token: "eWETH" | "eUSDC";
}

export const EncryptedTokenBalance = ({
  token,
}: EncryptedTokenBalanceProps) => {
  const { getUserEncryptedBalance, getEncryptedTokenBalance } = useFhevm();

  const [isRefetching, setIsRefetching] = useState(false);

  const balance = useMemo(() => {
    return getUserEncryptedBalance(token);
  }, [getUserEncryptedBalance, token]);

  return (
    <div className="flex flex-row items-center gap-2 rounded-xl bg-[#0f0f0f] px-4 py-2 text-neutral-200">
      {balance.formatted} {balance.symbol}
      <RotateCcwIcon
        className={cn(
          "cursor-pointer",
          isRefetching && "animate-spin-fast-reverse",
        )}
        onClick={async () => {
          try {
            setIsRefetching(true);
            await getEncryptedTokenBalance(token);
            toast.success("Encrypted balance updated");
          } catch (error) {
            console.log(error);
            const message = parseErrorMessage(error);
            toast.error(message);
          } finally {
            setIsRefetching(false);
          }
        }}
        size={16}
      />
    </div>
  );
};
