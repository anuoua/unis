import { defineConfig } from "vitest/config";
import { reassign } from "rollup-plugin-reassign";
import replace from "@rollup/plugin-replace";

export default defineConfig({
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
  plugins: [
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
