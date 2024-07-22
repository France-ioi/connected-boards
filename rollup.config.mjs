import swc from '@rollup/plugin-swc';
import nodeResolve from "@rollup/plugin-node-resolve";
import styles from 'rollup-plugin-styles';

export default {
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id),
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
          "target": "esnext" // TODO: put back es5
        },
      },
      include: ['src/**/*.{ts,js}'],
    }),
    styles({
      mode: 'extract',
    }),
  ],
  output: [
    {
      name: 'boardProgramming',
      file: `dist/index.js`,
      format: 'iife',
      sourcemap: false,
      strict: false,
      assetFileNames: "[name][extname]",
    },
  ],
}