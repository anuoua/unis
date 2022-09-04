import { defineConfig } from "vite";
import { reassign } from "rollup-plugin-reassign";

export default defineConfig({
  root: "./src",
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  },
  build: {
    outDir: '../dist'
  },
  plugins: [
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
  ]
});
