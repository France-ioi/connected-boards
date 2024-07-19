import esbuild from 'rollup-plugin-esbuild'

const bundle = config => ({
  ...config,
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id),
})

export default [
  bundle({
    plugins: [esbuild()],
    output: [
      {
        name: 'boardProgramming',
        file: `dist/index.js`,
        format: 'iife',
        sourcemap: false,
      },
    ],
  }),
]
