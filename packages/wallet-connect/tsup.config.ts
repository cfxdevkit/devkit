import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    // Server-safe subpath: wagmi-only, no connectkit/WalletConnect.
    // Safe to import in Next.js Server Components and Edge runtime.
    server: 'src/server.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  minify: false,
  external: ['react', 'react-dom', '@cfxdevkit/core'],
  esbuildOptions: (options) => {
    options.jsx = 'automatic';
  },
});
