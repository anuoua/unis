import esbuild from "rollup-plugin-esbuild";
import dts from "rollup-plugin-dts";
import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const configGen = (format, plateform) =>
  defineConfig({
    input: `src/${plateform}/index.ts`,
    external: [/^@unis/],
    output: [
      {
        dir: "dist",
        entryFileNames: `${plateform}.${format === "esm" ? "mjs" : "js"}`,
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

const dtsRollup = (which) =>
  defineConfig({
    input: `build/${which}/index.d.ts`,
    output: [{ file: `dist/${which}.d.ts`, format: "es" }],
    plugins: [dts()],
  });

const config = [
  configGen("cjs", "browser"),
  configGen("esm", "browser"),
  configGen("cjs", "server"),
  configGen("esm", "server"),
  dtsRollup("browser"),
  dtsRollup("server"),
];

export default config;
