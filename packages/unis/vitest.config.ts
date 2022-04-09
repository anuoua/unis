import { defineConfig } from "vitest/config";
import typescript from "@rollup/plugin-typescript";
import { reassign } from "rollup-plugin-reassign";

export default defineConfig({
  plugins: [
    typescript(),
    reassign({
      targetFns: {
        "../src/api": ["useState", "use", "use2"],
      },
    }),
  ],
  test: {
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
