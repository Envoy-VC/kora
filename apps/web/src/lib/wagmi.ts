import type { Hex } from "viem";
import { waitForTransactionReceipt as waitForTransactionReceiptCore } from "viem/actions";
import { createConfig, http, injected } from "wagmi";
import { sepolia } from "wagmi/chains";

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
  },
});

export const waitForTransactionReceipt = async (hash: Hex) => {
  await waitForTransactionReceiptCore(wagmiConfig.getClient(), { hash });
};
