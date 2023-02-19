import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";

/**
 * @param {*} format
 * @returns {import('rollup').RollupOptions}
 */
const configGen = (format) => ({
  input: "src/unis.ts",
  output: [
    {
      dir: "build",
      entryFileNames: `unis.${format === "esm" ? "mjs" : "js"}`,
      format,
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    esbuild({
      sourceMap: true,
      minify: process.env.NODE_ENV === "development" ? false : true,
      target: "esnext",
    }),
  ],
});

const config = [configGen("cjs"), configGen("esm")];

export default config;
