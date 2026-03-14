# Template — Conflux DevKit Starter

A minimal starter template with:
- Next.js 15 + Turbopack frontend
- Wallet connection via ConnectKit + wagmi
- SIWE (Sign-In with Ethereum) authentication
- `@cfxdevkit/theme` Tailwind preset wired up
- Fastify backend (auth nonce/verify routes only)
- SQLite (better-sqlite3 + Drizzle ORM)
- Deploy: backend → VPS (Docker), frontend → Vercel

## Local development

```bash
# From monorepo root — installs everything
pnpm install

# Terminal 1: backend (http://localhost:3002)
pnpm --filter @cfxdevkit/template-backend dev

# Terminal 2: frontend (http://localhost:3000)
pnpm --filter @cfxdevkit/template-frontend dev
```

## Environment

### Frontend (`apps/template/frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-project-id>
```

### Backend (`apps/template/backend/.env`)
```
JWT_SECRET=dev-secret-change-in-production
CORS_ORIGIN=http://localhost:3000
PORT=3002
```

## Production deploy

### Docker image — native addon notes

The backend image (`node:20-slim`, Debian glibc) is required because
`better-sqlite3` must be compiled from source for ARM64 (aarch64). The
Dockerfile locates `better-sqlite3` in the pnpm virtual store (`.pnpm/`) and
runs `node-gyp rebuild --release` directly there — `pnpm rebuild` and
`npm rebuild` both skip transitive dependencies that have no root symlink.

Images are built for both `linux/amd64` and `linux/arm64` by `build-template.yml`.

### Backend → VPS

`build-template.yml` builds and pushes a multi-arch image to GHCR on every
push to `main` (path-filtered to `apps/template/backend/**`). `deploy-template.yml`
then SSHes into the Hetzner VPS (`/opt/apps/template`) and runs:

```bash
TAG=edge docker compose pull template-backend
TAG=edge docker compose up -d --remove-orphans
```

Deploys automatically on every push to `main` via the
`build-template.yml` → `deploy-template.yml` chain. Trigger manually at any
time with a custom image tag via `workflow_dispatch`.

The container listens on port `3002`; the VPS maps `127.0.0.1:3003:3002` so
Caddy proxies via `localhost:3003`.

### Frontend → Vercel

- Import the monorepo into Vercel
- Set `Root Directory` to `apps/template/frontend`
- Add env vars:
  - `NEXT_PUBLIC_API_URL` = `https://api.template.cfxdevkit.org`
  - `NEXT_PUBLIC_APP_URL` = `https://template.cfxdevkit.org`
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` = your WalletConnect project ID

## Caddy (VPS reverse proxy)

```caddy
api.template.cfxdevkit.org {
  reverse_proxy localhost:3003
}
```
