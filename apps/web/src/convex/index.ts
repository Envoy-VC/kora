import { ActionRetrier } from "@convex-dev/action-retrier";

import { components } from "./_generated/api";

export const retrier = new ActionRetrier(components.actionRetrier, {
  base: 10,
  initialBackoffMs: 10000,
  maxFailures: 4,
});
