import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import dts from "rollup-plugin-dts";

/**
 * @param {*} format
 * @returns {import('rollup').RollupOptions}
 */
const configGen = (format) => ({
  input: "build/browser/index.js",
  external: [/^@unis/],
  output: [
    {
      dir: "dist",
      entryFileNames: `browser.${format === "esm" ? "mjs" : "js"}`,
      format,
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    esbuild({
      sourceMap: true,
      target: "esnext",
    }),
  ],
});

/**
 * @param {*} format
 * @returns {import('rollup').RollupOptions}
 */
const serverConfigGen = (format) => ({
  input: "build/server/index.js",
  external: [/^@unis/],
  output: [
    {
      dir: "dist",
      entryFileNames: `server.${format === "esm" ? "mjs" : "js"}`,
      format,
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    esbuild({
      sourceMap: true,
      target: "esnext",
    }),
  ],
});

/**
 * @param {*} format
 * @returns {import('rollup').RollupOptions}
 */
const dtsRollup = (which) => ({
  input: `build/${which}/index.d.ts`,
  output: [{ file: `dist/${which}.d.ts`, format: "es" }],
  plugins: [dts()],
});

const config = [
  configGen("cjs"),
  configGen("esm"),
  serverConfigGen("cjs"),
  serverConfigGen("esm"),
  dtsRollup("browser"),
  dtsRollup("server"),
];

export default config;
