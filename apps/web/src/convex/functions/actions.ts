import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { executeStrategies } from "./helpers";

export const executeBatch = action({
  args: {},
  handler: async (ctx) => {
    const strategies = await ctx.runQuery(
      internal.functions.strategy.getStrategiesToExecute,
    );
    const hash = await executeStrategies(strategies);

    const strategyIds = strategies.map((s) => s._id);
    await ctx.runMutation(
      internal.functions.strategy.updateExecutedStrategies,
      { strategyIds },
    );

    return hash;
  },
});
