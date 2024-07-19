import swc from '@rollup/plugin-swc';
import nodeResolve from "@rollup/plugin-node-resolve";

const bundle = config => ({
  ...config,
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id),
})

export default [
  bundle({
    plugins: [
      nodeResolve({
        extensions: ['.ts'],
      }),
      swc({
        swc: {
          "jsc": {
            "parser": {
              "syntax": "typescript"
            },
            "target": "es5"
          },
        },
        include: ['src/**/*.{ts,js}'],
      }),
    ],
    output: [
      {
        name: 'boardProgramming',
        file: `dist/index.js`,
        format: 'iife',
        sourcemap: false,
        strict: false,
      },
    ],
  }),
]
