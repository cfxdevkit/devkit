# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# CAS backend — Turborepo-aware multi-stage ARM64-native build
#
# node:20-slim is required: better-sqlite3 ships prebuilt linux/arm64/glibc
# binaries for Node 20 (N-API v115). Node 22 (v127) has no prebuilts, forcing
# QEMU node-gyp compilation in CI which is unreliable. node:20-slim = Debian
# (glibc), which is required — Alpine (musl) has no arm64 prebuilts.
#
# Build (from monorepo root):
#   docker build -t cas-backend -f apps/cas/backend/Dockerfile .
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 0: prune ────────────────────────────────────────────────────────────
# turbo prune produces out/json/ (manifests) + out/full/ (sources) for the
# minimal workspace subset needed by @cfxdevkit/cas-backend and its workspace
# deps (@cfxdevkit/executor → core, contracts, protocol).
FROM node:20-slim AS pruner
WORKDIR /app
RUN npm install -g pnpm@10.11.0
COPY . .
RUN pnpm dlx turbo prune @cfxdevkit/cas-backend --docker

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

# Build tools required for native addon compilation (better-sqlite3, secp256k1).
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10.11.0

# Install from pruned manifests, then explicitly rebuild better-sqlite3 from
# source. npm rebuild (not pnpm) traverses transitive deps and ships node-gyp,
# so it compiles the native addon regardless of dep depth.
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
RUN npm rebuild better-sqlite3 --build-from-source

# Verify the binary was compiled (hard fail during build if missing)
RUN find /app/node_modules/.pnpm -name 'better_sqlite3.node' | grep . || \
    (echo 'ERROR: better_sqlite3.node was not compiled!' && exit 1)

# Copy source for all packages in the pruned subset and build in dep order.
# turbo respects "dependsOn": ["^build"] so executor and its deps build first.
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=@cfxdevkit/cas-backend

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:20-slim AS runtime

LABEL org.opencontainers.image.title="cas-backend" \
      org.opencontainers.image.description="Conflux Automation Studio API"

# Run from the original workspace path so pnpm symlinks resolve correctly:
#   backend/node_modules/dotenv → ../../../../node_modules/.pnpm/.../dotenv
#   (the compiled better_sqlite3.node lives inside the .pnpm virtual store)
WORKDIR /app/apps/cas/backend

COPY --from=builder /app/node_modules             /app/node_modules
COPY --from=builder /app/apps/cas/backend/node_modules ./node_modules
COPY --from=builder /app/apps/cas/backend/dist         ./dist
COPY --from=builder /app/apps/cas/backend/package.json ./package.json

RUN addgroup --system cas && adduser --system --ingroup cas cas
USER cas

ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
