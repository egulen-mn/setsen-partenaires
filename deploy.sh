#!/usr/bin/env bash
# =============================================================================
# deploy.sh — setsen-partenaires (partenaires.setsen.fr)
# Usage: bash deploy.sh
# =============================================================================
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE="partenaires-web-1"
COMPOSE="docker compose"

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${CYAN}[deploy]${RESET} $*"; }
ok()   { echo -e "${GREEN}[  ok  ]${RESET} $*"; }
warn() { echo -e "${YELLOW}[ warn ]${RESET} $*"; }
die()  { echo -e "${RED}[ fail ]${RESET} $*" >&2; exit 1; }

# ── Pre-flight ────────────────────────────────────────────────────────────────
cd "$PROJECT_DIR"

log "Project : ${BOLD}setsen-partenaires${RESET} → ${PROJECT_DIR}"
log "Target  : ${BOLD}partenaires.setsen.fr${RESET}"
echo

# Confirm before proceeding
read -rp "$(echo -e "${YELLOW}Proceed with full no-cache rebuild and redeploy? [y/N] ${RESET}")" confirm
[[ "${confirm,,}" == "y" ]] || { warn "Aborted."; exit 0; }
echo

# ── Step 1: Build ─────────────────────────────────────────────────────────────
log "Step 1/3 — Building image (no cache)…"
$COMPOSE build --no-cache web \
  || die "Build failed. Container NOT restarted — current version still running."
ok "Build succeeded."
echo

# ── Step 2: Recreate container ────────────────────────────────────────────────
log "Step 2/3 — Recreating container…"
$COMPOSE up -d web \
  || die "Container failed to start. Check: docker logs $SERVICE"
ok "Container recreated."
echo

# ── Step 3: Health check ──────────────────────────────────────────────────────
log "Step 3/3 — Waiting for health check (up to 60 s)…"
SECONDS_WAITED=0
while true; do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$SERVICE" 2>/dev/null || echo "not_found")
  if [[ "$STATUS" == "healthy" ]]; then
    ok "Container is ${GREEN}healthy${RESET}."
    break
  elif [[ "$STATUS" == "unhealthy" ]]; then
    die "Container is unhealthy. Check logs: docker logs $SERVICE"
  fi
  if (( SECONDS_WAITED >= 60 )); then
    die "Health check timed out after 60 s. Check: docker logs $SERVICE"
  fi
  sleep 5
  (( SECONDS_WAITED += 5 ))
  log "  … still starting (${SECONDS_WAITED}s)"
done
echo

# ── Summary ───────────────────────────────────────────────────────────────────
ok "${BOLD}Deploy complete.${RESET}"
echo -e "  ${CYAN}partenaires.setsen.fr${RESET}  →  https://partenaires.setsen.fr"
echo
echo -e "  Logs : ${BOLD}docker logs -f $SERVICE${RESET}"
