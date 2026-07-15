#!/usr/bin/env bash
# =============================================================================
# FlowMind AI — PostgreSQL Database Restore
# =============================================================================
# Usage:
#   ./scripts/restore.sh backups/2024-01-01/flowmind_20240101_120000.sql.gz
#   ./scripts/restore.sh /absolute/path/to/dump.sql.gz
#   ./scripts/restore.sh /absolute/path/to/dump.sql        # uncompressed
#   ./scripts/restore.sh /path/to/dump.dump                 # custom format
#
# ⚠️  DANGER: This will DROP existing data and replace it with the backup.
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

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup-file>"
  echo "Example: $0 backups/2024-01-01/flowmind_20240101_120000.sql.gz"
  exit 1
fi

RESTORE_FILE="$1"
DB_URL="${DATABASE_URL:-}"

if [ -z "$DB_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is required"
  exit 1
fi

if [ ! -f "$RESTORE_FILE" ]; then
  echo "ERROR: File not found: $RESTORE_FILE"
  exit 1
fi

echo "═══════════════════════════════════════════════════"
echo "  FlowMind AI — Database Restore"
echo "═══════════════════════════════════════════════════"
echo "  File: $RESTORE_FILE"
echo "  DB:   $(echo "$DB_URL" | sed 's|//[^:]*:[^@]*@|//***:***@|')"
echo "═══════════════════════════════════════════════════"
echo ""
read -rp "⚠️  This will DESTROY current data. Type 'yes' to continue: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

echo ""
echo "Dropping and recreating schema..."
psql "$DB_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "Restoring from backup..."
case "$RESTORE_FILE" in
  *.gz)
    gunzip -c "$RESTORE_FILE" | psql "$DB_URL"
    ;;
  *.dump | *.custom)
    pg_restore --clean --if-exists --no-owner --no-acl -d "$DB_URL" "$RESTORE_FILE"
    ;;
  *.sql)
    psql "$DB_URL" < "$RESTORE_FILE"
    ;;
  *)
    echo "Unknown format. Trying psql restore..."
    psql "$DB_URL" < "$RESTORE_FILE"
    ;;
esac

echo "═══════════════════════════════════════════════════"
echo "  Restore complete!"
echo "═══════════════════════════════════════════════════"
