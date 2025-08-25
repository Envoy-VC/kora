"use node";

import {
  createWalletClient,
  type Hex,
  http,
  keccak256,
  toHex,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { sepolia } from "viem/chains";

import type { Strategy } from "../types";
import { koraExecutorAbi } from "./abi";

export const executeStrategies = async (strategies: Strategy[]) => {
  // After a Strategy is executed:
  // - nextRunAt is set to currentDate + parseFrequencyDuration + errorMargin (in seconds)
  // - errorMargin is set because on-chain transactions are not instantaneous
  // - if nexRunAt is greater than validUntil then the strategy is completed

  const account = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);

  const walletClient: WalletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL as string),
  });

  const batch = strategies.map((strategy) => {
    return {
      amount0: strategy.amount.handle as Hex,
      inputProof: strategy.amount.inputProof as Hex,
      intentId: keccak256(toHex(crypto.randomUUID())),
      strategyId: strategy.strategyId as Hex,
    };
  });

  const hash = await writeContract(walletClient, {
    abi: koraExecutorAbi,
    account,
    address: process.env.KORA_EXECUTOR_ADDRESS as Hex,
    args: [batch],
    chain: sepolia,
    functionName: "executeBatch",
  });
  await waitForTransactionReceipt(walletClient, { hash });
  return hash;
};
