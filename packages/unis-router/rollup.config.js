import { defineConfig } from 'rollup'
import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild"
import { reassign } from 'rollup-plugin-reassign'

const configGen = (format) => defineConfig({
  input: "src/index.ts",
  external: ['@unis/unis', 'history'],
  output: [
    {
      name: "transition",
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
        "@unis/unis": {
          use: 1,
          useState: 1,
          useProps: 1,
          useContext: 1,
          useReducer: 2,
          useMemo: 2
        },
      },
    }),
  ],
});

const config = [configGen("umd"), configGen("esm")];

export default config;
