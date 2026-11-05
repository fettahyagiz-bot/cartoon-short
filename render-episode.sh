#!/usr/bin/env bash
# Bölüm renderı: bash render-episode.sh <episode-id> [fast|full]
# Örn (Colab): MEDIA=/content/drive/MyDrive/cartoon-short-medya bash render-episode.sh tarih-g01 fast
# Örn (Ubuntu): MEDIA=~/... bash render-episode.sh tarih-g01 full
# fast = efektsiz+dpr0.5 (hızlı QA), full = tam efekt (final)
set -uo pipefail
EP="${1:?kullanım: render-episode.sh <episode-id, örn. tarih-g01> [fast|full]}"
MODE="${2:-fast}"
if [ -d /content/work/cartoon-short ]; then PROJ=/content/work/cartoon-short; else PROJ="$HOME/cartoon-short"; fi
MEDIA="${MEDIA:-/content/drive/MyDrive/cartoon-short-medya}"
cd "$PROJ"

D="$(MODE="$MODE" python3 - "$MEDIA" "$EP" "$PROJ" <<'EOF'
import json, math, os, shutil, sys
media, epid, proj = sys.argv[1], sys.argv[2], sys.argv[3]
mode = os.environ.get("MODE", "fast")
eps = json.load(open(f"{media}/episodes.json", encoding="utf-8"))
e = next(x for x in eps if x["id"] == epid)
# Klasör adları büyük harf+Türkçe (TARİH/KORKU/KISSA) — episodes.json topic alanıyla eşleşir
import unicodedata
def up(t):
    return t.replace("ı", "I").upper()
ddir = next(x for x in os.listdir(f"{media}/SENARYO ve SESLER") if up(x) == up({"tarih": "TARİH", "korku": "KORKU", "kıssa": "KISSA"}[e["topic"]]))
d = f"{media}/SENARYO ve SESLER/{ddir}"
w = json.load(open(f"{d}/{e['title']}.words.json", encoding="utf-8"))
D = math.ceil(w["duration"] * 30) + 12
os.makedirs(f"{proj}/public/voice", exist_ok=True)
os.makedirs(f"{proj}/public/words", exist_ok=True)
shutil.copy(f"{d}/{e['title']}.mp3", f"{proj}/public/voice/ep.mp3")
shutil.copy(f"{d}/{e['title']}.words.json", f"{proj}/public/words/ep.json")
post = {} if mode == "full" else {"ink": False, "lens": False, "bloom": False, "grade": False, "grain": False, "dpr": 0.5}
props = {"ep": {"id": epid, "title": e["title"], "hook": e["hook"], "topic": e["topic"], "total": D}, "post": post}
json.dump(props, open("/tmp/ep-props.json", "w", encoding="utf-8"), ensure_ascii=False)
print(D)
EOF
)"
echo "== bölüm: $EP | kare: $D | mod: $MODE =="
OUT="$PROJ/out/${EP}-${MODE}.mp4"
npx remotion render src/Root.tsx EpisodeShort "$OUT" --frames="0-${EP_LAST:-$((D - 1))}" --props="$(cat /tmp/ep-props.json)" --timeout=600000 --overwrite 2>&1 | tee "/tmp/ep-${EP}.log"
echo "== ffprobe =="
ffprobe -hide_banner "$OUT" 2>&1 | grep -E "Duration|Stream"
ls -lh "$OUT"
mkdir -p "$MEDIA/out" && cp "$OUT" "$MEDIA/out/" && echo "Drive'a kopyalandı: $MEDIA/out/$(basename "$OUT")"
