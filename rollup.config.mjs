import swc from '@rollup/plugin-swc';
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from '@rollup/plugin-replace';
import styles from 'rollup-plugin-styles';
import image from '@rollup/plugin-image';

export default {
  input: 'src/index.ts',
  external: [
    "react",
    "react-dom",
    "react-dom/client",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
  ],
  plugins: [
    nodeResolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      browser: true,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      preventAssignment: true,
    }),
    commonjs(),
    swc({
      swc: {
        "jsc": {
          "parser": {
            "syntax": "typescript",
            "tsx": true
          },
          "transform": {
            "react": {
              "runtime": "classic",
            }
          },
          "target": "es2015",
        },
      },
      include: ['src/**/*.{ts,js,tsx,jsx}'],
    }),
    styles({
      mode: 'extract',
    }),
    image(),
  ],
  output: [
    {
      name: 'boardProgramming',
      file: "dist/index.js",
      format: "umd",
      sourcemap: false,
      strict: true,
      assetFileNames: "[name][extname]",
      globals: {
        react: "React",
        "react-dom": "ReactDOM",
        "react-dom/client": "ReactDOM",
        "react/jsx-runtime": "ReactJSXRuntimeDev",
        "react/jsx-dev-runtime": "ReactJSXRuntimeDev"
      }
    }
  ],
}