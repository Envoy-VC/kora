import type { PropsWithChildren } from "react";

import { QueryProvider } from "./query";

export const ProviderTree = ({ children }: PropsWithChildren) => {
  return <QueryProvider>{children}</QueryProvider>;
};
