# Template — Conflux DevKit Starter

A minimal starter template with:
- Next.js 16 + Turbopack frontend
- Wallet connection via ConnectKit + wagmi
- SIWE (Sign-In with Ethereum) authentication
- `@cfxdevkit/theme` Tailwind preset wired up
- Express backend (auth nonce/verify routes only)
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

**Backend → VPS**
```bash
# On the VPS:
cd /opt/apps/template
cp .env.example .env && $EDITOR .env
docker compose up -d
```

**Frontend → Vercel**
- Import the monorepo into Vercel
- Set `Root Directory` to `apps/template/frontend`
- Add env vars:
  - `NEXT_PUBLIC_API_URL` = `https://api.template.cfxdevkit.org`
  - `NEXT_PUBLIC_APP_URL` = `https://template.cfxdevkit.org`
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` = your WalletConnect project ID

## Caddy (VPS reverse proxy)

```caddy
api.template.cfxdevkit.org {
  reverse_proxy localhost:3002
}
```
