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
        "../src/api/use": {
          use: 1,
        },
        "../src/api/useState": {
          useState: 1,
        },
        "../src/api/useProps": {
          useProps: 1,
        },
        "../src/api/useContext": {
          useContext: 1,
        },
        "../src/api/useReducer": {
          useReducer: 2,
        },
        "../src/api/useMemo": {
          useMemo: 2,
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
