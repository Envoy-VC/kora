import type { PropsWithChildren } from "react";

import { ConvexProvider } from "./convex";
import { QueryProvider } from "./query";
import { Web3Provider } from "./web3";

export const ProviderTree = ({ children }: PropsWithChildren) => {
  return (
    <Web3Provider>
      <QueryProvider>
        <ConvexProvider>{children}</ConvexProvider>
      </QueryProvider>
    </Web3Provider>
  );
};
