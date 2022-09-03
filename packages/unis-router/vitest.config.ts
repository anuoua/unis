import { defineConfig } from "vitest/config";
import { reassign } from "rollup-plugin-reassign";

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
          useContext: 1,
          useReducer: 2,
          useMemo: 2,
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
