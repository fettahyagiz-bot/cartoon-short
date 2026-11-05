#!/usr/bin/env bash
# Colab render sarıcı: render + ffprobe doğrulama + Drive'a kopya.
# Kullanım: DRIVE_OUT=/content/drive/MyDrive/... bash colab-render.sh <COMP> <OUT.mp4> [EK-FLAGLAR...]
set -uo pipefail
cd /content/work/cartoon-short
COMP="${1:?kullanım: colab-render.sh <COMP> <OUT.mp4> [flaglar]}"
OUT="${2:?kullanım: colab-render.sh <COMP> <OUT.mp4> [flaglar]}"
shift 2 || true
LOG="/content/work/render-$(date +%H%M).log"
echo "== render: $COMP -> $OUT =="
npx remotion render src/Root.tsx "$COMP" "$OUT" \
  --timeout=600000 --overwrite "$@" 2>&1 | tee "$LOG"
echo "== ffprobe =="
ffprobe -hide_banner "$OUT" 2>&1 | grep -E "Duration|Stream"
ls -lh "$OUT"
if [ -n "${DRIVE_OUT:-}" ]; then
  cp "$OUT" "$DRIVE_OUT/"
  echo "Drive'a kopyalandı: $DRIVE_OUT/$(basename "$OUT")"
fi
