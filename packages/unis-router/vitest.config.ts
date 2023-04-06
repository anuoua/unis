import { defineConfig } from "vitest/config";
import { unisPreset } from "@unis/vite-preset";

export default defineConfig({
  plugins: [unisPreset()],
  test: {
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
