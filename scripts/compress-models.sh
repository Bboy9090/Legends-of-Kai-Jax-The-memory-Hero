#!/usr/bin/env bash
# Meshopt + WebP compress every GLB in apps/web/public/models, keeping originals in models_raw_backup/.
# Usage: npm run optimize:models   (idempotent: already-compressed files are skipped)
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
MODELS_DIR="$REPO_ROOT/apps/web/public/models"
BACKUP_DIR="$REPO_ROOT/models_raw_backup"
GLTF_TRANSFORM="npx --yes @gltf-transform/cli@4"

mkdir -p "$BACKUP_DIR"
before_bytes=0
after_bytes=0
compressed=0
skipped=0

while IFS= read -r -d '' file; do
  rel="${file#"$MODELS_DIR"/}"
  size_before=$(stat -c%s "$file")

  if grep -aq "EXT_meshopt_compression" "$file"; then
    skipped=$((skipped + 1))
    before_bytes=$((before_bytes + size_before))
    after_bytes=$((after_bytes + size_before))
    continue
  fi

  mkdir -p "$BACKUP_DIR/$(dirname "$rel")"
  [ -f "$BACKUP_DIR/$rel" ] || cp "$file" "$BACKUP_DIR/$rel"

  tmp="$(mktemp --suffix=.glb)"
  if $GLTF_TRANSFORM optimize "$file" "$tmp" \
      --compress meshopt \
      --texture-compress webp \
      --texture-size 512 \
      --simplify true --simplify-ratio 0.85 >/dev/null 2>&1; then
    mv "$tmp" "$file"
    compressed=$((compressed + 1))
  else
    rm -f "$tmp"
    echo "FAILED (left untouched): $rel" >&2
  fi

  before_bytes=$((before_bytes + size_before))
  after_bytes=$((after_bytes + $(stat -c%s "$file")))
done < <(find "$MODELS_DIR" -type f -name '*.glb' -print0)

mb() { awk -v b="$1" 'BEGIN { printf "%.1f", b / 1048576 }'; }
echo "compressed=$compressed skipped=$skipped"
echo "total before: $(mb "$before_bytes") MB  ->  after: $(mb "$after_bytes") MB"
