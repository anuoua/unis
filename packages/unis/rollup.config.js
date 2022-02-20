import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild"

const configGen = (format) => ({
  input: "src/unis.ts",
  output: [
    {
      name: "unis",
      dir: `build/${format}`,
      entryFileNames: "unis.js",
      format,
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    esbuild({
      sourceMap: true,
      minify: false,
      target: 'esnext'
    }),
  ],
});

const config = [configGen("umd"), configGen("esm")];

export default config;
