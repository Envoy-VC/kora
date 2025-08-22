import type { PropsWithChildren } from "react";

import { WagmiProvider } from "wagmi";

import { wagmiConfig } from "@/lib/wagmi";

export const Web3Provider = ({ children }: PropsWithChildren) => {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
};
