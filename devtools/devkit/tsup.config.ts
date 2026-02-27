import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
  },
  format: ['esm'],
  dts: false,
  clean: true,
  sourcemap: false,
  splitting: false,
  minify: false,
  target: 'node20',
  shims: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
