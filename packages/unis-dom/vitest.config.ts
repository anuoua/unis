import { defineConfig } from "vitest/config";
import replace from "@rollup/plugin-replace";
import { unisPreset } from "@unis/vite-preset";

export default defineConfig({
  plugins: [
    unisPreset(),
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
