/**
 * copy-ui.mjs
 *
 * Copies the pre-built Next.js static export from devtools/devkit-ui/out
 * into devtools/devkit/ui/out so it gets bundled into the npm package.
 *
 * This script runs as the first step of `pnpm build` in devtools/devkit/.
 * Turbo guarantees devtools/devkit-ui is built first (via the devDependency
 * on "conflux-devkit-ui": "workspace:*").
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', '..', 'devkit-ui', 'out');
const destDir = join(__dirname, '..', 'ui', 'out');

if (!existsSync(srcDir)) {
  console.warn(
    `⚠  UI output not found at ${srcDir}. Skipping copy.\n` +
      `   Run: pnpm --filter conflux-devkit-ui build`
  );
  // Don't fail — TypeScript-only builds still work; UI simply won't be served.
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
cpSync(srcDir, destDir, { recursive: true, force: true });
console.log(`✔  UI copied from ${srcDir} → ${destDir}`);
