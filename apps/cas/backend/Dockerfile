# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# CAS backend — Turborepo-aware multi-stage ARM64-native build
#
# Build (from monorepo root):
#   docker build -t cas-backend -f apps/cas/backend/Dockerfile .
#
# Run:
#   docker run --rm -p 3001:3001 -e CAS_API_KEY=secret cas-backend
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 0: prune ────────────────────────────────────────────────────────────
# turbo prune creates a minimal workspace subset containing only the packages
# needed for @cfxdevkit/cas-backend (including @cfxdevkit/executor and its
# transitive workspace deps). Without this, pnpm deploy --legacy fails with
# ERR_PNPM_WORKSPACE_PKG_NOT_FOUND when trying to resolve workspace:* deps.
FROM node:22-slim AS pruner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
COPY . .
RUN pnpm dlx turbo prune @cfxdevkit/cas-backend --docker

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Build tools for native modules (better-sqlite3 → node-gyp)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Install deps from the pruned manifest set (all needed package.json files present)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Compile better-sqlite3 native binding (not in onlyBuiltDependencies so
# Vercel frontend builds don't fail — rebuild explicitly here where Python exists)
RUN pnpm rebuild better-sqlite3

# Copy full pruned source tree and build the app
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @cfxdevkit/cas-backend build

# Create prod bundle — workspace deps resolvable now that prune provided them
RUN pnpm deploy --filter @cfxdevkit/cas-backend --prod --legacy /app/deploy

# Re-compile better-sqlite3 in the deploy dir (pnpm deploy re-installs from
# the content-addressable store into a new location; binary needs a rebuild)
WORKDIR /app/deploy
RUN pnpm rebuild better-sqlite3
WORKDIR /app

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-slim AS runtime

LABEL org.opencontainers.image.title="cas-backend" \
      org.opencontainers.image.description="Conflux Automation Studio API"

WORKDIR /app

# Copy production node_modules (includes compiled better-sqlite3) + built app
COPY --from=builder /app/deploy/node_modules ./node_modules
COPY --from=builder /app/apps/cas/backend/dist ./dist
COPY --from=builder /app/apps/cas/backend/package.json ./

# Non-root user
RUN addgroup --system cas && adduser --system --ingroup cas cas
USER cas

ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
