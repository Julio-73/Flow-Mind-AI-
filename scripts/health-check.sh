#!/usr/bin/env bash
# =============================================================================
# FlowMind AI — Health Check Script
# =============================================================================
# Usage:
#   ./scripts/health-check.sh                          # check all services
#   ./scripts/health-check.sh app                       # check only app
#   ./scripts/health-check.sh worker                    # check only worker
#   ./scripts/health-check.sh --watch                   # continuous monitoring
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

LOAD_ENV="${PROJECT_ROOT}/.env"
if [ -f "$LOAD_ENV" ]; then
  set -a
  source "$LOAD_ENV"
  set +a
fi

APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-flowmind_redis}"
DB_URL="${DATABASE_URL:-postgresql://flowmind:flowmind_pass@localhost:5432/flowmind}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
  local name="$1"
  local status="$2"
  local message="$3"

  if [ "$status" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $name — $message"
  else
    echo -e "${RED}✗${NC} $name — $message"
  fi
  return "$status"
}

check_app() {
  local status_code
  status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${APP_URL}/api/health" 2>/dev/null || echo "000")
  if [ "$status_code" = "200" ]; then
    check "App" 0 "HTTP $status_code — ${APP_URL}/api/health"
  else
    check "App" 1 "HTTP $status_code — ${APP_URL}/api/health"
  fi
}

check_redis() {
  if command -v redis-cli &>/dev/null; then
    local ping
    if [ -n "$REDIS_PASSWORD" ]; then
      ping=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" ping 2>/dev/null)
    else
      ping=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping 2>/dev/null)
    fi
    if [ "$ping" = "PONG" ]; then
      check "Redis" 0 "PONG"
    else
      check "Redis" 1 "No PONG response"
    fi
  else
    check "Redis" 1 "redis-cli not installed"
  fi
}

check_postgres() {
  if command -v psql &>/dev/null; then
    local pg_status
    pg_status=$(psql "$DB_URL" -c "SELECT 1" 2>/dev/null)
    if [ $? -eq 0 ]; then
      check "PostgreSQL" 0 "Connection OK"
    else
      check "PostgreSQL" 1 "Connection failed"
    fi
  else
    check "PostgreSQL" 1 "psql not installed"
  fi
}

check_schema() {
  if command -v psql &>/dev/null; then
    local migration_count
    migration_count=$(psql "$DB_URL" -t -c "SELECT count(*) FROM _prisma_migrations WHERE migration_status = 'success';" 2>/dev/null || echo "0")
    if [ "$migration_count" -gt 0 ] 2>/dev/null; then
      check "Migrations" 0 "$migration_count applied"
    else
      check "Migrations" 1 "No migrations found or table missing"
    fi
  fi
}

check_disk() {
  local usage
  usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
  if [ "$usage" -lt 80 ]; then
    check "Disk" 0 "${usage}% used"
  elif [ "$usage" -lt 90 ]; then
    check "Disk" 0 "${usage}% used (warning)"
  else
    check "Disk" 1 "${usage}% used (CRITICAL)"
  fi
}

check_memory() {
  if command -v free &>/dev/null; then
    local mem_available mem_total mem_pct
    mem_available=$(free -m | awk '/^Mem:/{print $7}')
    mem_total=$(free -m | awk '/^Mem:/{print $2}')
    mem_pct=$(( (mem_total - mem_available) * 100 / mem_total ))
    if [ "$mem_pct" -lt 80 ]; then
      check "Memory" 0 "${mem_pct}% used"
    else
      check "Memory" 1 "${mem_pct}% used (CRITICAL)"
    fi
  fi
}

case "${1:-}" in
  app)
    check_app
    ;;
  worker)
    echo "Worker health check — checking worker process..."
    if command -v docker &>/dev/null; then
      docker ps --filter "name=flowmind-worker" --filter "status=running" --format "{{.Names}}" | grep -q flowmind-worker
      check "Worker" $? "Container running"
    else
      ps aux | grep -q "[t]sx.*worker" || ps aux | grep -q "[b]ull.*worker"
      check "Worker" $? "Process running"
    fi
    ;;
  --watch)
    echo "FlowMind AI — Continuous Health Monitoring (Ctrl+C to stop)"
    echo "═══════════════════════════════════════════════════"
    while true; do
      echo ""
      echo "[$(date '+%Y-%m-%d %H:%M:%S')]"
      check_app
      check_redis
      check_postgres
      check_disk
      check_memory
      sleep 30
    done
    ;;
  *)
    echo "FlowMind AI — Health Check Report"
    echo "═══════════════════════════════════════════════════"
    echo "App URL:  $APP_URL"
    echo "Date:     $(date '+%Y-%m-%d %H:%M:%S')"
    echo "═══════════════════════════════════════════════════"
    echo ""
    check_app
    check_redis
    check_postgres
    check_schema
    check_disk
    check_memory
    echo ""
    echo "═══════════════════════════════════════════════════"
    ;;
esac
