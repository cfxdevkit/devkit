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

### Backend → VPS

The `deploy-cas.yml` GitHub Actions workflow SSHes into the Hetzner VPS and runs:

```bash
cd /opt/apps/cas
docker compose pull
docker compose up -d --remove-orphans
```

Trigger via `workflow_dispatch` in the Actions tab, or automatically on release.

### Frontend → Vercel

Create a Vercel project with:
- **Root directory**: `apps/cas/frontend`
- **Framework**: Next.js
- **Env var**: `NEXT_PUBLIC_API_URL=https://api.cas.cfxdevkit.org`

The Vercel GitHub integration auto-deploys on push to `main`.

## Adding to this app

This is a scaffold — replace the placeholder API routes in `backend/src/index.ts`
and the page components in `frontend/src/app/` with the actual CAS implementation
as it is migrated into this repository.
