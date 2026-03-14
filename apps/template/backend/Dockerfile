# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# Template backend — multi-stage ARM64-native build
#
# node:20-slim is required: better-sqlite3 ships prebuilt linux/arm64/glibc
# binaries for Node 20 (N-API v115). Node 22 (v127) has no prebuilts, forcing
# QEMU node-gyp compilation in CI which is unreliable.
#
# Build (from monorepo root):
#   docker build -t template-backend -f apps/template/backend/Dockerfile .
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

# Build tools for native addons (secp256k1, etc.).
# better-sqlite3 uses a prebuilt arm64 binary on node 20 — no compilation needed.
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10.11.0

# Copy all workspace member package.json stubs so pnpm can correctly resolve
# the workspace layout from pnpm-workspace.yaml and pnpm-lock.yaml.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY tsconfig.base.json ./
COPY packages/compiler/package.json      ./packages/compiler/package.json
COPY packages/contracts/package.json     ./packages/contracts/package.json
COPY packages/core/package.json          ./packages/core/package.json
COPY packages/defi-react/package.json    ./packages/defi-react/package.json
COPY packages/devnode/package.json       ./packages/devnode/package.json
COPY packages/executor/package.json      ./packages/executor/package.json
COPY packages/protocol/package.json      ./packages/protocol/package.json
COPY packages/react/package.json         ./packages/react/package.json
COPY packages/services/package.json      ./packages/services/package.json
COPY packages/theme/package.json         ./packages/theme/package.json
COPY packages/wallet/package.json        ./packages/wallet/package.json
COPY packages/wallet-connect/package.json ./packages/wallet-connect/package.json
COPY devtools/contracts/package.json     ./devtools/contracts/package.json
COPY devtools/devkit/package.json        ./devtools/devkit/package.json
COPY devtools/devkit-ui/package.json     ./devtools/devkit-ui/package.json
COPY docs-site/package.json              ./docs-site/package.json
COPY apps/cas/backend/package.json       ./apps/cas/backend/package.json
COPY apps/cas/frontend/package.json      ./apps/cas/frontend/package.json
COPY apps/template/backend/package.json  ./apps/template/backend/package.json
COPY apps/template/frontend/package.json ./apps/template/frontend/package.json

# Install deps for the template backend only.
# npm_config_build_from_source skips the prebuild-install download entirely
# and goes straight to node-gyp compilation — necessary because under QEMU
# the prebuild-install download either fails or downloads an incompatible binary.
RUN npm_config_build_from_source=true pnpm install --frozen-lockfile --filter @cfxdevkit/template-backend

# Verify the binary was actually compiled (fail loudly during build if not)
RUN find /app/node_modules/.pnpm -name 'better_sqlite3.node' | grep . || \
    (echo 'ERROR: better_sqlite3.node was not compiled!' && exit 1)

COPY apps/template/backend/ ./apps/template/backend/
RUN pnpm --filter @cfxdevkit/template-backend build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:20-slim AS runtime

LABEL org.opencontainers.image.title="template-backend" \
      org.opencontainers.image.description="Conflux DevKit Template API"

# Run from the original workspace path so pnpm symlinks resolve correctly:
#   backend/node_modules/dotenv → ../../../../node_modules/.pnpm/.../dotenv
#   (the compiled better_sqlite3.node lives inside the .pnpm virtual store)
WORKDIR /app/apps/template/backend

COPY --from=builder /app/node_modules                         /app/node_modules
COPY --from=builder /app/apps/template/backend/node_modules   ./node_modules
COPY --from=builder /app/apps/template/backend/dist           ./dist
COPY --from=builder /app/apps/template/backend/package.json   ./package.json

RUN addgroup --system template && adduser --system --ingroup template template
USER template

ENV NODE_ENV=production \
    PORT=3002 \
    HOST=0.0.0.0

EXPOSE 3002

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
