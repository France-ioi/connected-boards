import swc from '@rollup/plugin-swc';
import nodeResolve from "@rollup/plugin-node-resolve";
import styles from 'rollup-plugin-styles';
import image from '@rollup/plugin-image';

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
          "target": "es5",
        },
      },
      include: ['src/**/*.{ts,js}'],
    }),
    styles({
      mode: 'extract',
    }),
    image(),
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