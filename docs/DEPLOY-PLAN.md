# Deployment & Provisioning Plan — cfxdevkit.org + VPS

**Date**: March 2026  
**Status**: APPROVED FOR IMPLEMENTATION

---

## 0. Scope clarification

- The **VPS is a general backend deployment host** for any project in this monorepo that needs a server-side component. It is **not** used to run the devtools/devkit stack.
- `@xcfx/node` / `conflux-devkit` are **local development tools only** — never deployed to VPS.
- The **docs-site (Nextra)** is already deployed on Vercel via the GitHub integration — no changes needed there.
- **CAS (Conflux Automation Studio)** is the first real deployable app. Scaffolded in `apps/cas/` as the canonical template for future apps.
- **Frontend → Vercel. Backend → VPS.** This is the split for all apps in this monorepo.

---

## 1. Directory layout after implementation

```
apps/
└── cas/                       # Conflux Automation Studio (first deployable app)
    ├── backend/               # Fastify API — deploys to VPS via Docker
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       └── index.ts
    ├── frontend/              # Next.js UI — deploys to Vercel (separate project)
    │   ├── package.json
    │   ├── next.config.mjs
    │   ├── tsconfig.json
    │   └── src/app/
    │       ├── layout.tsx
    │       └── page.tsx
    ├── docker-compose.yml     # Production compose (backend only)
    └── README.md

infra/
├── README.md                  # How to provision a new VPS from scratch
└── ansible/
    ├── playbook.yml           # Main provisioning playbook (idempotent)
    ├── inventory.ini          # Hosts file (template — fill in IP + key path)
    ├── vars/
    │   └── all.yml            # Shared variables (user, paths, ports, etc.)
    └── roles/
        ├── base/              # Security hardening
        │   └── tasks/main.yml # deploy user, ssh hardening, ufw, fail2ban, unattended-upgrades
        ├── docker/            # Docker CE
        │   └── tasks/main.yml
        ├── caddy/             # Reverse proxy + auto HTTPS
        │   ├── tasks/main.yml
        │   └── templates/
        │       ├── Caddyfile.j2          # main config (imports sites-enabled/*)
        │       └── sites/
        │           └── monitoring.j2    # Uptime Kuma snippet
        ├── backups/           # Restic daily backups
        │   ├── tasks/main.yml
        │   └── templates/
        │       └── backup.sh.j2
        └── monitoring/        # Uptime Kuma via Docker
            └── tasks/main.yml

.github/workflows/
├── ci.yml                     # existing — unchanged
├── release.yml                # existing — unchanged
└── deploy-cas.yml             # NEW — SSH restart CAS stack on VPS
```

---

## 2. Target architecture

```
┌──────────────────────────────────────────────────────────┐
│  GitHub                                                  │
│  push to main ──► Vercel GitHub integration              │
│                   ├── docs-site (cfxdevkit.org)          │
│                   └── CAS frontend (cas.cfxdevkit.org)   │
│  semver tag ──► release.yml (npm + Docker Hub)           │
│               └► deploy-cas.yml ──► SSH ──► VPS          │
└──────────────────────────────────────────────────────────┘
                                │ SSH
                                ▼
          ┌────────────────────────────────────────┐
          │  Hetzner CAX11 (ARM64, Ubuntu 24.04)   │
          │                                        │
          │  user: deploy  (ssh-key only)           │
          │  ufw: 22, 80, 443 only                  │
          │  fail2ban on SSH                        │
          │  unattended-upgrades (security only)    │
          │                                        │
          │  Caddy :80/:443                                │
          │  ├── api.cas.cfxdevkit.org ──► :3001          │
          │  └── monitor.cfxdevkit.org ──► :3002          │
          │                                        │
          │  /opt/apps/cas/        (CAS backend)   │
          │  /opt/monitoring/      (Uptime Kuma)   │
          │                                        │
          │  Restic daily backup → B2/S3/local     │
          └────────────────────────────────────────┘
```

---

## 3. DNS additions

```
# Existing
cfxdevkit.org              A      76.76.21.21          (Vercel)
www.cfxdevkit.org          CNAME  cname.vercel-dns.com

# Subdomain convention:
#   <app>.cfxdevkit.org      CNAME  cname.vercel-dns.com  (frontend, Vercel)
#   api.<app>.cfxdevkit.org  A      <hetzner-ipv4>         (backend, VPS)

# Global VPS infrastructure
monitor.cfxdevkit.org      A      <hetzner-ipv4>

# CAS
cas.cfxdevkit.org          CNAME  cname.vercel-dns.com  (frontend)
api.cas.cfxdevkit.org      A      <hetzner-ipv4>        (backend)
```

---

## 4. VPS provisioning — Ansible

### One-time setup from a workstation

```bash
# Install Ansible locally (once)
pip install ansible

cd infra/ansible
cp inventory.ini inventory.local.ini   # fill in VPS IP + SSH key path
ansible-playbook playbook.yml -i inventory.local.ini
```

The playbook is **idempotent** — safe to re-run after config changes.

### Roles executed in order

| Role | What it does |
|---|---|
| `base` | Creates `deploy` user + authorised SSH key; disables root SSH login and password auth; installs `ufw` (allow 22/80/443, deny all), `fail2ban` (SSH jail), `unattended-upgrades` (security patches only) |
| `docker` | Installs Docker CE from Docker's official apt repo; adds `deploy` to `docker` group |
| `caddy` | Installs Caddy from official apt repo; writes `Caddyfile` from template; enables service; creates `/etc/caddy/sites-enabled/` directory; Caddyfile uses `import /etc/caddy/sites-enabled/*` for per-app snippets |
| `backups` | Installs `restic`; writes `/usr/local/bin/backup.sh` from template; installs systemd timer (daily 02:00 UTC); configures retention: 7 daily / 4 weekly / 3 monthly |
| `monitoring` | Deploys Uptime Kuma at `/opt/monitoring/` via Docker Compose on `127.0.0.1:3002`; writes Caddyfile snippet to `/etc/caddy/sites-enabled/monitoring.conf` |

### Per-app pattern

Every app with a backend follows this layout on the VPS:

```
/opt/apps/<app-name>/
├── docker-compose.yml   # copy from repo, or git pull
├── .env                 # secrets (NOT in repo; managed by Ansible vault or set manually)
└── data/                # Docker volume mount points
```

Adding a new app:
1. Scaffold `apps/<name>/` in the monorepo (use `apps/cas/` as template)
2. Add a Caddyfile snippet in `infra/ansible/roles/caddy/templates/sites/<name>.j2`
3. Add a `deploy-<name>.yml` GitHub Actions workflow
4. Re-run the Ansible `caddy` role to install the snippet and reload Caddy
5. Create a Vercel project for the frontend (if any)

---

## 5. CAS scaffold (`apps/cas/`)

### Backend — `apps/cas/backend/`

- **Runtime**: Node.js 22 + Fastify 5 + TypeScript
- **Port**: 3001 (internal only — proxied by Caddy to `api.cas.cfxdevkit.org`)
- **Auth**: Bearer token via `CAS_API_KEY` env var on all `/api/*` routes
- **Dockerfile**: Multi-stage, ARM64-native (`node:22-slim`) — no QEMU needed

### Frontend — `apps/cas/frontend/`

- **Framework**: Next.js 15 + TypeScript
- **Deployment**: Vercel project, `rootDirectory: apps/cas/frontend`
- **API**: `NEXT_PUBLIC_API_URL=https://api.cas.cfxdevkit.org`

---

## 6. GitHub Actions — `deploy-cas.yml`

```yaml
on:
  workflow_dispatch:
    inputs:
      tag:
        description: Docker image tag (default: latest)
        default: latest
  workflow_run:
    workflows: ["Release"]
    types: [completed]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' || github.event_name == 'workflow_dispatch' }}
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/apps/cas
            git pull --ff-only
            TAG=${{ inputs.tag || 'latest' }} docker compose pull
            TAG=${{ inputs.tag || 'latest' }} docker compose up -d --remove-orphans
            docker image prune -f
```

---

## 7. GitHub secrets required

| Secret | Value |
|---|---|
| `VPS_HOST` | Hetzner public IP (used by SSH, not a DNS name) |
| `VPS_SSH_KEY` | Private key for `deploy` user (Ansible vault stores the public key) |
| `DOCKERHUB_USERNAME` | existing |
| `DOCKERHUB_TOKEN` | existing |

`CAS_API_KEY` is set directly on the VPS in `/opt/apps/cas/.env` — not a CI secret.

---

## 8. Vercel projects

| Project name | Root directory | Env vars needed |
|---|---|---|
| `cfxdevkit-docs` | `docs-site` | none (already live) |
| `cfxdevkit-cas` | `apps/cas/frontend` | `NEXT_PUBLIC_API_URL` |

Both use the **Vercel GitHub integration** — zero additional secrets or workflow steps.

---

## 9. Backups

- **Tool**: restic  
- **Schedule**: systemd timer, daily 02:00 UTC  
- **Scope**: `/opt/apps` + `/opt/monitoring`  
- **Repository**: `/opt/restic-repo` (local path on VPS — zero cost, zero config)  
- **Retention**: 7 daily, 4 weekly, 3 monthly (`restic forget --prune`)  
- **Migration to off-site**: change `restic_repository` in `vars/local.yml` to a B2/S3 URL and add credentials; re-run `--tags backups`  

---

## 10. Monitoring

- **Uptime Kuma** at `monitor.cfxdevkit.org`  
- Monitors: `https://cfxdevkit.org`, `https://cas.cfxdevkit.org`, `https://api.cas.cfxdevkit.org`, `https://monitor.cfxdevkit.org`  
- Notify: Telegram / email (configured in Kuma UI on first visit)  

---

## 11. Phased rollout

### Phase 1 – Provision VPS (1 day)

```bash
cd infra/ansible && ansible-playbook playbook.yml -i inventory.local.ini
```

- Creates `deploy` user, hardens SSH, enables ufw + fail2ban
- Installs Docker + Caddy + Uptime Kuma
- Sets up restic backup timer

### Phase 2 – CAS backend live (1 day)

- `ssh deploy@<vps> "mkdir -p /opt/apps/cas && cd /opt/apps/cas && docker compose up -d"`
- Point `api.cas.cfxdevkit.org` + `monitor.cfxdevkit.org` DNS → VPS IP
- Caddy auto-provisions Let's Encrypt certs; verify HTTPS

### Phase 3 – CAS frontend on Vercel (half day)

- Create `cfxdevkit-cas` Vercel project, set `rootDirectory: apps/cas/frontend`
- Set `NEXT_PUBLIC_API_URL=https://api.cas.cfxdevkit.org`
- Vercel auto-deploys on push to `main`

### Phase 4 – Automated deploy workflow (half day)

- Add `VPS_HOST` + `VPS_SSH_KEY` to GitHub secrets
- `deploy-cas.yml` workflow goes live; test with `workflow_dispatch`

---

## 12. Adding a future app (template checklist)

1. `cp -r apps/cas apps/<name>` — rename service names, ports, env vars
2. Pick a free internal port (>3001); add to `infra/ansible/vars/all.yml` under `app_ports`
3. Add `infra/ansible/roles/caddy/templates/sites/<name>.j2` with:
   - `<name>.cfxdevkit.org` → CNAME to Vercel
   - `api.<name>.cfxdevkit.org` → `reverse_proxy localhost:<port>`
4. Add DNS records:
   - `<name>.cfxdevkit.org    CNAME cname.vercel-dns.com`
   - `api.<name>.cfxdevkit.org A     <hetzner-ipv4>`
5. Add `.github/workflows/deploy-<name>.yml`
6. Re-run Ansible `caddy` role: `ansible-playbook playbook.yml --tags caddy`
7. Create Vercel project: `rootDirectory: apps/<name>/frontend`, set `NEXT_PUBLIC_API_URL=https://api.<name>.cfxdevkit.org`
