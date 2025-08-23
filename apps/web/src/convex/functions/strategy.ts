import { v } from "convex/values";

import { mutation, type QueryCtx, query } from "../_generated/server";
import type { Nullable, User } from "../types";
import { getOrCreateUser, getUserByAddress } from "./user";

export const createStrategy = mutation({
  args: {
    amount: v.object({
      handle: v.string(),
      inputProof: v.string(),
    }),
    hooks: v.object({
      frequency: v.object({
        duration: v.number(),
        unit: v.union(
          v.literal("hours"),
          v.literal("days"),
          v.literal("weeks"),
          v.literal("months"),
          v.literal("years"),
        ),
      }),
      maxBudget: v.number(),
      maxPurchaseAmount: v.number(),
      validUntil: v.string(),
    }),
    nextRunAt: v.string(),
    salt: v.string(),
    strategyId: v.string(),
    userAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const { userAddress, ...rest } = args;
    const user = await getOrCreateUser(ctx, userAddress);
    const id = await ctx.db.insert("strategies", {
      ...rest,
      isCompleted: false,
      user: user._id,
    });
    const strategy = await ctx.db.get(id);
    if (!strategy) throw new Error("Failed to create strategy");
    return strategy;
  },
});

const strategyById = async (ctx: QueryCtx, strategyId: string) => {
  const strategy = await ctx.db
    .query("strategies")
    .withIndex("by_strategy_id", (q) => q.eq("strategyId", strategyId))
    .unique();
  return strategy;
};

export const getStrategyById = query({
  args: { strategyId: v.string() },
  handler: async (ctx, args) => {
    return await strategyById(ctx, args.strategyId);
  },
});

export const getStrategiesForUser = query({
  args: {
    userAddress: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let user: Nullable<User> = null;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    }

    if (args.userAddress) {
      user = await getUserByAddress(ctx, args.userAddress);
    }

    if (!user) throw new Error("User not found");

    const strategies = await ctx.db
      .query("strategies")
      .withIndex("by_user_id", (q) => q.eq("user", user._id))
      .collect();
    return strategies;
  },
});
