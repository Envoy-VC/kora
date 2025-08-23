import { useState } from "react";

import { Button } from "@kora/ui/components/button";
import { GiftIcon, KoraLogo } from "@kora/ui/icons";
import { cn } from "@kora/ui/lib/utils";

import { useBalances } from "@/hooks";

const tokens = {
  usdc: {
    icon: "/icons/usdc.svg",
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
  },
  weth: {
    icon: "/icons/weth.svg",
    id: "weth",
    name: "Ether",
    symbol: "WETH",
  },
} as const;

const multipliers = [
  {
    id: "25%",
    title: "25%",
    value: 0.25,
  },
  {
    id: "50%",
    title: "50%",
    value: 0.5,
  },
  {
    id: "75%",
    title: "75%",
    value: 0.75,
  },
  {
    id: "100%",
    title: "100%",
    value: 1,
  },
];

export const WrapTokens = () => {
  const [activeToken, setActiveToken] = useState<"weth" | "usdc">("weth");
  const balances = useBalances();
  const [amount, setAmount] = useState<number>(0);

  const onMultiplierClick = (multiplier: (typeof multipliers)[0]) => {
    const amountAvailable = balances[activeToken].value;
    const amountToWrap = Number(amountAvailable) * multiplier.value;
    const parsedAmount = amountToWrap / 10 ** balances[activeToken].decimals;
    setAmount(parsedAmount);
  };

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border bg-card">
      <div className="flex flex-row items-center gap-2 border-b p-4">
        <div className="flex size-12 items-center justify-center rounded-full border text-neutral-600">
          <GiftIcon />
        </div>
        <div className="flex h-12 flex-col gap-1">
          <div className="text-base">Wrap Tokens</div>
          <div className="text-neutral-400 text-sm">
            Convert your tokens into Encrypted ERC-20 Tokens to use them in
            Kora.
          </div>
        </div>
      </div>
      <div className="flex h-[26rem] flex-row gap-6 overflow-hidden p-4">
        <div className="relative w-full basis-2/5 space-y-2">
          <div className="-bottom-[30%] absolute right-1/2 translate-x-1/2 text-neutral-200">
            <KoraLogo className="size-[12rem]" />
          </div>
          <div className="text-sm">Token to Wrap</div>
          <div className="flex flex-col gap-2">
            {Object.values(tokens).map((token) => {
              return (
                <button
                  className={cn(
                    "flex cursor-pointer flex-col gap-2 rounded-xl border p-4",
                    activeToken === token.id
                      ? "border-primary"
                      : "border-border",
                  )}
                  key={`wrap-button-${token.id}`}
                  onClick={() => setActiveToken(token.id)}
                  type="button"
                >
                  <div className="flex flex-row items-center gap-2">
                    <img
                      alt={token.symbol}
                      className="size-6"
                      src={token.icon}
                    />
                    <div className="">{token.symbol}</div>
                  </div>
                  <div className="text-start text-neutral-400 text-sm">
                    Wrap {token.name} to Encrypted {token.symbol} (e
                    {token.symbol})
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex w-full basis-3/5 flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="text-sm">I will wrap</div>
            <div className="flex w-tull flex-col gap-3 rounded-xl border p-3">
              <div className="text-neutral-500 text-sm">
                Available Balance: {balances[activeToken].formatted}{" "}
                {tokens[activeToken].symbol}
              </div>
              <div className="flex flex-row items-center gap-2">
                <input
                  className="w-full border-none text-2xl outline-none placeholder:text-2xl"
                  onChange={(e) => {
                    if (e.target.value === "0" || e.target.value === "") {
                      setAmount(0);
                      return;
                    }
                    setAmount(Number(e.target.value));
                  }}
                  placeholder="0.00"
                  type="number"
                  value={amount}
                />
                <div className="flex min-w-fit flex-row items-center gap-1">
                  <img
                    alt="token"
                    className="size-7"
                    src={tokens[activeToken].icon}
                  />
                  <div className="text-lg text-neutral-100">
                    {tokens[activeToken].symbol}
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center justify-between gap-4">
                {multipliers.map((multiplier) => {
                  return (
                    <button
                      className="w-full cursor-pointer rounded-lg border bg-card px-2 py-1 text-neutral-500 text-xs"
                      key={multiplier.id}
                      onClick={() => onMultiplierClick(multiplier)}
                      type="button"
                    >
                      {multiplier.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t pt-6">
            <div>Details</div>
            <div className="flex flex-row items-center justify-between gap-2 text-sm">
              <div className="text-neutral-500">You Deposit</div>
              <div>
                {amount} {tokens[activeToken].symbol}
              </div>
            </div>
            <div className="flex flex-row items-center justify-between gap-2 text-sm">
              <div className="text-neutral-500">You Receive</div>
              <div>
                {amount} e{tokens[activeToken].symbol}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-gradient flex items-center justify-between rounded-b-2xl border-t px-4 py-5">
        <div className="flex flex-row items-center">
          <div className="flex flex-col items-center justify-center gap-3 text-[#e3a003]">
            <div className="text-xs">1</div>
            <div className="size-2 rounded-full bg-[#e3a003] outline outline-[#e3a003] outline-offset-2"></div>
            <div className="font-extralight text-xs tracking-wider">
              Details
            </div>
          </div>
          <div className="h-0 w-14 border-neutral-500 border-t"></div>
          <div className="flex flex-col items-center justify-center gap-3 text-neutral-500">
            <div className="text-xs">2</div>
            <div className="size-2 rounded-full bg-neutral-500 outline outline-neutral-500 outline-offset-2"></div>
            <div className="font-extralight text-xs tracking-wider">
              Confirm
            </div>
          </div>
        </div>
        <Button className="h-8">Continue</Button>
      </div>
    </div>
  );
};
