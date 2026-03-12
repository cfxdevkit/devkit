#!/usr/bin/env node
/**
 * generate-api-docs.mjs
 *
 * Generates TypeDoc API reference markdown for every @cfxdevkit package and
 * wires up the Nextra _meta.js navigation files automatically.
 *
 * Usage:
 *   node docs-site/scripts/generate-api-docs.mjs
 *   # or via pnpm (from repo root):
 *   pnpm docs:api
 */

import { execSync } from 'child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '../..');
const DOCS_SITE = resolve(__dirname, '..');
const OUT = join(DOCS_SITE, 'content', 'api');

// ── Package registry ─────────────────────────────────────────────────────────

const PACKAGES = [
  {
    name: '@cfxdevkit/core',
    slug: 'core',
    entry: 'packages/core/src/index.ts',
  },
  {
    name: '@cfxdevkit/contracts',
    slug: 'contracts',
    entry: 'packages/contracts/src/index.ts',
  },
  {
    name: '@cfxdevkit/services',
    slug: 'services',
    entry: 'packages/services/src/index.ts',
  },
  {
    name: '@cfxdevkit/protocol',
    slug: 'protocol',
    entry: 'packages/protocol/src/index.ts',
  },
  {
    name: '@cfxdevkit/executor',
    slug: 'executor',
    entry: 'packages/executor/src/index.ts',
  },
  {
    name: '@cfxdevkit/wallet',
    slug: 'wallet',
    entry: 'packages/wallet/src/index.ts',
  },
  {
    name: '@cfxdevkit/compiler',
    slug: 'compiler',
    entry: 'packages/compiler/src/index.ts',
  },
  {
    name: '@cfxdevkit/devnode',
    slug: 'devnode',
    entry: 'packages/devnode/src/index.ts',
  },
  {
    name: '@cfxdevkit/react',
    slug: 'react',
    entry: 'packages/react/src/index.ts',
  },
  {
    name: '@cfxdevkit/defi-react',
    slug: 'defi-react',
    entry: 'packages/defi-react/src/index.ts',
  },
  {
    name: '@cfxdevkit/wallet-connect',
    slug: 'wallet-connect',
    entry: 'packages/wallet-connect/src/index.ts',
  },
];

// TypePrefix → sidebar section title
const TYPE_SECTIONS = [
  { prefix: 'Class', title: 'Classes' },
  { prefix: 'Interface', title: 'Interfaces' },
  { prefix: 'TypeAlias', title: 'Type Aliases' },
  { prefix: 'Function', title: 'Functions' },
  { prefix: 'Variable', title: 'Variables' },
  { prefix: 'Enumeration', title: 'Enumerations' },
];

const TYPEDOC_BIN = join(DOCS_SITE, 'node_modules', 'typedoc', 'bin', 'typedoc');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * TypeDoc --flattenOutputFiles generates names like `Class.ClientManager.md`.
 * Dots in Next.js App Router route segments cause Nextra to drop the parent
 * folder segment, producing broken links like `/api/Class.ClientManager`
 * instead of `/api/core/Class.ClientManager`.
 *
 * This function:
 *  1. Rewrites cross-reference links in all .md files
 *     `Type.Name.md`  → `Type-Name.md`
 *     `README.md`     → `index.md`  (TypeDoc breadcrumb links)
 *  2. Renames every `Type.Name.md` file → `Type-Name.md`
 */
function fixDotSlugs(pkgOut) {
  const TYPE_PREFIXES =
    'Class|Interface|TypeAlias|Function|Variable|Enumeration';
  const LINK_RE = new RegExp(
    `(${TYPE_PREFIXES})\\.([^)"\\s]+\\.md)`,
    'g',
  );

  const files = readdirSync(pkgOut).filter((f) => f.endsWith('.md'));

  // Step 1 — rewrite links inside every file before renaming
  for (const file of files) {
    const path = join(pkgOut, file);
    const original = readFileSync(path, 'utf8');
    let rewritten = original
      // Type.Name.md → Type-Name.md
      .replace(LINK_RE, (_, type, rest) => `${type}-${rest}`)
      // README.md → index.md (TypeDoc breadcrumb links)
      .replace(/\(README\.md\)/g, '(index.md)');
    if (rewritten !== original) writeFileSync(path, rewritten);
  }

  // Step 2 — rename the files themselves
  for (const file of files) {
    const match = file.match(
      new RegExp(`^(${TYPE_PREFIXES})\\.(.+\\.md)$`),
    );
    if (match) {
      renameSync(join(pkgOut, file), join(pkgOut, `${match[1]}-${match[2]}`));
    }
  }
}

function run(cmd, opts = {}) {
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
}

/**
 * Build a Nextra _meta.js object for a single package output directory.
 * Groups symbols by their TypeDoc file prefix (Class., Function., etc.)
 * and inserts visual separators between groups.
 */
function buildMetaForPackage(pkgOut) {
  const files = readdirSync(pkgOut)
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .map((f) => f.replace(/\.md$/, ''));

  const meta = { index: 'Overview' };

  for (const { prefix, title } of TYPE_SECTIONS) {
    // Files are now named `Class-Foo.md` (hyphen separator, not dot)
    const members = files
      .filter((f) => f.startsWith(`${prefix}-`))
      .sort((a, b) => a.localeCompare(b));

    if (members.length === 0) continue;

    meta[`_sep_${prefix.toLowerCase()}`] = {
      type: 'separator',
      title,
    };

    for (const slug of members) {
      const displayName = slug.replace(/^[^-]+-/, ''); // strip "Class-" prefix
      meta[slug] = displayName;
    }
  }

  return meta;
}

function writeMetaJs(targetDir, metaObj) {
  const lines = Object.entries(metaObj).map(([k, v]) => {
    if (typeof v === 'string') {
      return `  '${k}': '${v}',`;
    }
    // Separator object
    return `  '${k}': { type: '${v.type}', title: '${v.title}' },`;
  });

  const content = `// Auto-generated by docs-site/scripts/generate-api-docs.mjs
// Do not edit manually — re-run \`pnpm docs:api\` to regenerate.
export default {\n${lines.join('\n')}\n};\n`;
  writeFileSync(join(targetDir, '_meta.js'), content);
}

// ── Main ─────────────────────────────────────────────────────────────────────

mkdirSync(OUT, { recursive: true });

const apiMeta = {
  index: 'Overview',
};

for (const pkg of PACKAGES) {
  const pkgOut = join(OUT, pkg.slug);
  mkdirSync(pkgOut, { recursive: true });

  console.log(`\n📦 Generating API docs for ${pkg.name}…`);

  run(
    [
      'node',
      TYPEDOC_BIN,
      '--plugin',
      'typedoc-plugin-markdown',
      '--out',
      pkgOut,
      '--entryPoints',
      pkg.entry,
      '--tsconfig',
      'tsconfig.base.json',
      '--name',
      `"${pkg.name}"`,
      '--excludePrivate',
      '--excludeInternal',
      '--skipErrorChecking',
      '--readme',
      'none',
      '--flattenOutputFiles',
      '--githubPages',
      'false',
      '--hidePageTitle',
      'false',
    ].join(' '),
  );

  // TypeDoc outputs README.md as the overview page — rename to index.md
  // so Nextra treats it as the folder index.
  const readme = join(pkgOut, 'README.md');
  const index = join(pkgOut, 'index.md');
  if (existsSync(readme)) {
    renameSync(readme, index);
  }

  // Rename Type.Name.md → Type-Name.md and rewrite cross-links.
  // Dots in Next.js App Router route segments cause Nextra to drop the
  // parent folder segment, producing /api/Class.Foo instead of /api/core/Class.Foo.
  fixDotSlugs(pkgOut);

  writeMetaJs(pkgOut, buildMetaForPackage(pkgOut));

  apiMeta[pkg.slug] = pkg.name;
  console.log(`   ✓ ${pkg.name}`);
}

// Write the top-level api/_meta.js
writeMetaJs(OUT, apiMeta);

console.log('\n✅  API reference generation complete.\n');
