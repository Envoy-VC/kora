import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type UserConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

export default defineConfig(async ({ mode }) => {
  // @ts-expect-error assign read-only env for build, load all env vars
  import.meta.env = loadEnv(mode, process.cwd(), "");
  const { env } = await import("./src/env");
  return {
    envPrefix: ["VITE_"],
    plugins: [
      nodePolyfills(),
      tanstackRouter({
        autoCodeSplitting: true,
        target: "react",
      }),
      react(),
      wasm(),
      topLevelAwait(),
      tailwindcss(),
    ],
    publicDir: "public",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        public: path.resolve(__dirname, "./public"),
      },
    },
    server: {
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
      port: env.PORT,
    },
  } satisfies UserConfig;
});
