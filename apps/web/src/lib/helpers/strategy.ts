import { encodeAbiParameters, type Hex, parseUnits, toHex } from "viem";

import { Contracts } from "@/data/contracts";

import { parseFrequencyDuration } from "./date";

export const encodeHookInitializer = (
  userAddress: Hex,
  handle: Hex,
  inputProof: Hex,
) => {
  return encodeAbiParameters(
    [{ type: "address" }, { type: "bytes32" }, { type: "bytes" }],
    [userAddress, handle, inputProof],
  );
};

type BuildStrategyHooksProps = {
  encryptFn: (
    value: bigint,
    contractAddress: string,
    userAddress?: string,
  ) => Promise<
    | {
        handles: Uint8Array[];
        inputProof: Uint8Array;
      }
    | undefined
  >;
  userAddress: Hex;
  maxBudget: number;
  maxPurchaseAmount: number;
  validUntil: Date;
  frequency: {
    duration: number;
    unit: "hours" | "days" | "weeks" | "months" | "years";
  };
};

export const buildStrategyHooks = async ({
  userAddress,
  encryptFn,
  maxBudget,
  maxPurchaseAmount,
  validUntil,
  frequency,
}: BuildStrategyHooksProps) => {
  // 1. Budget Hook
  const encMaxBudget = await encryptFn(
    parseUnits(maxBudget.toString(), 6),
    Contracts.koraExecutor.address,
  );
  if (!encMaxBudget?.handles[0])
    throw new Error("Failed to encrypt max budget");
  // 2. Purchase Amount Hook
  const encMaxPurchaseAmount = await encryptFn(
    parseUnits(maxPurchaseAmount.toString(), 6),
    Contracts.koraExecutor.address,
  );
  if (!encMaxPurchaseAmount?.handles[0])
    throw new Error("Failed to encrypt max purchase amount");
  // 3. Timeframe Hook
  const timeFrameInSeconds = Math.floor(validUntil.getTime() / 1000);
  const encValidUntil = await encryptFn(
    BigInt(timeFrameInSeconds),
    Contracts.koraExecutor.address,
  );
  if (!encValidUntil?.handles[0])
    throw new Error("Failed to encrypt valid until");
  // 4. Frequency Hook
  const frequencyInSeconds = parseFrequencyDuration(
    frequency.duration,
    frequency.unit,
  );
  const encFrequency = await encryptFn(
    BigInt(frequencyInSeconds),
    Contracts.koraExecutor.address,
  );
  if (!encFrequency?.handles[0]) throw new Error("Failed to encrypt frequency");

  return [
    // 1. Budget Hook
    {
      data: encodeHookInitializer(
        userAddress,
        toHex(encMaxBudget.handles[0]),
        toHex(encMaxBudget.inputProof),
      ),
      hook: Contracts.hooks.budgetHook.address,
    },
    // 2. Purchase Amount Hook
    {
      data: encodeHookInitializer(
        userAddress,
        toHex(encMaxPurchaseAmount.handles[0]),
        toHex(encMaxPurchaseAmount.inputProof),
      ),
      hook: Contracts.hooks.purchaseAmountHook.address,
    },
    // 3. Timeframe Hook
    {
      data: encodeHookInitializer(
        userAddress,
        toHex(encValidUntil.handles[0]),
        toHex(encValidUntil.inputProof),
      ),
      hook: Contracts.hooks.timeframeHook.address,
    },
    // 4. Frequency Hook
    {
      data: encodeHookInitializer(
        userAddress,
        toHex(encFrequency.handles[0]),
        toHex(encFrequency.inputProof),
      ),
      hook: Contracts.hooks.frequencyHook.address,
    },
  ];
};
