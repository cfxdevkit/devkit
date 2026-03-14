# Conflux Automation Studio (CAS)

CAS is a deployable application in the `@cfxdevkit` monorepo:

- **Backend** (`backend/`) — Fastify 5 + TypeScript API, deployed to the VPS via Docker
- **Frontend** (`frontend/`) — Next.js 15 app, deployed to Vercel

---

## Local development

```bash
# Backend
cd apps/cas/backend
pnpm install
pnpm dev                     # http://localhost:3001

# Frontend (separate terminal)
cd apps/cas/frontend
pnpm install
NEXT_PUBLIC_API_URL=http://localhost:3001 pnpm dev   # http://localhost:3000
```

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `CAS_API_KEY` | Backend (VPS `.env`) | Bearer token for `/api/*` routes |
| `CORS_ORIGIN` | Backend (VPS `.env`) | `https://cas.cfxdevkit.org` |
| `NEXT_PUBLIC_API_URL` | Frontend (Vercel env var) | `https://api.cas.cfxdevkit.org` |

## Deployment

### Docker image — native addon notes

The backend image (`node:20-slim`, Debian glibc) is required because
`better-sqlite3` must be compiled from source for ARM64 (aarch64). The
Dockerfile locates `better-sqlite3` in the pnpm virtual store (`.pnpm/`) and
runs `node-gyp rebuild --release` directly there — `pnpm rebuild` and
`npm rebuild` both skip transitive dependencies that have no root symlink.

Images are built for both `linux/amd64` and `linux/arm64` by `build-cas.yml`.

### Backend → VPS

`build-cas.yml` builds and pushes a multi-arch image to GHCR on every push to
`main` (path-filtered to `apps/cas/backend/**`). `deploy-cas.yml` then SSHes
into the Hetzner VPS (`/opt/apps/cas`) and runs:

```bash
TAG=edge docker compose pull cas-backend
TAG=edge docker compose up -d --remove-orphans
```

Deploys automatically on every push to `main` via the
`build-cas.yml` → `deploy-cas.yml` chain. Trigger manually at any time with a
custom image tag via `workflow_dispatch`.

Semver tags (`v1.2.3`) also trigger a build and push images tagged `1.2.3` +
`latest`.

### Frontend → Vercel

Create a Vercel project with:
- **Root directory**: `apps/cas/frontend`
- **Framework**: Next.js
- **Env var**: `NEXT_PUBLIC_API_URL=https://api.cas.cfxdevkit.org`

The Vercel GitHub integration auto-deploys on push to `main`.
