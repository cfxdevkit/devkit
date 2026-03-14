# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# CAS backend — Turborepo-aware multi-stage ARM64-native build
#
# Build (from monorepo root):
#   docker build -t cas-backend -f apps/cas/backend/Dockerfile .
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 0: prune ────────────────────────────────────────────────────────────
# turbo prune produces out/json/ (manifests) + out/full/ (sources) for the
# minimal workspace subset that includes @cfxdevkit/executor and its deps.
# Without this, pnpm deploy can't resolve workspace:* references.
FROM node:22-slim AS pruner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
COPY . .
RUN pnpm dlx turbo prune @cfxdevkit/cas-backend --docker

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app

# Build tools required by better-sqlite3 → node-gyp
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Install from pruned manifests (all workspace package.json files present)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Compile better-sqlite3 in the builder node_modules while Python is available.
# (Removed from onlyBuiltDependencies so Vercel frontend installs don't fail.)
RUN pnpm rebuild better-sqlite3

# Copy source and build
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @cfxdevkit/cas-backend build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-slim AS runtime

LABEL org.opencontainers.image.title="cas-backend" \
      org.opencontainers.image.description="Conflux Automation Studio API"

WORKDIR /app

# Copy node_modules directly from builder — the compiled better_sqlite3.node
# binary is already present there from the pnpm rebuild step above.
# (pnpm deploy performs a fresh install that skips build scripts, so the
# binary is absent in a deploy dir — skip deploy entirely.)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/cas/backend/dist ./dist
COPY --from=builder /app/apps/cas/backend/package.json ./

RUN addgroup --system cas && adduser --system --ingroup cas cas
USER cas

ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
