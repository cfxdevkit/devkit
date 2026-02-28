# syntax=docker/dockerfile:1
# ──────────────────────────────────────────────────────────────────────────────
# conflux-devkit — standalone Docker image
#
# Supported platforms: linux/amd64  (linux/arm64 coming when @xcfx/node
# publishes an arm64 linux binary)
#
# Build:
#   docker build -t conflux-devkit -f docker/Dockerfile .
#
# Run:
#   docker run --rm -p 7748:7748 -p 8545:8545 -p 8546:8546 \
#              -p 12537:12537 -p 12535:12535 \
#              -v conflux-devkit-data:/root/.conflux-devkit \
#              conflux-devkit
# ──────────────────────────────────────────────────────────────────────────────

FROM --platform=linux/amd64 node:22-slim

LABEL org.opencontainers.image.title="conflux-devkit" \
      org.opencontainers.image.description="Conflux local development environment" \
      org.opencontainers.image.source="https://github.com/cfxdevkit/devkit"

# Install conflux-devkit globally from npm.
# Pin to the exact version that was current when this Dockerfile was written;
# change the version to upgrade. Use --os=linux and --cpu=x64 so npm selects
# the correct @xcfx/node optional dependency even when building on macOS/ARM.
ARG DEVKIT_VERSION=0.1.0
RUN npm install -g \
      --os=linux --cpu=x64 \
      conflux-devkit@${DEVKIT_VERSION} \
    && npm cache clean --force

# ── Ports ──────────────────────────────────────────────────────────────────
# Web UI
EXPOSE 7748
# Conflux EVM JSON-RPC (HTTP)
EXPOSE 8545
# Conflux EVM JSON-RPC (WebSocket)
EXPOSE 8546
# Conflux Core JSON-RPC (HTTP)
EXPOSE 12537
# Conflux Core JSON-RPC (WebSocket)
EXPOSE 12535

# ── Persistent data volume ──────────────────────────────────────────────────
# Wallets and node chain data are stored under ~/.conflux-devkit.
# Mount a named volume here so data survives container restarts.
VOLUME ["/root/.conflux-devkit"]

# ── Environment variable → CLI flag mapping ─────────────────────────────────
# DEVKIT_PORT         Web UI port                    (default: 7748)
# DEVKIT_HOST         Bind address                   (default: 0.0.0.0)
# DEVKIT_API_KEY      Bearer token for /api routes   (default: unset)
# DEVKIT_CORS_ORIGIN  Allowed CORS origin(s)         (default: unset)
ENV DEVKIT_HOST=0.0.0.0 \
    DEVKIT_PORT=7748

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
