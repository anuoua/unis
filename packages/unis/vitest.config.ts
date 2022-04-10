import { defineConfig } from "vitest/config";
import typescript from "@rollup/plugin-typescript";
import { reassign } from "rollup-plugin-reassign";

export default defineConfig({
  plugins: [
    typescript(),
    reassign({
      targetFns: {
        "../src/api": {
          use: 1,
          useState: 1,
          useProps: 1,
          useReducer: 2,
        },
        "../src/context": {
          useContext: 1,
        },
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
