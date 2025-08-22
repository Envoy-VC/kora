import { v } from "convex/values";

import {
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "../_generated/server";

export const getOrCreateUser = async (ctx: MutationCtx, address: string) => {
  let user = await ctx.db
    .query("users")
    .withIndex("by_address", (q) => q.eq("address", address))
    .unique();

  if (!user) {
    const id = await ctx.db.insert("users", { address });
    const createdUser = await ctx.db.get(id);
    if (!createdUser) throw new Error("Failed to create user");
    user = createdUser;
  }

  return user;
};

export const getUserByAddress = async (ctx: QueryCtx, address: string) => {
  const user = await ctx.db
    .query("users")
    .withIndex("by_address", (q) => q.eq("address", address))
    .unique();
  return user;
};

export const createUser = mutation({
  args: { address: v.string() },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx, args.address);
    return user;
  },
});

export const getUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    return user;
  },
});

export const userByAddress = query({
  args: { address: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByAddress(ctx, args.address);
    return user;
  },
});
