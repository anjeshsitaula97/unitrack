#!/usr/bin/env bash
#
# UniTrack deploy script — run on the production box (Hostinger container):
#
#   bash scripts/deploy.sh
#
# Order: backup uploads -> git pull (fast-forward only) -> npm ci ->
# prisma migrate deploy -> next build -> restart -> health gate (/api/health).
# Everything happens BEFORE the restart, so a failed pull, install, migration
# or build never takes the running app down.
#
# Per-box config goes in .deploy.env next to the checkout (never committed), e.g.
#   BRANCH=master
#   RESTART_CMD="pm2 restart unitrack --update-env"
#   HEALTH_URL="http://127.0.0.1:4028/api/health"
#   NEXT_BUILD_CPUS=2

set -euo pipefail

APP_DIR="$(pwd)"
BRANCH="${BRANCH:-master}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:4028/api/health}"
NEXT_BUILD_CPUS="${NEXT_BUILD_CPUS:-2}"
BACKUP_UPLOADS="${BACKUP_UPLOADS:-1}"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/../backups}"
RESTART_CMD="${RESTART_CMD:-}"

# shellcheck disable=SC1091
[ -f "$APP_DIR/.deploy.env" ] && source "$APP_DIR/.deploy.env"

cd "$APP_DIR"
PREV_SHA="$(git rev-parse --short HEAD)"
echo "==> current release: $PREV_SHA"

echo "==> [1/7] Backing up uploads"
# A previous deploy once wiped gitignored storage/uploads and lost the logos
# (see TASKS.md). Never git-clean on this box; keep tarballs instead.
if [ "$BACKUP_UPLOADS" = "1" ] && [ -d storage ]; then
  mkdir -p "$BACKUP_DIR"
  STAMP="$(date +%Y%m%d-%H%M%S)"
  tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" storage
  ls -1t "$BACKUP_DIR"/uploads-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm -f
  echo "    saved $BACKUP_DIR/uploads-$STAMP.tar.gz (keeping 5 newest)"
else
  echo "    skipped (no storage/ dir or BACKUP_UPLOADS=0)"
fi

if ! grep -q "^UPLOADS_DIR=" .env 2>/dev/null; then
  echo "    NOTE: UPLOADS_DIR is not set in .env — uploads live inside the repo"
  echo "    (storage/uploads). Wiping/re-cloning this checkout deletes them."
fi

echo "==> [2/7] Pulling origin/$BRANCH (fast-forward only)"
git fetch origin "$BRANCH"
git pull --ff-only origin "$BRANCH"
NEW_SHA="$(git rev-parse --short HEAD)"
if [ "$NEW_SHA" = "$PREV_SHA" ]; then
  echo "    already up to date — nothing to deploy."
  exit 0
fi
echo "    $PREV_SHA -> $NEW_SHA"

echo "==> [3/7] Installing exact dependencies (npm ci)"
npm ci --no-audit --no-fund

echo "==> [4/7] Applying pending migrations"
npx prisma migrate deploy

echo "==> [5/7] Building (NEXT_BUILD_CPUS=$NEXT_BUILD_CPUS)"
NEXT_BUILD_CPUS="$NEXT_BUILD_CPUS" npm run build

echo "==> [6/7] Restarting app"
if [ -n "$RESTART_CMD" ]; then
  bash -c "$RESTART_CMD"
elif command -v pm2 >/dev/null 2>&1; then
  pm2 restart unitrack --update-env 2>/dev/null || pm2 start npm --name unitrack -- start
else
  echo "    !! No RESTART_CMD configured and pm2 not found — restart the app"
  echo "    !! manually, then verify: curl -fsS $HEALTH_URL"
fi

echo "==> [7/7] Health gate on $HEALTH_URL"
ok=0
for _ in $(seq 1 12); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then ok=1; break; fi
  echo "    waiting for /api/health ..."
  sleep 5
done

if [ "$ok" != "1" ]; then
  echo "    FAILED: app did not become healthy within 60s of restart."
  echo "    Roll the code back with:"
  echo "      git reset --hard $PREV_SHA && npm ci --no-audit --no-fund && NEXT_BUILD_CPUS=$NEXT_BUILD_CPUS npm run build"
  echo "    then restart and re-check $HEALTH_URL."
  echo "    Applied migrations are additive; do not roll them back unless you"
  echo "    know the previous schema (see: npx prisma migrate resolve)."
  exit 1
fi

echo "    healthy — $NEW_SHA is live."
