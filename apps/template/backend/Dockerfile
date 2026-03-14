# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# Template backend — multi-stage ARM64-native build
#
# Build (from monorepo root):
#   docker build -t template-backend -f apps/template/backend/Dockerfile .
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app

# Build tools required by better-sqlite3 → node-gyp
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json ./
COPY apps/template/backend/package.json ./apps/template/backend/

RUN pnpm install --frozen-lockfile --filter @cfxdevkit/template-backend

# Compile better-sqlite3 in the builder node_modules while Python is available.
RUN pnpm rebuild better-sqlite3

COPY apps/template/backend/ ./apps/template/backend/
RUN pnpm --filter @cfxdevkit/template-backend build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-slim AS runtime

LABEL org.opencontainers.image.title="template-backend" \
      org.opencontainers.image.description="Conflux DevKit Template API"

WORKDIR /app

# Copy node_modules directly from builder — the compiled better_sqlite3.node
# binary is already present there from the pnpm rebuild step above.
# (pnpm deploy performs a fresh install that skips build scripts, so the
# binary is absent in a deploy dir — skip deploy entirely.)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/template/backend/dist ./dist
COPY --from=builder /app/apps/template/backend/package.json ./

RUN addgroup --system template && adduser --system --ingroup template template
USER template

ENV NODE_ENV=production \
    PORT=3002 \
    HOST=0.0.0.0

EXPOSE 3002

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
