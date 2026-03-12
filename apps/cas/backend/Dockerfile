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

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Copy workspace manifests first for layer-cache efficiency
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json ./
COPY apps/cas/backend/package.json ./apps/cas/backend/

RUN pnpm install --frozen-lockfile --filter @cfxdevkit/cas-backend

COPY apps/cas/backend/ ./apps/cas/backend/

RUN pnpm --filter @cfxdevkit/cas-backend build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-slim AS runtime

LABEL org.opencontainers.image.title="cas-backend" \
      org.opencontainers.image.description="Conflux Automation Studio API"

WORKDIR /app

# Only production deps
COPY --from=builder /app/apps/cas/backend/package.json ./
RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app/apps/cas/backend/dist ./dist

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
