import { defineConfig } from 'rollup'
import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild"
import { reassign } from 'rollup-plugin-reassign'
import { unisFns } from '@unis/unis';

const configGen = (format) => defineConfig({
  input: "src/index.ts",
  external: ['@unis/unis'],
  output: [
    {
      dir: "build",
      entryFileNames: `index.${format === "esm" ? "mjs" : "js"}`,
      format,
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    esbuild({
      sourceMap: true,
      minify: process.env.NODE_ENV === 'development' ? false : true,
      target: 'esnext',
      jsxFactory: 'h',
    }),
    reassign({
      include: ["**/*.(t|j)s?(x)"],
      targetFns: {
        "@unis/unis": unisFns,
      },
    }),
  ],
});

const config = [configGen("cjs"), configGen("esm")];

export default config;
