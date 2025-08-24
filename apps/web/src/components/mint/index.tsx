import { useState } from "react";

import { Input } from "@kora/ui/components/input";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";

import { Contracts } from "@/data/contracts";
import { sleep } from "@/lib/helpers";
import { parseErrorMessage } from "@/lib/helpers/error";
import { waitForTransactionReceipt } from "@/lib/wagmi";

import {
  ThreeStepButton,
  type ThreeStepButtonCallback,
} from "../three-step-button";

export const Mint = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [token, setToken] = useState<"weth" | "usdc">("weth");

  const onMint: ThreeStepButtonCallback = async ({ setState }) => {
    try {
      setState("in-progress");
      if (!address) {
        throw new Error("Connect your wallet");
      }
      const value = parseUnits((amount ?? 0).toString(), 6);
      if (value === 0n) {
        throw new Error("Amount must be greater than 0");
      }
      const tokenToMint = token === "usdc" ? Contracts.usdc : Contracts.weth;
      const hash = await writeContractAsync({
        ...tokenToMint,
        args: [address, value],
        functionName: "mint",
      });
      await waitForTransactionReceipt(hash);
      setAmount(undefined);
      setState("success");
      toast.success("Tokens Minted Successfully");
      await sleep("2s");
      setState("idle");
    } catch (error: unknown) {
      const message = parseErrorMessage(error);
      toast.error(message);
      setState("error");
      await sleep("2s");
      setState("idle");
    } finally {
      setState("idle");
    }
  };
  return (
    <div className="card-gradient flex w-full max-w-xl flex-col gap-2 rounded-3xl border p-6">
      <div className="flex flex-col gap-2">
        <div className="w-fit font-medium text-neutral-100 text-xl">
          Mint Mock Tokens
        </div>
        <p className="text-neutral-400 text-sm">
          Mock Tokens are used to create investment strategies, and can be
          wrapped into Encrypted ERC-20 Tokens.
        </p>
      </div>
      <div className="my-4 flex flex-row items-center justify-between rounded-2xl border p-3">
        <Input
          className="!text-5xl [&::-moz-appearance]:textfield h-12 w-full appearance-none border-none px-0 placeholder:text-5xl placeholder:text-neutral-400 focus-visible:border-none focus-visible:outline-none focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          max={100000}
          min={0}
          onChange={(e) => {
            if (e.target.value === "0" || e.target.value === "") {
              setAmount(undefined);
              return;
            }
            setAmount(Number(e.target.value));
          }}
          placeholder="0.00"
          step={1}
          type="number"
          value={amount}
        />
        <button
          className="flex max-h-12 min-h-12 min-w-12 max-w-12 cursor-pointer items-center justify-center rounded-full"
          onClick={() => setToken(token === "usdc" ? "weth" : "usdc")}
          type="button"
        >
          <img
            alt="token"
            className="h-full w-full"
            src={token === "usdc" ? "/icons/usdc.svg" : "/icons/weth.svg"}
          />
        </button>
      </div>
      <ThreeStepButton
        buttonProps={{ className: "w-full" }}
        onClick={onMint}
        text={{
          error: "Error",
          idle: "Mint Tokens",
          inProgress: "Minting...",
          success: "Minted",
        }}
      />
    </div>
  );
};
