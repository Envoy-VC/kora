import type { PropsWithChildren } from "react";

import {
  ConvexProvider as ConvexProviderCore,
  ConvexReactClient,
} from "convex/react";

import { env } from "@/env";

const convex = new ConvexReactClient(env.VITE_CONVEX_URL);

export const ConvexProvider = ({ children }: PropsWithChildren) => {
  return <ConvexProviderCore client={convex}>{children}</ConvexProviderCore>;
};
