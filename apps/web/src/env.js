import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {},
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: {},
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
  },
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
});
