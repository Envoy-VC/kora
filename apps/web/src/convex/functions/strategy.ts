import { v } from "convex/values";

import {
  internalMutation,
  internalQuery,
  mutation,
  type QueryCtx,
  query,
} from "../_generated/server";
import type { Nullable, User } from "../types";
import { getOrCreateUser, getUserByAddress } from "./user";

const isBefore = (date: Date, compareDate: Date) => {
  return date.getTime() < compareDate.getTime();
};

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

export const getStrategiesToExecute = internalQuery({
  args: {},
  handler: async (ctx) => {
    const res = await ctx.db
      .query("strategies")
      .withIndex("by_completion_status", (q) => q.eq("isCompleted", false))
      .collect();

    // Strategies are only executed if:
    // - nextRunAt is less than the current date

    const filtered = res.filter((strategy) => {
      const nextRunAt = new Date(strategy.nextRunAt);
      return isBefore(nextRunAt, new Date());
    });

    return filtered;
  },
});

export const parseFrequencyDuration = (
  duration: number,
  unit: "hours" | "days" | "weeks" | "months" | "years",
): number => {
  const ONE_HOUR_IN_SECONDS = 3600;
  const ONE_DAY_IN_SECONDS = ONE_HOUR_IN_SECONDS * 24;
  const ONE_WEEK_IN_SECONDS = ONE_DAY_IN_SECONDS * 7;
  const ONE_MONTH_IN_SECONDS = ONE_DAY_IN_SECONDS * 30;
  const ONE_YEAR_IN_SECONDS = ONE_DAY_IN_SECONDS * 365;

  if (unit === "hours") {
    return duration * ONE_HOUR_IN_SECONDS;
  } else if (unit === "days") {
    return duration * ONE_DAY_IN_SECONDS;
  } else if (unit === "weeks") {
    return duration * ONE_WEEK_IN_SECONDS;
  } else if (unit === "months") {
    return duration * ONE_MONTH_IN_SECONDS;
  } else {
    return duration * ONE_YEAR_IN_SECONDS;
  }
};

export const updateExecutedStrategies = internalMutation({
  args: {
    strategyIds: v.array(v.id("strategies")),
  },
  handler: async (ctx, args) => {
    for await (const id of args.strategyIds) {
      const strategy = await ctx.db.get(id);
      if (!strategy) continue;
      // For Each executed strategy:
      // - Compute the nextRunAt depending on frequency.
      // - Check if nextRunAt is before validUntil, if not set completed to false.

      const nextRunAt = new Date(
        (Math.round(new Date(strategy.nextRunAt).getTime() / 1000) +
          parseFrequencyDuration(
            strategy.hooks.frequency.duration,
            strategy.hooks.frequency.unit,
          )) *
          1000,
      );

      const isCompleted = isBefore(
        new Date(strategy.hooks.validUntil),
        nextRunAt,
      );

      await ctx.db.patch(id, {
        isCompleted,
        nextRunAt: nextRunAt.toISOString(),
      });
    }
  },
});
