import { cronJobs } from "convex/server";

// import { api } from "./_generated/api";

const crons = cronJobs();

// crons.hourly(
//   "Batch Execute Transactions",
//   { minuteUTC: 30 },
//   api.functions.actions.executeBatch,
// );

// biome-ignore lint/style/noDefaultExport: safe
export default crons;
