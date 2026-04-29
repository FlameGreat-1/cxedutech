#!/usr/bin/env bash
# ============================================================================
# Inflexa Full-Stack VPS Deployment Script
# ============================================================================
# Target OS:  Ubuntu 24.04 LTS (Hostinger VPS)
# Usage:      sudo bash deploy.sh
#
# Domains:
#   - inflexatechnologies.com       (primary)
#   - www.inflexatechnologies.com
#   - inflexatechnologies.co.uk
#   - www.inflexatechnologies.co.uk
# ============================================================================
set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================
PRIMARY_DOMAIN="inflexatechnologies.com"
SECONDARY_DOMAIN="inflexatechnologies.co.uk"
ALL_DOMAINS="$PRIMARY_DOMAIN,www.$PRIMARY_DOMAIN,$SECONDARY_DOMAIN,www.$SECONDARY_DOMAIN"
APP_DIR="/opt/inflexa"
REPO_URL="https://github.com/FlameGreat-1/cxedutech"
SERVICE_USER="inflexa"
ADMIN_EMAIL="admin@inflexatechnologies.com"

if [ "$(id -u)" -ne 0 ]; then
  echo "[ERROR] This script must be run as root (use sudo)."
  exit 1
fi

echo ""
echo "============================================"
echo "  Inflexa Full-Stack Deployment"
echo "============================================"
echo "  Primary:   $PRIMARY_DOMAIN"
echo "  Secondary: $SECONDARY_DOMAIN"
echo "  Target:    Ubuntu 24.04 LTS"
echo "============================================"
echo ""

# ============================================================================
# 1. System Update & Essential Packages
# ============================================================================
echo "[1/8] Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
  curl \
  git \
  ca-certificates \
  gnupg \
  lsb-release \
  nginx \
  certbot \
  python3-certbot-nginx \
  ufw \
  make

echo "  ✓ System packages installed"

# ============================================================================
# 2. Install Docker Engine (Official)
# ============================================================================
echo ""
echo "[2/8] Installing Docker Engine..."
if ! command -v docker &>/dev/null; then
  # Add Docker's official GPG key
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  # Add the Docker repository
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
    https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo "  ✓ Docker installed: $(docker --version)"
else
  echo "  ✓ Docker already installed: $(docker --version)"
fi

# ============================================================================
# 3. Create system user
# ============================================================================
echo ""
echo "[3/8] Creating system user '$SERVICE_USER'..."
if ! id "$SERVICE_USER" &>/dev/null; then
  useradd --system --shell /usr/sbin/nologin --home-dir "$APP_DIR" "$SERVICE_USER"
  usermod -aG docker "$SERVICE_USER"
  echo "  ✓ User '$SERVICE_USER' created and added to docker group"
else
  usermod -aG docker "$SERVICE_USER" 2>/dev/null || true
  echo "  ✓ User '$SERVICE_USER' already exists"
fi

# ============================================================================
# 4. Clone / Pull Repository
# ============================================================================
echo ""
echo "[4/8] Setting up application code..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin main
  git reset --hard origin/main
  echo "  ✓ Repository updated"
else
  git clone "$REPO_URL" "$APP_DIR"
  echo "  ✓ Repository cloned"
fi

cd "$APP_DIR/inflexa"

# ============================================================================
# 5. Environment Files
# ============================================================================
echo ""
echo "[5/8] Setting up environment files..."

# Root .env (for docker-compose)
if [ ! -f "$APP_DIR/inflexa/.env" ]; then
  cp "$APP_DIR/inflexa/.env.example" "$APP_DIR/inflexa/.env"
  chmod 600 "$APP_DIR/inflexa/.env"
  chown "$SERVICE_USER":"$SERVICE_USER" "$APP_DIR/inflexa/.env"
  echo "  ✓ Root .env created from .env.example"
  echo "  ⚠  You MUST edit $APP_DIR/inflexa/.env with real values"
else
  echo "  ✓ Root .env already exists"
fi

# Server .env
if [ ! -f "$APP_DIR/inflexa/server/.env" ]; then
  if [ -f "$APP_DIR/inflexa/server/.env.example" ]; then
    cp "$APP_DIR/inflexa/server/.env.example" "$APP_DIR/inflexa/server/.env"
  fi
  chmod 600 "$APP_DIR/inflexa/server/.env"
  chown "$SERVICE_USER":"$SERVICE_USER" "$APP_DIR/inflexa/server/.env"
  echo "  ✓ Server .env created"
  echo ""
  echo "  ┌─────────────────────────────────────────────────────────────┐"
  echo "  │  ⚠  IMPORTANT: Edit server/.env with real credentials!    │"
  echo "  │                                                            │"
  echo "  │  Required values:                                          │"
  echo "  │    - DB_PASSWORD    (strong random password)               │"
  echo "  │    - JWT_SECRET     (run: openssl rand -hex 64)            │"
  echo "  │    - STRIPE_SECRET_KEY                                     │"
  echo "  │    - STRIPE_WEBHOOK_SECRET                                 │"
  echo "  │    - PAYSTACK_SECRET_KEY                                   │"
  echo "  │    - SMTP_HOST / SMTP_USER / SMTP_PASS                    │"
  echo "  │    - CLIENT_URL=https://inflexatechnologies.com            │"
  echo "  │                                                            │"
  echo "  │  Edit: sudo nano $APP_DIR/inflexa/server/.env │"
  echo "  └─────────────────────────────────────────────────────────────┘"
  echo ""
else
  echo "  ✓ Server .env already exists"
fi

# Fix ownership
chown -R "$SERVICE_USER":"$SERVICE_USER" "$APP_DIR"

# ============================================================================
# 6. Build & Start Docker Containers
# ============================================================================
echo ""
echo "[6/8] Building and starting Docker containers..."
cd "$APP_DIR/inflexa"
docker compose build --no-cache
docker compose up -d
echo "  ✓ Docker containers running"

# Wait for server to be healthy
echo "  Waiting for server health check..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "  ✓ Server is healthy"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "  ⚠  Server health check timed out. Check: docker compose logs server"
  fi
  sleep 2
done

# ============================================================================
# 7. Nginx + SSL (Multi-Domain)
# ============================================================================
echo ""
echo "[7/8] Configuring Nginx and SSL for multiple domains..."

# The Nginx config already has hardcoded domains, just copy it
cp "$APP_DIR/inflexa/nginx/inflexa.conf" /etc/nginx/sites-available/inflexa
rm -f /etc/nginx/sites-enabled/default

# Step 7a: Create a temporary HTTP-only config so Certbot can verify domains
cat > /etc/nginx/sites-available/inflexa-temp <<'TEMPEOF'
server {
    listen 80;
    listen [::]:80;
    server_name inflexatechnologies.com
                www.inflexatechnologies.com
                inflexatechnologies.co.uk
                www.inflexatechnologies.co.uk;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
TEMPEOF

ln -sf /etc/nginx/sites-available/inflexa-temp /etc/nginx/sites-enabled/inflexa
mkdir -p /var/www/certbot
nginx -t && systemctl reload nginx

# Step 7b: Get SSL certificate for primary domain (.com + www)
if [ ! -d "/etc/letsencrypt/live/$PRIMARY_DOMAIN" ]; then
  echo "  Obtaining SSL certificate for $PRIMARY_DOMAIN + www.$PRIMARY_DOMAIN..."
  certbot certonly --nginx \
    -d "$PRIMARY_DOMAIN" \
    -d "www.$PRIMARY_DOMAIN" \
    --non-interactive --agree-tos --email "$ADMIN_EMAIL"
  echo "  ✓ SSL certificate obtained for $PRIMARY_DOMAIN"
else
  echo "  ✓ SSL certificate already exists for $PRIMARY_DOMAIN"
fi

# Step 7c: Get SSL certificate for secondary domain (.co.uk + www)
if [ ! -d "/etc/letsencrypt/live/$SECONDARY_DOMAIN" ]; then
  echo "  Obtaining SSL certificate for $SECONDARY_DOMAIN + www.$SECONDARY_DOMAIN..."
  certbot certonly --nginx \
    -d "$SECONDARY_DOMAIN" \
    -d "www.$SECONDARY_DOMAIN" \
    --non-interactive --agree-tos --email "$ADMIN_EMAIL"
  echo "  ✓ SSL certificate obtained for $SECONDARY_DOMAIN"
else
  echo "  ✓ SSL certificate already exists for $SECONDARY_DOMAIN"
fi

# Step 7d: Switch to the full production config with SSL
ln -sf /etc/nginx/sites-available/inflexa /etc/nginx/sites-enabled/inflexa
rm -f /etc/nginx/sites-available/inflexa-temp
nginx -t && systemctl reload nginx
echo "  ✓ Nginx configured with SSL for all domains"

# Set up auto-renewal cron
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | sort -u | crontab -
echo "  ✓ SSL auto-renewal cron added"

# ============================================================================
# 8. Firewall
# ============================================================================
echo ""
echo "[8/8] Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
# Block direct access to Docker ports from outside
ufw deny 5000
ufw deny 3000
ufw --force enable
echo "  ✓ Firewall configured"

# ============================================================================
# Done
# ============================================================================
echo ""
echo "============================================"
echo "  ✅  Deployment Complete!"
echo "============================================"
echo ""
echo "Domains configured:"
echo "  ✓ https://inflexatechnologies.com        (primary)"
echo "  ✓ https://www.inflexatechnologies.com     → redirects to primary"
echo "  ✓ https://inflexatechnologies.co.uk       → redirects to primary"
echo "  ✓ https://www.inflexatechnologies.co.uk   → redirects to primary"
echo ""
echo "Next steps:"
echo "  1. Edit environment files with REAL credentials:"
echo "     sudo nano $APP_DIR/inflexa/server/.env"
echo "     sudo nano $APP_DIR/inflexa/.env"
echo ""
echo "  2. Set CLIENT_URL in server/.env:"
echo "     CLIENT_URL=https://inflexatechnologies.com"
echo ""
echo "  3. Run database migrations:"
echo "     cd $APP_DIR/inflexa"
echo "     make db-migrate"
echo ""
echo "  4. Create the first admin user:"
echo "     make db-create-admin"
echo ""
echo "  5. Rebuild after .env changes:"
echo "     make build"
echo ""
echo "  6. Check health:"
echo "     make health"
echo ""
echo "Your site will be live at:  https://inflexatechnologies.com"
echo "Your API will be live at:   https://inflexatechnologies.com/api"
echo "Alternate domain:           https://inflexatechnologies.co.uk → redirects"
echo ""
