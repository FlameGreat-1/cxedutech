#!/usr/bin/env bash
# ============================================
# Inflexa Update Script (Zero-Downtime)
# Usage: sudo bash update.sh
# ============================================
set -euo pipefail

APP_DIR="/opt/inflexa"
SERVER_DIR="$APP_DIR/server"
SERVICE_USER="inflexa"
SERVICE_NAME="inflexa"

if [ "$(id -u)" -ne 0 ]; then
  echo "[ERROR] This script must be run as root (use sudo)."
  exit 1
fi

echo "============================================"
echo "  Inflexa Update"
echo "============================================"

# Pull latest code
echo "\n[1/5] Pulling latest code..."
cd "$APP_DIR"
git fetch origin main
git reset --hard origin/main

# Install dependencies and build
echo "\n[2/5] Installing dependencies and building..."
cd "$SERVER_DIR"
npm ci --omit=dev
npm run build

# Fix ownership
chown -R "$SERVICE_USER":"$SERVICE_USER" "$APP_DIR"

# Run migrations
echo "\n[3/5] Running database migrations..."
sudo -u "$SERVICE_USER" node dist/migrations/runMigrations.js

# Restart service
echo "\n[4/5] Restarting service..."
systemctl restart "$SERVICE_NAME"

# Health check
echo "\n[5/5] Verifying health..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health || true)

if [ "$HTTP_CODE" = "200" ]; then
  echo "  [OK] Server is healthy (HTTP $HTTP_CODE)"
else
  echo "  [WARNING] Health check returned HTTP $HTTP_CODE"
  echo "  Check logs: sudo journalctl -u $SERVICE_NAME -n 50"
fi

echo "\n============================================"
echo "  Update complete!"
echo "============================================"
