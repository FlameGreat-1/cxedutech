# Inflexa Deployment Guide

This guide covers deploying the Inflexa backend to any server or VPS.

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- A domain name with DNS pointing to your server
- Stripe account with API keys
- EasyPost account with API key
- SMTP credentials for email

## Method 1: Docker Compose (Recommended)

The simplest way to deploy. Works on any server with Docker installed.

```bash
# 1. Clone the repository
git clone https://gitlab.com/exoper-chi/cxedutech.git
cd cxedutech/inflexa/server

# 2. Create environment file
cp .env.production .env
nano .env  # Fill in all values

# 3. Start everything
docker compose up -d

# 4. Run migrations
docker compose exec server node dist/migrations/runMigrations.js

# 5. Check health
curl http://localhost:5000/api/health
```

To update:
```bash
git pull origin main
docker compose build server
docker compose up -d
docker compose exec server node dist/migrations/runMigrations.js
```

## Method 2: VPS Automated Script (Ubuntu/Debian)

Full automated setup including Node.js, PostgreSQL, Nginx, and SSL.

```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Clone and run deploy script
git clone https://gitlab.com/exoper-chi/cxedutech.git /opt/inflexa
cd /opt/inflexa/inflexa/server
sudo bash deploy/deploy.sh api.yourdomain.com

# 3. Create database
sudo -u postgres createuser inflexa
sudo -u postgres createdb -O inflexa inflexa
sudo -u postgres psql -c "ALTER USER inflexa PASSWORD 'your_strong_password';"

# 4. Edit environment file
sudo nano /opt/inflexa/server/.env

# 5. Run migrations
cd /opt/inflexa/server
sudo -u inflexa node dist/migrations/runMigrations.js

# 6. Start the server
sudo systemctl start inflexa
sudo systemctl status inflexa
```

To update:
```bash
sudo bash /opt/inflexa/inflexa/server/deploy/update.sh
```

## Method 3: Manual Deployment (Any Server)

Step-by-step for any Linux server, cloud VM, or VPS.

### Step 1: Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Install PostgreSQL

```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER inflexa WITH PASSWORD 'your_strong_password';
CREATE DATABASE inflexa OWNER inflexa;
EOF
```

### Step 3: Clone and Build

```bash
git clone https://gitlab.com/exoper-chi/cxedutech.git /opt/inflexa
cd /opt/inflexa/inflexa/server
npm ci --omit=dev
npm run build
```

### Step 4: Configure Environment

```bash
cp .env.production .env
nano .env  # Fill in all real values

# Generate JWT secret
openssl rand -hex 64
```

### Step 5: Run Migrations

```bash
node dist/migrations/runMigrations.js
```

### Step 6: Create Uploads Directory

```bash
mkdir -p uploads
```

### Step 7: Start with systemd

```bash
sudo cp deploy/inflexa.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable inflexa
sudo systemctl start inflexa
```

### Step 8: Set Up Nginx + SSL

```bash
# Install Nginx and Certbot
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Copy and configure Nginx
sudo sed 's/YOUR_DOMAIN/api.yourdomain.com/g' nginx/inflexa.conf > /etc/nginx/sites-available/inflexa
sudo ln -sf /etc/nginx/sites-available/inflexa /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

## Stripe Webhook Setup

After deployment, configure Stripe to send webhooks:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://api.yourdomain.com/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env`
5. Restart: `sudo systemctl restart inflexa`

## Monitoring

```bash
# Server status
sudo systemctl status inflexa

# Live logs
sudo journalctl -u inflexa -f

# Health check
curl https://api.yourdomain.com/api/health

# Database check
sudo -u postgres psql -d inflexa -c "SELECT COUNT(*) FROM users;"
```

## Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Backup

```bash
# Database backup
sudo -u postgres pg_dump inflexa > backup_$(date +%Y%m%d).sql

# Restore
sudo -u postgres psql inflexa < backup_20260330.sql
```

## Troubleshooting

| Issue | Command |
|---|---|
| Server won't start | `sudo journalctl -u inflexa -n 100` |
| Database connection failed | `sudo systemctl status postgresql` |
| Nginx 502 Bad Gateway | `sudo systemctl status inflexa` |
| SSL certificate expired | `sudo certbot renew` |
| Port already in use | `sudo lsof -i :5000` |
| Permission denied on uploads | `sudo chown -R inflexa:inflexa /opt/inflexa/server/uploads` |
