#!/usr/bin/env bash
# ============================================
# Inflexa VPS Deployment Script
# Tested on: Ubuntu 22.04 / 24.04, Debian 12
# Usage: sudo bash deploy.sh YOUR_DOMAIN
# ============================================
set -euo pipefail

DOMAIN="${1:-}"
APP_DIR="/opt/inflexa"
SERVER_DIR="$APP_DIR/inflexa/server"
REPO_URL="https://gitlab.com/exoper-chi/cxedutech.git"
NODE_VERSION=20
SERVICE_USER="inflexa"

if [ -z "$DOMAIN" ]; then
  echo "Usage: sudo bash deploy.sh YOUR_DOMAIN"
  echo "Example: sudo bash deploy.sh api.inflexa.com"
  exit 1
fi

if [ "$(id -u)" -ne 0 ]; then
  echo "[ERROR] This script must be run as root (use sudo)."
  exit 1
fi

echo "============================================"
echo "  Inflexa Deployment - $DOMAIN"
echo "============================================"

# ----------------------------------------
# 1. System packages
# ----------------------------------------
echo "\n[1/9] Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl git build-essential nginx certbot python3-certbot-nginx ufw

# ----------------------------------------
# 2. Node.js 20
# ----------------------------------------
echo "\n[2/9] Installing Node.js $NODE_VERSION..."
if ! command -v node &>/dev/null || [[ "$(node -v)" != v${NODE_VERSION}* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y -qq nodejs
fi
echo "  Node: $(node -v), npm: $(npm -v)"

# ----------------------------------------
# 3. PostgreSQL 16
# ----------------------------------------
echo "\n[3/9] Installing PostgreSQL 16..."
if ! command -v psql &>/dev/null; then
  sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
  apt-get update -qq
  apt-get install -y -qq postgresql-16
fi
systemctl enable postgresql
systemctl start postgresql
echo "  PostgreSQL: $(psql --version)"

# ----------------------------------------
# 4. Create system user
# ----------------------------------------
echo "\n[4/9] Creating system user '$SERVICE_USER'..."
if ! id "$SERVICE_USER" &>/dev/null; then
  useradd --system --shell /usr/sbin/nologin --home-dir "$APP_DIR" "$SERVICE_USER"
fi

# ----------------------------------------
# 5. Clone / pull repository
# ----------------------------------------
echo "\n[5/9] Setting up application code..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin main
  git reset --hard origin/main
else
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$SERVER_DIR"

# ----------------------------------------
# 6. Build application
# ----------------------------------------
echo "\n[6/9] Installing dependencies and building..."
npm ci --omit=dev
npm run build

mkdir -p uploads
chown -R "$SERVICE_USER":"$SERVICE_USER" "$APP_DIR"

# ----------------------------------------
# 7. Environment file check
# ----------------------------------------
echo "\n[7/9] Checking environment file..."
if [ ! -f "$SERVER_DIR/.env" ]; then
  cp "$SERVER_DIR/.env.example" "$SERVER_DIR/.env"
  chmod 600 "$SERVER_DIR/.env"
  chown "$SERVICE_USER":"$SERVICE_USER" "$SERVER_DIR/.env"
  echo "  [WARNING] .env created from .env.example."
  echo "  You MUST edit $SERVER_DIR/.env with real values before starting."
  echo "  Then run: sudo systemctl restart inflexa"
else
  echo "  .env already exists."
fi

# ----------------------------------------
# 8. Systemd service
# ----------------------------------------
echo "\n[8/9] Setting up systemd service..."
cp "$SERVER_DIR/deploy/inflexa.service" /etc/systemd/system/inflexa.service
systemctl daemon-reload
systemctl enable inflexa

# ----------------------------------------
# 9. Nginx + SSL
# ----------------------------------------
echo "\n[9/9] Configuring Nginx and SSL..."
sed "s/YOUR_DOMAIN/$DOMAIN/g" "$SERVER_DIR/nginx/inflexa.conf" > /etc/nginx/sites-available/inflexa
ln -sf /etc/nginx/sites-available/inflexa /etc/nginx/sites-enabled/inflexa
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

# SSL certificate
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo "  Obtaining SSL certificate for $DOMAIN..."
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" --redirect
else
  echo "  SSL certificate already exists for $DOMAIN."
fi

# ----------------------------------------
# Firewall
# ----------------------------------------
echo "\nConfiguring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ----------------------------------------
# Done
# ----------------------------------------
echo ""
echo "============================================"
echo "  Deployment complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Edit $SERVER_DIR/.env with real values"
echo "  2. Create the database:"
echo "     sudo -u postgres createuser inflexa"
echo "     sudo -u postgres createdb -O inflexa inflexa"
echo "  3. Run migrations:"
echo "     cd $SERVER_DIR"
echo "     sudo -u inflexa node dist/migrations/runMigrations.js"
echo "  4. Create the first admin user:"
echo "     cd $SERVER_DIR"
echo "     sudo -u inflexa node dist/scripts/createAdmin.js"
echo "  5. Start the server:"
echo "     sudo systemctl start inflexa"
echo "  6. Check status:"
echo "     sudo systemctl status inflexa"
echo "     sudo journalctl -u inflexa -f"
echo ""
echo "Your API will be live at: https://$DOMAIN/api"
echo ""
