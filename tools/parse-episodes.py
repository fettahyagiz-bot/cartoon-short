#!/usr/bin/env python3
"""Senaryo .md'leri -> episodes.json (bölüm, başlık, kanca, metin, kelime sayısı).
Kullanım: python3 parse-episodes.py <MEDYA-KLASÖRÜ>
Beklenen düzen: MEDYA/{TARİH,KORKU,KISSA}/*.md  (## ... GÜN N — başlık kalıbı)
"""
import json
import re
import sys
from pathlib import Path

media = Path(sys.argv[1])
TOPICS = {"TARİH": "tarih", "KORKU": "korku", "KISSA": "kıssa"}

episodes = []
for dname, topic in TOPICS.items():
    d = media / dname
    mds = sorted(d.glob("*.md")) if d.exists() else []
    if not mds:
        print(f"UYARI: {dname}/ içinde .md yok")
        continue
    text = mds[0].read_text(encoding="utf-8")
    print(f"{dname}: {mds[0].name} ({len(text)} karakter)")
    parts = re.split(r"(?m)^##\s+", text)
    n = 0
    for p in parts[1:]:
        lines = p.strip().split("\n")
        m = re.search(r"G.N\s+(\d+)\s*[—–\-:]+\s*(.*)", lines[0])
        if not m:
            continue
        gun, title = int(m.group(1)), m.group(2).strip()
        title = re.sub(r"^KONU\s*", "", title).strip("* _")
        rest = [ln for ln in lines[1:] if ln.strip() and ln.strip() != "---"]
        hook = rest[0].strip().strip('"“”* ') if rest else ""
        body = "\n".join(rest[1:]).strip()
        wc = len((hook + " " + body).split())
        episodes.append(
            {
                "id": f"{topic}-g{gun:02d}",
                "topic": topic,
                "gun": gun,
                "title": title,
                "hook": hook,
                "body": body,
                "words": wc,
            }
        )
        n += 1
    mp3s = sorted((media / dname).glob("*.mp3")) if d.exists() else []
    print(f"  -> {n} bölüm, {len(mp3s)} mp3")

episodes.sort(key=lambda e: (e["topic"], e["gun"]))
out = media / "episodes.json"
json.dump(episodes, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"EPISODES: {len(episodes)} bölüm -> episodes.json")
for e in episodes[:9]:
    print(f"  {e['id']}: {e['title'][:45]} ({e['words']} kelime)")
