import { defineConfig } from "vitest/config";
import replace from "@rollup/plugin-replace";

export default defineConfig({
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
  plugins: [
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
