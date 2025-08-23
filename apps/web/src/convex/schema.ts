import { defineSchema, defineTable } from "convex/server";

import { strategySchema, userSchema } from "./models";

const schema = defineSchema({
  strategies: defineTable(strategySchema)
    .index("by_strategy_id", ["strategyId"])
    .index("by_user_id", ["user"]),
  users: defineTable(userSchema).index("by_address", ["address"]),
});

// biome-ignore lint/style/noDefaultExport: safe
export default schema;
