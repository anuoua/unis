import { defineConfig } from "vitest/config";
import { reassign } from "rollup-plugin-reassign";
import replace from "@rollup/plugin-replace";
import { unisFns } from "@unis/core";

export default defineConfig({
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
  plugins: [
    reassign({
      targetFns: {
        "@unis/core": unisFns,
      },
    }),
    replace({
      "INTERVAL = 4": "INTERVAL = 100000000",
    }),
  ],
  test: {
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
