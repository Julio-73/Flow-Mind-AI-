#!/usr/bin/env bash
# =============================================================================
# FlowMind AI — PostgreSQL Database Backup
# =============================================================================
# Usage:
#   ./scripts/backup.sh                        # backup with defaults
#   ./scripts/backup.sh /custom/path           # backup to custom dir
#   ./scripts/backup.sh .                      # backup to current dir
#
# Restore:
#   ./scripts/restore.sh /path/to/dump.sql
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

BACKUP_BASE="${1:-$PROJECT_ROOT/backups}"
BACKUP_DIR="${BACKUP_BASE}/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

DB_URL="${DATABASE_URL:-}"

if [ -z "$DB_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is required"
  exit 1
fi
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
BACKUP_FILE="${BACKUP_DIR}/flowmind_$(date +%Y%m%d_%H%M%S).sql.gz"
BACKUP_LOG="${BACKUP_DIR}/backup.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$BACKUP_LOG"
}

log "Starting backup..."
log "Database URL: $(echo "$DB_URL" | sed 's|//[^:]*:[^@]*@|//***:***@|')"
log "Backup dir: $BACKUP_DIR"

if ! command -v pg_dump &>/dev/null; then
  log "ERROR: pg_dump not found. Install postgresql-client."
  exit 1
fi

pg_dump "$DB_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  --format=custom \
  --file="${BACKUP_FILE%.gz}" \
  --verbose 2>&1 | tee -a "$BACKUP_LOG"

gzip -f "${BACKUP_FILE%.gz}"
log "Backup complete: $BACKUP_FILE"

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Backup size: $SIZE"

log "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_BASE" -maxdepth 2 -name "*.sql.gz" -type f -mtime "+$RETENTION_DAYS" -delete
find "$BACKUP_BASE" -maxdepth 1 -type d -empty -delete 2>/dev/null || true

log "Backup finished successfully."

if command -v curl &>/dev/null && [ -n "${HEALTHCHECKS_URL:-}" ]; then
  curl -fsS -m 10 --retry 3 "${HEALTHCHECKS_URL}/backup" 2>/dev/null || true
fi
