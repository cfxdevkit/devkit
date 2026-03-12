# infra — VPS Provisioning

Ansible-based provisioning for the [Hetzner CAX11](https://www.hetzner.com/cloud/)
(ARM64) VPS that hosts all backend services in this monorepo.

**Frontend apps → Vercel. Backend services → this VPS.**

---

## Prerequisites (workstation)

```bash
# Ansible itself — package is named 'ansible', not 'ansible-playbook'
sudo apt install -y ansible          # Ubuntu/Debian
# or: brew install ansible           # macOS

# Required Galaxy collections (included in community.general + community.docker)
cd infra/ansible
ansible-galaxy collection install -r requirements.yml
```

You need:
- A Hetzner CAX11 instance running **Ubuntu 24.04 ARM64** with root SSH access
- The root SSH private key available locally

---

## First-time provisioning

```bash
cd infra/ansible

# 1. Copy the inventory template and fill in the VPS IP + key path
cp inventory.ini inventory.local.ini
$EDITOR inventory.local.ini

# 2. Copy and customise variables (including Ansible vault secrets)
cp vars/all.yml vars/local.yml
$EDITOR vars/local.yml            # set deploy_pubkey, restic_repository, etc.

# 3. Run the full playbook (as root for the first run)
ansible-playbook playbook.yml -i inventory.local.ini -e @vars/local.yml

# After this, root SSH is disabled. All subsequent runs use the deploy user:
ansible-playbook playbook.yml -i inventory.local.ini -e @vars/local.yml -u deploy
```

The playbook is **idempotent** — safe to re-run after any config change.

---

## Running a single role

```bash
# Re-configure Caddy only (e.g. after adding a new app snippet)
ansible-playbook playbook.yml -i inventory.local.ini --tags caddy

# Update backup config only
ansible-playbook playbook.yml -i inventory.local.ini --tags backups
```

---

## Adding a new backend app

1. Scaffold the app at `apps/<name>/` (see `apps/cas/` as template)
2. Add a Caddyfile snippet at `roles/caddy/templates/sites/<name>.j2`
3. Add a new port to `vars/all.yml` under `app_ports`
4. Re-run: `ansible-playbook playbook.yml --tags caddy`
5. Point DNS `<name>.cfxdevkit.org` → VPS IP
6. Add `.github/workflows/deploy-<name>.yml`

---

## Security model

| Control | Implementation |
|---|---|
| SSH access | `deploy` user only; key-based auth; root login disabled |
| Firewall | `ufw` — allows 22, 80, 443 only |
| Brute-force | `fail2ban` — SSH jail, 5 attempts → 1h ban |
| OS patches | `unattended-upgrades` — security-only, auto-reboot at 03:00 |
| Secrets | Ansible vault (`vars/local.yml` — never committed) |

---

## Directory structure

```
ansible/
├── playbook.yml         Main entry point
├── inventory.ini        Template (fill in → inventory.local.ini)
├── vars/all.yml         Variables template (fill in → vars/local.yml)
└── roles/
    ├── base/            User, SSH, ufw, fail2ban, upgrades
    ├── docker/          Docker CE
    ├── caddy/           Reverse proxy + TLS
    ├── backups/         Restic
    └── monitoring/      Uptime Kuma
```
