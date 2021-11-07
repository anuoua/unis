import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "vite";

export default defineConfig({
  root: "./src",
  esbuild: false,
  plugins: [typescript()],
  build: {
    outDir: '../dist'
  }
});
