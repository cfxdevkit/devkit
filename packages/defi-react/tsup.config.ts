import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  minify: false,
  external: ['react', 'react-dom', 'viem'],
  esbuildOptions: (options) => {
    options.jsx = 'automatic';
  },
});
