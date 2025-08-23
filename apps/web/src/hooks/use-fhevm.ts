import { readContract } from "@wagmi/core";
import {
  createInstance,
  type FhevmInstance,
  initSDK,
  SepoliaConfig,
} from "@zama-fhe/relayer-sdk/bundle";
import { useLocalStorage } from "usehooks-ts";
import type { TypedData } from "viem";
import { useAccount, useSignTypedData } from "wagmi";
import type { SignTypedDataVariables } from "wagmi/query";
import { create } from "zustand";

import { Contracts } from "@/data/contracts";
import { wagmiConfig } from "@/lib/wagmi";

interface FheVmStore {
  fhevm: FhevmInstance | undefined;
  setFhevm: (instance: FhevmInstance) => void;
}

const useFhevmStore = create<FheVmStore>((set) => ({
  fhevm: undefined,
  setFhevm: (instance: FhevmInstance) => set({ fhevm: instance }),
}));

interface EncryptedBalances {
  eUSDC: {
    latest?: {
      handle: string;
      balance: number;
    };
    history: Record<string, number>;
  };
  eWETH: {
    latest?: {
      handle: string;
      balance: number;
    };
    history: Record<string, number>;
  };
}

export const useFhevm = () => {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const { fhevm, setFhevm } = useFhevmStore();

  const [encryptedBalances, setEncryptedBalances] =
    useLocalStorage<EncryptedBalances>("encryptedBalances", {
      eUSDC: { history: {} },
      eWETH: { history: {} },
    });

  const getFhevmInstance = async () => {
    if (!fhevm) {
      await initSDK();
      const instance = await createInstance(SepoliaConfig);
      setFhevm(instance);
      return instance;
    }
    return fhevm;
  };

  const getEncryptedTokenBalance = async (token: "eWETH" | "eUSDC") => {
    if (!address) return 0n;

    const contract = token === "eWETH" ? Contracts.eWETH : Contracts.eUSDC;
    const handle = await readContract(wagmiConfig, {
      ...Contracts.eWETH,
      args: [address ?? "0x"],
      functionName: "balanceOf",
    });

    // Check if fetched handle is the latest one.
    if (encryptedBalances[token].latest?.handle === handle) {
      return BigInt(encryptedBalances[token].latest.balance);
    }

    // Check in local storage if handle is already stored
    const storedBalance = encryptedBalances[token].history[handle];
    if (storedBalance) {
      return BigInt(storedBalance);
    }

    const instance = await getFhevmInstance();
    const keypair = instance.generateKeypair();

    const contractAddress = contract.address;
    const handleContractPairs = [
      {
        contractAddress: contractAddress,
        handle: handle,
      },
    ];
    const now = Math.floor(Date.now() / 1000).toString();
    const validityInDays = "10";
    const contractAddresses = [contractAddress];

    const eip712 = instance.createEIP712(
      keypair.publicKey,
      contractAddresses,
      now,
      validityInDays,
    );

    const signature = await signTypedDataAsync(
      eip712 as unknown as SignTypedDataVariables<
        TypedData,
        typeof eip712.primaryType
      >,
    );

    const result = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace("0x", ""),
      contractAddresses,
      address,
      now,
      validityInDays,
    );

    const balance = result[handle] as bigint;

    // Store the handle and balance in local storage
    const copied = { ...encryptedBalances };
    copied[token].history[handle] = Number(balance);
    copied[token].latest = { balance: Number(balance), handle };
    setEncryptedBalances(copied);

    return balance;
  };

  const createEncryptedUint64 = async (
    value: bigint,
    contractAddress: string,
    userAddress?: string,
  ) => {
    const user = userAddress ?? address;
    if (!user) return;
    const instance = await getFhevmInstance();
    return await instance
      .createEncryptedInput(contractAddress, user)
      .add64(value)
      .encrypt();
  };

  return { createEncryptedUint64, getEncryptedTokenBalance, getFhevmInstance };
};
