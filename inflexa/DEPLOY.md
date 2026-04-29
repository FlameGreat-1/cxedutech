# Inflexa Full-Stack Deployment Guide

> **Target**: Hostinger VPS running Ubuntu 24.04 LTS  
> **Stack**: React (Vite) + Node.js (Express) + PostgreSQL 16  
> **Orchestration**: Docker Compose + Host Nginx + Let's Encrypt SSL

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Automated)](#quick-start-automated)
3. [Manual Deployment](#manual-deployment)
4. [Post-Deployment Setup](#post-deployment-setup)
5. [Updating Production](#updating-production)
6. [Makefile Reference](#makefile-reference)
7. [Monitoring & Logs](#monitoring--logs)
8. [Backups](#backups)
9. [SSL Management](#ssl-management)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Hostinger VPS** with Ubuntu 24.04 LTS
- **Domain name** with DNS A record pointing to VPS IP
- **SSH access** as root
- **Stripe** account with API keys
- **SMTP** credentials for transactional email

### DNS Setup (Before Deploying)

Log into your domain registrar for **both** domains and create **A records**:

**inflexatechnologies.com** (primary):

| Type | Name | Value          | TTL  |
|------|------|----------------|------|
| A    | @    | YOUR_VPS_IP    | 3600 |
| A    | www  | YOUR_VPS_IP    | 3600 |

**inflexatechnologies.co.uk** (secondary — redirects to .com):

| Type | Name | Value          | TTL  |
|------|------|----------------|------|
| A    | @    | YOUR_VPS_IP    | 3600 |
| A    | www  | YOUR_VPS_IP    | 3600 |

Wait for DNS propagation (usually 5–30 minutes).

---

## Quick Start (Automated)

SSH into your VPS and run the automated deployment script:

```bash
# 1. SSH into your Hostinger VPS
ssh root@YOUR_VPS_IP

# 2. Clone the repository
git clone https://github.com/FlameGreat-1/cxedutech /opt/inflexa
cd /opt/inflexa/inflexa

# 3. Run the deployment script (domains are pre-configured)
sudo bash deploy.sh

# 4. Edit environment files with real credentials
sudo nano server/.env         # Backend: DB, Stripe, SMTP, etc.
sudo nano .env                # Root: Domain, client keys

# 5. Rebuild after editing .env
make build

# 6. Run database migrations
make db-migrate

# 7. Create the first admin user
make db-create-admin

# 8. Verify everything is healthy
make health
```

Your site is now live at:
- **Primary**: `https://inflexatechnologies.com`
- **Alternate**: `https://inflexatechnologies.co.uk` (redirects to .com)
- **www** variants also redirect to the primary.

---

## Manual Deployment

If you prefer step-by-step control:

### Step 1: System Packages

```bash
ssh root@YOUR_VPS_IP

apt-get update && apt-get upgrade -y
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw make
```

### Step 2: Install Docker

```bash
# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker && systemctl start docker
```

### Step 3: Clone & Configure

```bash
git clone https://github.com/FlameGreat-1/cxedutech /opt/inflexa
cd /opt/inflexa/inflexa

# Create environment files
cp .env.example .env
nano .env                     # Set DOMAIN, client keys

nano server/.env              # Set DB, Stripe, SMTP, etc.
```

### Step 4: Build & Start Containers

```bash
make build       # or: docker compose up -d --build
make db-migrate
make db-create-admin
```

### Step 5: Configure Nginx + SSL

```bash
# Copy Nginx config (domains are hardcoded in the config)
cp nginx/inflexa.conf /etc/nginx/sites-available/inflexa
ln -sf /etc/nginx/sites-available/inflexa /etc/nginx/sites-enabled/inflexa
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t && systemctl reload nginx

# Get SSL for both domains
certbot certonly --nginx -d inflexatechnologies.com -d www.inflexatechnologies.com \
  --non-interactive --agree-tos --email admin@inflexatechnologies.com
certbot certonly --nginx -d inflexatechnologies.co.uk -d www.inflexatechnologies.co.uk \
  --non-interactive --agree-tos --email admin@inflexatechnologies.com

# Reload with full SSL config
nginx -t && systemctl reload nginx
```

### Step 6: Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw deny 5000   # Block direct API access
ufw deny 3000   # Block direct client access
ufw --force enable
```

---

## Post-Deployment Setup

### Environment Variables (.env Credentials)

Hostinger VPS is a raw Linux server — there is **no web UI** for environment variables like Heroku or Railway. Credentials are managed via `.env` files directly on the server:

```bash
# Server credentials (DB, Stripe, SMTP, JWT, etc.)
sudo nano /opt/inflexa/inflexa/server/.env

# Root credentials (DB password for Docker, client build keys)
sudo nano /opt/inflexa/inflexa/.env
```

**Security best practices for .env files:**

1. **File permissions**: Already set to `chmod 600` by the deploy script (owner read/write only)
2. **Never commit**: `.env` is in `.gitignore` — credentials stay on the server only
3. **Generate strong secrets**: `openssl rand -hex 64` for JWT_SECRET and DB_PASSWORD
4. **After editing**: Always rebuild with `make build` to apply changes
5. **Backup .env separately**: Keep a secure copy outside the server (e.g., password manager)

**Required values in `server/.env`:**

| Variable | Description |
|---|---|
| `DB_PASSWORD` | Strong random password (use `openssl rand -hex 32`) |
| `DB_HOST` | Set to `db` (Docker service name, NOT localhost) |
| `JWT_SECRET` | Random 128-char hex (use `openssl rand -hex 64`) |
| `CLIENT_URL` | `https://inflexatechnologies.com` |
| `STRIPE_SECRET_KEY` | Your Stripe live secret key |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook setup (below) |
| `PAYSTACK_SECRET_KEY` | Your Paystack live secret key |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Email sending credentials |
| `STORAGE_PROVIDER` | `cloudinary` or `local` |

### Stripe Webhooks

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Add endpoint: `https://inflexatechnologies.com/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `server/.env`
5. Restart: `make restart`

### Paystack Webhooks

1. Go to **Paystack Dashboard → Settings → API Keys & Webhooks**
2. Set webhook URL: `https://inflexatechnologies.com/api/payments/paystack/webhook`
3. Save

---

## Updating Production

```bash
cd /opt/inflexa/inflexa
make update
```

This will:
1. Pull latest code from `main`
2. Rebuild Docker images
3. Restart containers
4. Run database migrations
5. Verify health

---

## Makefile Reference

Run `make help` or `make menu` for the full interactive guide. Key commands:

| Command | Description |
|---|---|
| `make up` | Start all containers |
| `make down` | Stop all containers |
| `make build` | Rebuild and start all containers |
| `make logs` | Tail all container logs |
| `make ps` | View running containers |
| `make health` | Check health of all services |
| `make db-migrate` | Run database migrations |
| `make db-create-admin` | Create admin user |
| `make db-seed` | Seed products |
| `make db-shell` | Open psql shell |
| `make db-backup` | Backup database to SQL file |
| `make db-restore FILE=x` | Restore database from SQL file |
| `make update` | Pull, rebuild, migrate, restart |
| `make deploy` | Run full deployment script |
| `make ssl-renew` | Renew SSL certificates |
| `make clean` | Remove everything (containers, volumes, images) |
| `make menu` | Interactive guided CLI |

---

## Monitoring & Logs

```bash
# Health check
make health

# Container status + resource usage
make status

# Live logs (all containers)
make logs

# Specific container logs
make logs-server
make logs-client
make logs-db

# System-level Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Backups

### Database

```bash
# Create backup
make db-backup

# Restore from backup
make db-restore FILE=backups/inflexa_20260423_120000.sql
```

### Uploaded Files

Uploads are stored in a Docker named volume. To backup:

```bash
docker run --rm -v inflexa_uploads:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/uploads_$(date +%Y%m%d).tar.gz -C /data .
```

### Automated Daily Backups

Add to root's crontab (`sudo crontab -e`):

```cron
# Daily DB backup at 2 AM
0 2 * * * cd /opt/inflexa/inflexa && make db-backup 2>/dev/null
```

---

## SSL Management

```bash
# Check certificate status
make ssl-status

# Manually renew
make ssl-renew

# Auto-renewal is configured via cron (added by deploy.sh)
# Verify: sudo crontab -l
```

---

## Troubleshooting

| Issue | Diagnosis | Fix |
|---|---|---|
| Site not loading | `make health` | Check which service is down |
| 502 Bad Gateway | `make logs-server` | Server crashed — check logs |
| Database connection failed | `make logs-db` | Check DB credentials in `server/.env` |
| SSL certificate expired | `make ssl-status` | `make ssl-renew` |
| Container won't start | `docker compose logs <service>` | Check error in logs |
| Port already in use | `sudo lsof -i :5000` | Kill conflicting process |
| Permission denied on uploads | `docker compose exec server ls -la uploads/` | Fix volume permissions |
| Out of disk space | `df -h && docker system prune` | Clean unused Docker data |
| Client shows old version | `make rebuild-client` | Rebuild the frontend |

### Common Docker Commands

```bash
# Enter a container shell
docker compose exec server sh
docker compose exec client sh
docker compose exec db bash

# View container resource usage
docker stats

# Prune unused Docker resources
docker system prune -af
```
