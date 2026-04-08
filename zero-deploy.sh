#!/usr/bin/env bash
# =============================================================================
# zero-deploy.sh — Near-zero-downtime deployment for Next.js + PM2
#
# Strategy: release-based atomic symlink swap
#   1. Build in an isolated release directory
#   2. Atomically switch `current` symlink only on success
#   3. Reload PM2 (no process kill) — workers drain existing connections
#   4. Roll back to previous release on any failure
#   5. Prune old releases (keep last 5)
# =============================================================================
set -Eeuo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELEASES_DIR="$APP_DIR/releases"
SHARED_DIR="$APP_DIR/shared"          # persistent files (.env, uploads, etc.)
CURRENT_LINK="$APP_DIR/current"       # symlink pointing to the active release
RELEASE_ID="$(date +%Y%m%d%H%M%S)"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"
KEEP_RELEASES=5                        # number of old releases to retain
GIT_BRANCH="${GIT_BRANCH:-master}"

# ── Helpers ───────────────────────────────────────────────────────────────────
log()  { echo "[$(date '+%H:%M:%S')] $*"; }
err()  { echo "[$(date '+%H:%M:%S')] ERROR: $*" >&2; }

# ── Rollback ─────────────────────────────────────────────────────────────────
# Called automatically via ERR trap; switches back to the previous release.
PREVIOUS_RELEASE=""

rollback() {
  local exit_code=$?
  err "Deployment failed (exit $exit_code). Rolling back..."

  # Remove the failed release directory if it was partially created
  [[ -d "$RELEASE_DIR" ]] && rm -rf "$RELEASE_DIR" && log "Removed failed release: $RELEASE_DIR"

  # Restore previous symlink if we already switched it
  if [[ -n "$PREVIOUS_RELEASE" && -d "$PREVIOUS_RELEASE" ]]; then
    ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
    log "Rolled back current → $PREVIOUS_RELEASE"
  else
    log "No previous release to roll back to — live app unchanged."
  fi

  exit "$exit_code"
}

trap rollback ERR

# ── 1. Bootstrap shared + release directories ─────────────────────────────────
log "=== Starting deployment: release $RELEASE_ID ==="

mkdir -p "$RELEASES_DIR" "$SHARED_DIR"
mkdir -p "$RELEASE_DIR"

# ── 2. Pull latest source into release directory ───────────────────────────────
log "Fetching latest code from origin/$GIT_BRANCH..."
# Clone only the working tree (no re-cloning the full repo every time).
# We use git archive to copy the current HEAD into the release folder cleanly.
git -C "$APP_DIR" pull origin "$GIT_BRANCH"
git -C "$APP_DIR" archive HEAD | tar -x -C "$RELEASE_DIR"

# ── 3. Link shared persistent files ───────────────────────────────────────────
# Files that must survive across releases (secrets, uploads, etc.)
# Seed .env from shared if it exists; otherwise copy from the repo as a template.
if [[ -f "$SHARED_DIR/.env" ]]; then
  ln -sf "$SHARED_DIR/.env" "$RELEASE_DIR/.env"
  log "Linked shared .env"
elif [[ -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/.env" "$SHARED_DIR/.env"
  ln -sf "$SHARED_DIR/.env" "$RELEASE_DIR/.env"
  log "Seeded shared .env from repo copy"
else
  log "WARNING: No .env found — app may fail at runtime if env vars are required."
fi

# Link other shared directories (add more as needed)
# mkdir -p "$SHARED_DIR/public/uploads"
# ln -sf "$SHARED_DIR/public/uploads" "$RELEASE_DIR/public/uploads"

# ── 4. Install dependencies ───────────────────────────────────────────────────
log "Installing dependencies..."
npm ci --prefix "$RELEASE_DIR" --omit=dev --prefer-offline

# ── 5. Build ──────────────────────────────────────────────────────────────────
# Build runs entirely inside the release directory.
# The live `current/.next` is never touched during this step.
log "Building Next.js app..."
npm run build --prefix "$RELEASE_DIR"

# Verify the build output exists before proceeding
if [[ ! -d "$RELEASE_DIR/.next" ]]; then
  err "Build output (.next) not found — aborting."
  exit 1
fi
log "Build succeeded."

# ── 6. Atomic symlink switch ──────────────────────────────────────────────────
# Capture the previous release path so rollback can restore it if needed.
if [[ -L "$CURRENT_LINK" ]]; then
  PREVIOUS_RELEASE="$(readlink -f "$CURRENT_LINK")"
fi

log "Switching current → $RELEASE_DIR"
# `ln -sfn` is atomic on Linux (replaces the symlink in one syscall)
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

# ── 7. PM2 reload (zero-downtime) ─────────────────────────────────────────────
# `pm2 reload` performs a rolling restart: the new worker is spawned and starts
# accepting connections before the old one is killed — no dropped requests.
# PM2 must be configured to point to `current/` (the symlink), not a fixed path.
log "Reloading PM2 processes..."
if pm2 describe next-app > /dev/null 2>&1; then
  pm2 reload "$APP_DIR/current/ecosystem.config.js" --update-env
else
  # First-ever deploy: start the process
  pm2 start "$APP_DIR/current/ecosystem.config.js"
fi

pm2 save
log "PM2 reloaded and state saved."

# ── 8. Prune old releases ─────────────────────────────────────────────────────
# Keep only the last $KEEP_RELEASES releases; delete the rest.
log "Pruning old releases (keeping last $KEEP_RELEASES)..."
mapfile -t OLD_RELEASES < <(
  ls -1dt "$RELEASES_DIR"/[0-9]* 2>/dev/null | tail -n +"$((KEEP_RELEASES + 1))"
)
for old in "${OLD_RELEASES[@]}"; do
  log "Removing old release: $old"
  rm -rf "$old"
done

# ── Done ──────────────────────────────────────────────────────────────────────
log "=== Deployment complete: $RELEASE_DIR ==="
log "Active release: $(readlink -f "$CURRENT_LINK")"
