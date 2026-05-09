#!/bin/bash
set -Eeuo pipefail

APP_DIR="/var/www/abc-client"
BRANCH="master"
SERVICE="isptik-frontend.service"

cd "$APP_DIR"

echo "==> Pulling latest frontend code..."
OLD_REV="$(git rev-parse HEAD)"
git fetch origin "$BRANCH"
git pull --ff-only origin "$BRANCH"
NEW_REV="$(git rev-parse HEAD)"

if git diff --quiet "$OLD_REV" "$NEW_REV" -- package.json package-lock.json npm-shrinkwrap.json; then
  echo "==> Dependency files unchanged. Skipping dependency install."
else
  echo "==> Dependency files changed. Installing dependencies..."
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
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
