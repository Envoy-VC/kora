import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  strategies: defineTable({
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
    nextRunAt: v.string(),
    salt: v.string(),
    strategyId: v.string(),
    user: v.id("users"),
    validUntil: v.string(),
  }),
  users: defineTable({
    address: v.string(),
  }).index("by_address", ["address"]),
});

// biome-ignore lint/style/noDefaultExport: safe
export default schema;
