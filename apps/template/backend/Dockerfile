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

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Copy workspace manifests first for layer-cache efficiency
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json ./
COPY apps/template/backend/package.json ./apps/template/backend/

RUN pnpm install --frozen-lockfile --filter @cfxdevkit/template-backend

COPY apps/template/backend/ ./apps/template/backend/

RUN pnpm --filter @cfxdevkit/template-backend build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-slim AS runtime

LABEL org.opencontainers.image.title="template-backend" \
      org.opencontainers.image.description="Conflux DevKit Template API"

WORKDIR /app

# Only production deps
COPY --from=builder /app/apps/template/backend/package.json ./
RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app/apps/template/backend/dist ./dist

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
