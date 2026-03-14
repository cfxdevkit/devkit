# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# Template backend — multi-stage ARM64-native build
#
# Build (from monorepo root):
#   docker build -t template-backend -f apps/template/backend/Dockerfile .
#
# Run:
#   docker run --rm -p 3002:3002 -e JWT_SECRET=secret template-backend
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
COPY apps/template/backend/package.json ./apps/template/backend/

RUN pnpm install --frozen-lockfile --filter @cfxdevkit/template-backend

# Compile better-sqlite3 native binding (not compiled during install —
# removed from onlyBuiltDependencies so Vercel frontend builds don't break)
RUN pnpm rebuild better-sqlite3

COPY apps/template/backend/ ./apps/template/backend/

RUN pnpm --filter @cfxdevkit/template-backend build

# Create a production-only flat bundle (includes compiled native bindings)
RUN pnpm deploy --filter @cfxdevkit/template-backend --prod --legacy /app/deploy

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-slim AS runtime

LABEL org.opencontainers.image.title="template-backend" \
      org.opencontainers.image.description="Conflux DevKit Template API"

WORKDIR /app

# Copy production node_modules from deploy bundle (includes compiled better-sqlite3)
COPY --from=builder /app/deploy/node_modules ./node_modules
COPY --from=builder /app/apps/template/backend/dist ./dist
COPY --from=builder /app/apps/template/backend/package.json ./

# Non-root user
RUN addgroup --system template && adduser --system --ingroup template template
USER template

ENV NODE_ENV=production \
    PORT=3002 \
    HOST=0.0.0.0

EXPOSE 3002

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
