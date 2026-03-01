#!/usr/bin/env node
/**
 * scripts/setup-npm-trust.mjs
 *
 * One-time setup script for npm Trusted Publishing (OIDC).
 *
 * Run this ONCE from a local machine where you are logged in via `npm login`
 * (must be a user with write access to the @cfxdevkit npm organisation and
 * with 2FA enabled at the account level).
 *
 * What it does:
 *   1. Publishes every package that does NOT yet exist on the registry
 *      (first publish requires a real token — OIDC alone cannot create a
 *       new package).
 *   2. Calls `npm trust github <pkg>` for every publishable package so that
 *      the GitHub Actions release workflow can subsequently publish using
 *      OIDC without any stored npm token.
 *
 * Usage:
 *   npm login          # log in as an owner of the @cfxdevkit npm scope
 *   pnpm build         # ensure dist/ is up-to-date (already done if you ran pnpm release)
 *   node scripts/setup-npm-trust.mjs
 *   # or: node scripts/setup-npm-trust.mjs --dry-run   (preview only)
 *
 * Prerequisites (per npm docs):
 *   • npm ≥ 11.10.0   (this devcontainer has 11.11.0 ✓)
 *   • 2FA enabled on the publishing npm account
 *   • Write access to every @cfxdevkit/* package
 *
 * 2FA browser-auth flow (one per package):
 *   Each `npm trust github` call prints a URL like:
 *     https://www.npmjs.com/auth/cli/<id>
 *   Open it in a browser, approve with your 2FA app/authenticator, and the
 *   command will complete automatically via polling.
 *   If running inside a devcontainer without a browser, copy the URL and open
 *   it on the host machine. There are 12 packages — you will need to do this
 *   12 × (one per trust command, but each only takes ~10–30 s to confirm).
 */

import { execSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DRY_RUN = process.argv.includes('--dry-run');
// --revoke-and-recreate <pkg>  — delete all existing trust entries for ONE
//   package and add a fresh one.  Use this when a pre-existing trust entry
//   may have hidden constraints (e.g. an `environment` field) that cause the
//   OIDC exchange to fail in CI.
//   Example: node scripts/setup-npm-trust.mjs --revoke-and-recreate @cfxdevkit/compiler
const REVOKE_IDX = process.argv.indexOf('--revoke-and-recreate');
const REVOKE_PKG = REVOKE_IDX !== -1 ? process.argv[REVOKE_IDX + 1] : null;

// ── Config ────────────────────────────────────────────────────────────────────
const GITHUB_REPO = 'cfxdevkit/devkit'; // owner/repo
const WORKFLOW_FILE = 'release.yml'; // .github/workflows/<file>

// Library packages published under packages/*/
const LIB_PACKAGES = [
  'packages/compiler',
  'packages/contracts',
  'packages/core',
  'packages/defi-react',
  'packages/devnode',
  'packages/executor',
  'packages/protocol',
  'packages/react',
  'packages/services',
  'packages/wallet',
  'packages/wallet-connect',
];

// CLI tool (workspace:* deps must be packed first, then published)
const CLI_DIR = 'devtools/devkit';

// ── Helpers ───────────────────────────────────────────────────────────────────

function run(cmd, { cwd = ROOT, allowFail = false } = {}) {
  if (DRY_RUN) {
    console.log(`[dry-run] ${cmd}`);
    return '';
  }
  try {
    return execSync(cmd, {
      cwd,
      stdio: ['inherit', 'pipe', 'inherit'],
      encoding: 'utf8',
    }).trim();
  } catch (err) {
    if (allowFail) return null;
    throw err;
  }
}

/**
 * Run cmd with full stdio inheritance — required for `npm trust github` so
 * that the browser-auth URL is visible and npm can poll for 2FA confirmation.
 */
function runInteractive(cmd, { cwd = ROOT } = {}) {
  if (DRY_RUN) {
    console.log(`[dry-run] ${cmd}`);
    return 0;
  }
  const [bin, ...args] = cmd.split(' ');
  const result = spawnSync(bin, args, { cwd, stdio: 'inherit', shell: true });
  return result.status ?? 1;
}

function pkgName(relDir) {
  return JSON.parse(readFileSync(resolve(ROOT, relDir, 'package.json'), 'utf8'))
    .name;
}

function packageExists(name) {
  try {
    execSync(`npm view "${name}" version`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// ── --revoke-and-recreate: delete old entry then add fresh one ────────────────

if (REVOKE_PKG) {
  console.log(`\n=== Revoke & recreate trust for ${REVOKE_PKG} ===\n`);

  // Get existing trust IDs from text output (one block per entry, "id: <uuid>")
  let trustText = '';
  try {
    trustText = execSync(`npm trust list "${REVOKE_PKG}"`, {
      stdio: 'pipe',
      encoding: 'utf8',
    });
  } catch {
    /* no entries */
  }

  const ids = [...trustText.matchAll(/^id:\s*(.+)$/gm)].map((m) => m[1].trim());

  if (ids.length === 0) {
    console.log(
      `  No existing trust entries found for ${REVOKE_PKG} — nothing to revoke.`
    );
  } else {
    for (const id of ids) {
      console.log(`  −  Revoking entry ${id}…`);
      console.log(
        `\n     npm will open a 2FA URL — open it in your browser to confirm.\n`
      );
      const code = runInteractive(
        `npm trust revoke "${REVOKE_PKG}" "${id}" --yes`
      );
      if (code !== 0) {
        console.error(`  ✗  Revoke failed (exit ${code}). Aborting.`);
        process.exit(1);
      }
      console.log(`     revoked ✓`);
    }
  }

  console.log(`\n  +  Adding fresh trust for ${REVOKE_PKG}…`);
  console.log(
    `\n     npm will open a 2FA URL — open it in your browser to confirm.\n`
  );
  const addCode = runInteractive(
    `npm trust github "${REVOKE_PKG}" --repository ${GITHUB_REPO} --file ${WORKFLOW_FILE} --yes`
  );
  if (addCode !== 0) {
    console.error(`  ✗  Trust add failed (exit ${addCode}).`);
    process.exit(1);
  }
  console.log(`  ✓  Trust recreated for ${REVOKE_PKG}\n`);
  process.exit(0);
}

// ── Step 1: Initial publish for packages that don't exist yet ─────────────────

console.log('\n=== Step 1: Initial publish (new packages only) ===\n');

for (const dir of LIB_PACKAGES) {
  const name = pkgName(dir);
  const exists = packageExists(name);
  if (exists) {
    console.log(`  ✓  ${name} — already exists, skipping publish`);
    continue;
  }
  console.log(`  ↑  ${name} — does not exist, publishing…`);
  run(`npm publish "${resolve(ROOT, dir)}" --access public`);
  console.log(`     published ✓`);
}

// CLI: pack first so workspace:* → real semver, then publish
{
  const cliName = pkgName(CLI_DIR);
  const cliExists = packageExists(cliName);
  if (cliExists) {
    console.log(`  ✓  ${cliName} — already exists, skipping publish`);
  } else {
    console.log(`  ↑  ${cliName} — does not exist, packing + publishing…`);
    run(`pnpm pack --pack-destination ${ROOT}`, {
      cwd: resolve(ROOT, CLI_DIR),
    });
    const tarball = execSync(`ls ${ROOT}/conflux-devkit-*.tgz`, {
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .at(-1);
    run(`npm publish "${tarball}" --access public`);
    run(`rm -f "${tarball}"`);
    console.log(`     published ✓`);
  }
}

// ── Step 2: Register trusted publishers ──────────────────────────────────────

console.log('\n=== Step 2: Register GitHub Actions as trusted publisher ===\n');

const allPackageDirs = [...LIB_PACKAGES, CLI_DIR];

for (const dir of allPackageDirs) {
  const name = pkgName(dir);
  // Check if a trust relationship already exists for this workflow
  let existing = '';
  try {
    existing = execSync(`npm trust list "${name}" --json`, {
      stdio: 'pipe',
      encoding: 'utf8',
    });
  } catch {
    /* package might not have any trust entries */
  }

  const alreadyConfigured =
    existing.includes(WORKFLOW_FILE) && existing.includes(GITHUB_REPO);
  if (alreadyConfigured) {
    console.log(`  ✓  ${name} — trust already configured`);
    continue;
  }

  console.log(`  +  ${name} — adding trust…`);
  console.log(
    `\n     npm will open a 2FA URL — open it in your browser to confirm.\n`
  );
  const exitCode = runInteractive(
    `npm trust github "${name}" --repository ${GITHUB_REPO} --file ${WORKFLOW_FILE} --yes`
  );
  if (exitCode !== 0) {
    console.error(
      `\n  ✗  ${name} — trust command exited with code ${exitCode}`
    );
    console.error(`     Re-run the script to retry failed packages.\n`);
  } else {
    console.log(`     trust added ✓`);
  }
}

console.log(`
=== Done${DRY_RUN ? ' (dry-run)' : ''} ===

All packages are now registered for OIDC Trusted Publishing.
The GitHub Actions workflow (${WORKFLOW_FILE}) can publish to npm
without any stored NPM_TOKEN secret. Push a tag to release:

  pnpm release patch   # bumps version, commits, tags, pushes → CI publishes
`);
