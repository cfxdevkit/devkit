#!/bin/sh
# entrypoint.sh — translate environment variables to CLI flags and start
# conflux-devkit bound to all interfaces (no browser in a container).

set -e

ARGS="--host ${DEVKIT_HOST:-0.0.0.0} --port ${DEVKIT_PORT:-7748} --no-open"

if [ -n "${DEVKIT_API_KEY}" ]; then
  ARGS="${ARGS} --api-key ${DEVKIT_API_KEY}"
fi

if [ -n "${DEVKIT_CORS_ORIGIN}" ]; then
  ARGS="${ARGS} --cors-origin ${DEVKIT_CORS_ORIGIN}"
fi

# Allow callers to append arbitrary extra flags via DEVKIT_EXTRA_ARGS.
if [ -n "${DEVKIT_EXTRA_ARGS}" ]; then
  ARGS="${ARGS} ${DEVKIT_EXTRA_ARGS}"
fi

# shellcheck disable=SC2086
exec conflux-devkit $ARGS "$@"
