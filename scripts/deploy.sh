#!/usr/bin/env bash
# =============================================================================
# FlowMind AI — Automated Deployment Script
# =============================================================================
# Usage:
#   ./scripts/deploy.sh                              # full deploy
#   ./scripts/deploy.sh --skip-build                  # skip docker build
#   ./scripts/deploy.sh --skip-migrations             # skip db migrations
#   ./scripts/deploy.sh --env production              # use specific env file
#   ./scripts/deploy.sh --rollback                    # rollback to previous
#
# Prerequisites:
#   - Docker & Docker Compose installed
#   - .env file configured
#   - Ports 3000, 5432, 6379 available
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

ENV_FILE=".env"
COMPOSE_FILE="docker-compose.yml"
COMPOSE_PROD_FILE="docker-compose.prod.yml"
SKIP_BUILD=false
SKIP_MIGRATIONS=false
ROLLBACK=false

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

cleanup() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    error "Deploy failed with exit code $exit_code"
  fi
}
trap cleanup EXIT

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build) SKIP_BUILD=true; shift ;;
    --skip-migrations) SKIP_MIGRATIONS=true; shift ;;
    --env) ENV_FILE=".env.$2"; shift 2 ;;
    --rollback) ROLLBACK=true; shift ;;
    --help)
      echo "Usage: $0 [options]"
      echo "  --skip-build         Skip Docker build step"
      echo "  --skip-migrations    Skip database migrations"
      echo "  --env <file>         Use specific env file (default: .env)"
      echo "  --rollback           Rollback to previous deployment"
      exit 0
      ;;
    *) error "Unknown option: $1"; exit 1 ;;
  esac
done

if [ ! -f "$ENV_FILE" ]; then
  error "Environment file '$ENV_FILE' not found. Create it from .env.example"
  exit 1
fi

info "Loading environment: $ENV_FILE"
set -a
source "$ENV_FILE"
set +a

echo ""
echo "═══════════════════════════════════════════════════"
echo "  FlowMind AI — Deployment"
echo "  Environment: ${NODE_ENV:-production}"
echo "  Date:        $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════"
echo ""

if [ "$ROLLBACK" = true ]; then
  warn "Performing rollback to previous deployment..."
  docker compose -f "$COMPOSE_PROD_FILE" pull
  docker compose -f "$COMPOSE_PROD_FILE" up -d --no-build
  ok "Rollback complete"
  exit 0
fi

if [ "$SKIP_BUILD" = false ]; then
  info "Building Docker images..."
  docker compose -f "$COMPOSE_FILE" build --no-cache app
  docker compose -f "$COMPOSE_FILE" build --no-cache worker
  ok "Docker images built"
else
  warn "Skipping Docker build"
fi

info "Checking infrastructure..."
if ! docker compose -f "$COMPOSE_FILE" ps --status running | grep -q "postgres"; then
  info "Starting PostgreSQL..."
  docker compose -f "$COMPOSE_FILE" up -d postgres
  info "Waiting for PostgreSQL to be healthy..."
  docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER:-flowmind}" -t 30
  ok "PostgreSQL is healthy"
fi

if ! docker compose -f "$COMPOSE_FILE" ps --status running | grep -q "redis"; then
  info "Starting Redis..."
  docker compose -f "$COMPOSE_FILE" up -d redis
  sleep 3
  ok "Redis is running"
fi

if [ "$SKIP_MIGRATIONS" = false ]; then
  info "Running database migrations..."
  docker compose -f "$COMPOSE_FILE" run --rm app pnpm db:migrate
  ok "Database migrations complete"
else
  warn "Skipping database migrations"
fi

info "Starting application..."
docker compose -f "$COMPOSE_PROD_FILE" up -d --build

info "Waiting for health checks..."
sleep 10

MAX_RETRIES=30
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    ok "Application is healthy (HTTP 200)"
    break
  fi
  RETRY=$((RETRY + 1))
  sleep 2
done

if [ $RETRY -ge $MAX_RETRIES ]; then
  error "Application health check failed after $MAX_RETRIES retries"
  docker compose -f "$COMPOSE_PROD_FILE" logs --tail=50 app
  exit 1
fi

info "Cleaning up old images..."
docker system prune -f --all --volumes 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════════════════"
ok "  FlowMind AI deployed successfully!"
echo "  URL:      http://localhost:3000"
echo "  Health:   http://localhost:3000/api/health"
echo "  Time:     $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════"
