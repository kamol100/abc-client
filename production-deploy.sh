#!/bin/bash
set -Eeuo pipefail

APP_DIR="/var/www/abc-client"
BRANCH="master"
SERVICE="isptik-frontend.service"

cd "$APP_DIR"

echo "==> Pulling latest frontend code..."
git fetch origin "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Installing dependencies..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "==> Building Next.js app..."
npm run build

if [ ! -d ".next" ]; then
  echo "Build failed: .next folder not found."
  exit 1
fi

echo "==> Restarting frontend service..."
sudo systemctl restart "$SERVICE"

echo "==> Checking service status..."
sudo systemctl status "$SERVICE" --no-pager -l

echo "==> Verifying frontend response..."
curl -I https://app.isptik.com || true

echo "Deployment done."
