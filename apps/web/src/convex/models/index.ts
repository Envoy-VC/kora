import { v } from "convex/values";

export const userSchema = {
  address: v.string(),
};

export const strategySchema = {
  amount: v.object({
    handle: v.string(),
    inputProof: v.string(),
  }),
  hooks: v.object({
    frequency: v.object({
      duration: v.number(),
      unit: v.union(
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
  isCompleted: v.boolean(),
  nextRunAt: v.string(),
  salt: v.string(),
  strategyId: v.string(),
  user: v.id("users"),
};
