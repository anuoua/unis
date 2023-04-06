import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { reassign } from "rollup-plugin-reassign";
import { unisFns } from "@unis/core";

const configGen = (format) =>
  defineConfig({
    input: "src/index.ts",
    external: [/^@unis/],
    output: [
      {
        dir: "dist",
        entryFileNames: `index.${format === "esm" ? "mjs" : "js"}`,
        format,
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve(),
      esbuild({
        sourceMap: true,
        target: "esnext",
        jsx: "automatic",
        jsxImportSource: "@unis/core",
      }),
      reassign({
        include: ["**/*.(t|j)s?(x)"],
        targetFns: {
          "@unis/core": unisFns,
        },
      }),
    ],
  });

const dtsRollup = () =>
  defineConfig({
    input: "build/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  });

const config = [configGen("cjs"), configGen("esm"), dtsRollup()];

export default config;
