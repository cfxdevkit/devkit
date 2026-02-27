import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'services/index': 'src/services/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  minify: false,
  external: ['cive', 'viem', 'react', 'react-dom'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
