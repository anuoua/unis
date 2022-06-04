import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild"

const configGen = (format) => ({
  input: "src/unis.ts",
  output: [
    {
      name: "unis",
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
      minify: process.env.NODE_ENV === 'development' ? false : true,
      target: 'esnext'
    }),
  ],
});

const config = [configGen("umd"), configGen("esm")];

export default config;
