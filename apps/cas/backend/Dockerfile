# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# CAS backend — multi-stage ARM64-native build
#
# Build:
#   docker build -t cas-backend -f apps/cas/backend/Dockerfile .
#
# Run:
#   docker run --rm -p 3001:3001 -e CAS_API_KEY=secret cas-backend
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Install build tools required by native modules (better-sqlite3 → node-gyp)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Copy workspace manifests first for layer-cache efficiency
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json ./
COPY apps/cas/backend/package.json ./apps/cas/backend/

RUN pnpm install --frozen-lockfile --filter @cfxdevkit/cas-backend

# Compile better-sqlite3 native binding (not compiled during install —
# removed from onlyBuiltDependencies so Vercel frontend builds don't break)
RUN pnpm rebuild better-sqlite3

COPY apps/cas/backend/ ./apps/cas/backend/

RUN pnpm --filter @cfxdevkit/cas-backend build

# Create a production-only flat bundle (includes compiled native bindings)
RUN pnpm deploy --filter @cfxdevkit/cas-backend --prod --legacy /app/deploy

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-slim AS runtime

LABEL org.opencontainers.image.title="cas-backend" \
      org.opencontainers.image.description="Conflux Automation Studio API"

WORKDIR /app

# Copy production node_modules from deploy bundle (includes compiled better-sqlite3)
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
