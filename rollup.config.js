import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { uglify } from "rollup-plugin-uglify";

const configGen = (format) => ({
  input: 'src/unis.ts',
  output: [
    {
      name: 'unis',
      dir: `build/${format}`,
      entryFileNames: 'unis.js',
      format,
      sourcemap: true,
    }
  ],
  plugins: [
    uglify(),
    nodeResolve(),
    typescript({
      removeComments: true,
      outDir: `build/${format}`,
      tsconfig: './tsconfig.build.json'
    })
  ]
})

const config = [
  configGen('umd'),
  configGen('esm')
]

export default config