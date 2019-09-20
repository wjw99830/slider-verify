import ts from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/main.ts',
  plugins: [
    ts({
      tsconfigOverride: {
        compilerOptions: {
          declaration: false,
        },
      },
    }),
    process.env.NODE_ENV === 'production' && terser(),
  ],
  output: [{
    file: pkg.module.replace('.js', process.env.NODE_ENV === 'production' ? '.min.js' : '.js'),
    format: 'es',
  }, {
    file: pkg.main.replace('.js', process.env.NODE_ENV === 'production' ? '.min.js' : '.js'),
    format: 'cjs',
  }, {
    file: pkg.umd.replace('.js', process.env.NODE_ENV === 'production' ? '.min.js' : '.js'),
    format: 'umd',
    name: 'SliderVerify',
  }]
};
