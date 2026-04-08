#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELEASES_DIR="$APP_DIR/releases"
SHARED_DIR="$APP_DIR/shared"
CURRENT_LINK="$APP_DIR/current"
ECOSYSTEM_FILE="$APP_DIR/ecosystem.config.js"
LOG_DIR="$APP_DIR/shared/logs"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
GIT_REMOTE="${GIT_REMOTE:-origin}"
GIT_BRANCH="${GIT_BRANCH:-master}"
RELEASE_ID="$(date +%Y%m%d%H%M%S)"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"
LOG_FILE="$LOG_DIR/deploy-$RELEASE_ID.log"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PREVIOUS_RELEASE=""
SWITCHED_CURRENT="false"
PM2_RELOADED="false"

mkdir -p "$RELEASES_DIR" "$SHARED_DIR" "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

ok() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $*${NC}"
}

warn() {
  echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $*${NC}"
}

err() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*${NC}" >&2
}

atomic_symlink_swap() {
  local target_dir="$1"
  local link_path="$2"
  local temp_link="${link_path}.tmp.$$"

  ln -s "$target_dir" "$temp_link"
  mv -Tf "$temp_link" "$link_path"
}

link_shared_files() {
  if [[ -f "$SHARED_DIR/.env" ]]; then
    ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.env"
    log "Linked shared .env"
    return
  fi

  if [[ -f "$APP_DIR/.env" ]]; then
    cp "$APP_DIR/.env" "$SHARED_DIR/.env"
    ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.env"
    log "Seeded shared .env from app root"
    return
  fi

  warn "No .env file found in shared or app root."
}

cleanup_temp_link() {
  rm -f "${CURRENT_LINK}.tmp."* 2>/dev/null || true
}

rollback() {
  local exit_code=$?

  cleanup_temp_link
  err "Deployment failed with exit code $exit_code"

  if [[ "$SWITCHED_CURRENT" == "true" && -n "$PREVIOUS_RELEASE" && -d "$PREVIOUS_RELEASE" ]]; then
    warn "Restoring previous release symlink"
    atomic_symlink_swap "$PREVIOUS_RELEASE" "$CURRENT_LINK"

    if command -v pm2 > /dev/null 2>&1; then
      warn "Reloading PM2 back to previous release"
      pm2 startOrReload "$ECOSYSTEM_FILE" --only isp --update-env || true
      pm2 save || true
    fi
  fi

  if [[ -d "$RELEASE_DIR" ]]; then
    warn "Removing failed release $RELEASE_DIR"
    rm -rf "$RELEASE_DIR"
  fi

  err "Rollback complete. See log: $LOG_FILE"
  exit "$exit_code"
}

trap rollback ERR

log "=== Starting deployment for release $RELEASE_ID ==="

if [[ ! -f "$ECOSYSTEM_FILE" ]]; then
  err "Missing PM2 ecosystem file: $ECOSYSTEM_FILE"
  exit 1
fi

mkdir -p "$RELEASE_DIR"

if [[ -L "$CURRENT_LINK" ]]; then
  PREVIOUS_RELEASE="$(readlink -f "$CURRENT_LINK")"
  log "Previous release: $PREVIOUS_RELEASE"
fi

log "Fetching latest code from $GIT_REMOTE/$GIT_BRANCH"
git -C "$APP_DIR" fetch --prune "$GIT_REMOTE" "$GIT_BRANCH"
git -C "$APP_DIR" archive "$GIT_REMOTE/$GIT_BRANCH" | tar -x -C "$RELEASE_DIR"

link_shared_files

log "Installing dependencies in release directory"
npm ci --prefix "$RELEASE_DIR" --prefer-offline

log "Building Next.js app"
npm run build --prefix "$RELEASE_DIR"

if [[ ! -f "$RELEASE_DIR/.next/BUILD_ID" ]]; then
  err "Build output is incomplete. Missing .next/BUILD_ID"
  exit 1
fi
ok "Build completed successfully"

log "Pruning devDependencies"
npm prune --prefix "$RELEASE_DIR" --omit=dev

log "Atomically switching current release symlink"
atomic_symlink_swap "$RELEASE_DIR" "$CURRENT_LINK"
SWITCHED_CURRENT="true"

log "Reloading PM2 using stable ecosystem file"
pm2 startOrReload "$ECOSYSTEM_FILE" --only isp --update-env
PM2_RELOADED="true"
pm2 save
ok "PM2 reload completed"

log "Pruning old releases, keeping last $KEEP_RELEASES"
mapfile -t OLD_RELEASES < <(ls -1dt "$RELEASES_DIR"/[0-9]* 2>/dev/null | tail -n +"$((KEEP_RELEASES + 1))")
for old_release in "${OLD_RELEASES[@]}"; do
  if [[ "$old_release" != "$PREVIOUS_RELEASE" && "$old_release" != "$RELEASE_DIR" ]]; then
    log "Removing old release: $old_release"
    rm -rf "$old_release"
  fi
done

cleanup_temp_link
trap - ERR

ok "=== Deployment complete ==="
ok "Active release: $(readlink -f "$CURRENT_LINK")"
ok "Log file: $LOG_FILE"
