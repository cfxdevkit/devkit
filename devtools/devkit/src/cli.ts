/**
 * conflux-devkit — CLI entry point
 *
 * Usage:
 *   npx conflux-devkit
 *   npx conflux-devkit --port 4200
 *   npx conflux-devkit --no-open
 */

import { createApp } from './server/index.js';

// ---- simple argument parser (avoids extra dep) ----
const args = process.argv.slice(2);

if (args.includes('-h') || args.includes('--help')) {
  console.log(`
conflux-devkit — Conflux local development environment

Usage:
  npx conflux-devkit [options]

Options:
  -p, --port <port>   Port for the web UI  (default: 4200)
  --no-open           Do not open the browser automatically
  -h, --help          Show this help message
`);
  process.exit(0);
}

function getArg(flag: string, short?: string): string | undefined {
  for (const [i, a] of args.entries()) {
    if ((a === flag || a === short) && args[i + 1]) return args[i + 1];
    if (a.startsWith(`${flag}=`)) return a.split('=')[1];
  }
  return undefined;
}

const port = Number.parseInt(getArg('--port', '-p') ?? '4200', 10);
const shouldOpen = !args.includes('--no-open');

const { start } = createApp({ port });

start()
  .then(async () => {
    const url = `http://localhost:${port}`;
    console.log(`\n  ✦  conflux-devkit  →  ${url}\n`);

    if (shouldOpen) {
      // dynamic import avoids bundling 'open' into the critical path
      const { default: open } = await import('open');
      await open(url);
    }
  })
  .catch((err: unknown) => {
    console.error('Failed to start conflux-devkit:', err);
    process.exit(1);
  });
