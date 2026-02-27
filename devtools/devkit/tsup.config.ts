import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
  },
  // CJS format: required for correct interop with CJS-only packages that use
  // dynamic require() of Node built-ins (e.g. solc → memorystream → require('stream')).
  // ESM bundles produced by esbuild stub out dynamic require() and break these.
  format: ['cjs'],
  dts: false,
  clean: true,
  sourcemap: false,
  splitting: false,
  minify: false,
  target: 'node20',
  // Shim not needed for CJS; keep the shebang so the binary is directly executable.
  banner: {
    js: '#!/usr/bin/env node',
  },
  // Bundle all @cfxdevkit/* workspace packages into the single CLI output so the
  // published npm package can run standalone without requiring those sibling
  // packages to be separately published or installed.
  // Third-party deps (express, socket.io, viem, cive, @xcfx/node, etc.) remain
  // external — they are listed in package.json "dependencies" and are installed
  // by npm/pnpm when the package is consumed.
  noExternal: [/^@cfxdevkit\//],
});
