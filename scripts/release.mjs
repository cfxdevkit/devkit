#!/usr/bin/env node
/**
 * Release script — bumps all publishable package versions, commits, tags, and pushes.
 *
 * Usage:
 *   pnpm release patch          # 0.1.0 → 0.1.1
 *   pnpm release minor          # 0.1.0 → 0.2.0
 *   pnpm release major          # 0.1.0 → 1.0.0
 *   pnpm release 1.2.3          # set exact version
 *   pnpm release patch --dry-run  # preview without writing anything
 *
 * What it does:
 *   1. Computes the new version from the canonical version (packages/core)
 *   2. Rewrites the "version" field in every publishable package.json
 *   3. Rewrites the root package.json version to match
 *   4. git commit "chore: release vX.Y.Z"
 *   5. git tag vX.Y.Z
 *   6. git push origin HEAD + tag  (triggers the GitHub Actions release workflow)
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ── Publishable packages (all get the same version) ──────────────────────────
const PUBLISHABLE = [
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
  'devtools/devkit',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(relPath) {
  return JSON.parse(readFileSync(resolve(ROOT, relPath), 'utf8'));
}

function writeJson(relPath, data) {
  // Preserve trailing newline and 2-space indent (matches existing files)
  writeFileSync(resolve(ROOT, relPath), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function bumpVersion(current, type) {
  const [major, minor, patch] = current.split('.').map(Number);
  switch (type) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
    default: return null; // not a bump type — might be an explicit version
  }
}

function isValidSemver(v) {
  return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(v);
}

function run(cmd, dryRun = false) {
  if (dryRun) {
    console.log(`[dry-run] ${cmd}`);
    return;
  }
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

// ── Main ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const input = args.find((a) => !a.startsWith('--'));

if (!input) {
  console.error('Usage: pnpm release <patch|minor|major|x.y.z> [--dry-run]');
  process.exit(1);
}

// Canonical version = highest version across all publishable packages
// (avoids accidentally "downgrading" a package that's already ahead)
const versions = PUBLISHABLE.map((d) => readJson(`${d}/package.json`).version);
function semverCompare(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) > (pb[i] ?? 0) ? 1 : -1;
  }
  return 0;
}
const currentVersion = [...versions].sort(semverCompare).at(-1);

let newVersion = bumpVersion(currentVersion, input);
if (!newVersion) {
  // Not a bump keyword — treat as explicit version
  newVersion = input;
}

if (!isValidSemver(newVersion)) {
  console.error(`Invalid version: "${newVersion}". Use patch/minor/major or a semver string.`);
  process.exit(1);
}

if (newVersion === currentVersion) {
  console.error(`New version (${newVersion}) is the same as current (${currentVersion}). Nothing to do.`);
  process.exit(1);
}

console.log(`\nBumping: ${currentVersion} → ${newVersion}${dryRun ? ' [dry-run]' : ''}\n`);

// 1. Update all publishable package.json files
for (const pkgDir of PUBLISHABLE) {
  const pkgPath = `${pkgDir}/package.json`;
  const pkg = readJson(pkgPath);
  const prev = pkg.version;
  pkg.version = newVersion;
  if (!dryRun) writeJson(pkgPath, pkg);
  console.log(`  ${pkg.name.padEnd(35)} ${prev} → ${newVersion}`);
}

// 2. Update root package.json (keeps monorepo in lockstep)
const rootPkg = readJson('package.json');
const rootPrev = rootPkg.version;
rootPkg.version = newVersion;
if (!dryRun) writeJson('package.json', rootPkg);
console.log(`  ${'(root monorepo)'.padEnd(35)} ${rootPrev} → ${newVersion}`);

console.log('');

// 3. Commit, tag, push
const tag = `v${newVersion}`;
const commitMsg = `chore: release ${tag}`;

run(`git add ${PUBLISHABLE.map((p) => `${p}/package.json`).join(' ')} package.json`, dryRun);
run(`git commit -m "${commitMsg}"`, dryRun);
run(`git tag ${tag}`, dryRun);
run('git push origin HEAD', dryRun);
run(`git push origin ${tag}`, dryRun);

console.log(`\n✓ ${tag} released — GitHub Actions will publish to npm\n`);
