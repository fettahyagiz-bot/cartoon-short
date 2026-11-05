#!/usr/bin/env python3
"""mp3 -> <aynı-ad>.words.json (kelime zamanlamalı, faster-whisper, GPU).
Kullanım: python3 colab-whisper.py <MEDYA-KLASÖRÜ>
words.json'lar mp3'lerin yanına yazılır (Drive'da kalıcı).
"""
import json
import sys
from pathlib import Path

media = Path(sys.argv[1])
mp3s = sorted(media.rglob("*.mp3"))
print(f"{len(mp3s)} mp3 bulundu")
for m in mp3s:
    print(" -", m.relative_to(media), f"{m.stat().st_size // 1024} KB")

from faster_whisper import WhisperModel

try:
    model = WhisperModel("large-v3", device="cuda", compute_type="float16")
    print("model: large-v3 (cuda)")
except Exception as e:
    print("large-v3 açılmadı, medium deneniyor:", e)
    model = WhisperModel("medium", device="cuda", compute_type="float16")
    print("model: medium (cuda)")

for m in mp3s:
    out = m.with_suffix(".words.json")
    if out.exists():
        print("atlanıyor (var):", out.name)
        continue
    print("transcribe:", m.name)
    segments, info = model.transcribe(
        str(m), language="tr", word_timestamps=True, vad_filter=True
    )
    words = []
    for s in segments:
        for w in (s.words or []):
            t = w.word.strip()
            if t:
                words.append({"w": t, "s": round(w.start, 2), "e": round(w.end, 2)})
    json.dump(
        {"file": m.name, "duration": round(info.duration, 2), "words": words},
        open(out, "w", encoding="utf-8"),
        ensure_ascii=False,
    )
    print(f"  -> {out.name}: {info.duration:.1f} sn, {len(words)} kelime")
print("WHISPER TAMAM")
