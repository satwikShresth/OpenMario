#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TERMS=(202615 202625 202635)

for TERM_ID in "${TERMS[@]}"; do
  echo "========================================"
  echo "Term $TERM_ID — scrape"
  echo "========================================"

  DATA_DIR="./data/$TERM_ID"
  rm -rf "$DATA_DIR"
  mkdir -p "$DATA_DIR/.auth"
  cp data/.auth/session.json "$DATA_DIR/.auth/session.json"

  DATA_DIR="$DATA_DIR" bun run src/index.ts scrape all --term-id "$TERM_ID"

  echo ""
  echo "Term $TERM_ID — push sections to DB"
  TERM_ID="$TERM_ID" DATA_DIR="$DATA_DIR" bun run src/db/push.sections.ts
  echo ""
done

echo "========================================"
echo "Push course history (from last term data dir)"
echo "========================================"
DATA_DIR="./data/202635" bun run src/db/push.course_history.ts

echo ""
echo "All terms complete."
