#!/usr/bin/env python3
"""Gece (night) preset yaması: lights/grade/story/world + korku preset + EP_LAST override.
Kullanım (Ubuntu, repo kökünde): python3 night-patch.py
Her çapa dosyada birebir bulunamazsa DURUR (bir şey yazılmaz)."""
import sys

EDITORS = []


def edit(path, old, new):
    EDITORS.append((path, old, new))


NIGHT_LIGHT = """    sunCol: "#ffab5e", sunI: 5.5, sky: "#d8b0b8", ground: "#8a6a60", hemiI: 0.55,
    bias: -0.0006, normalBias: 0.03,
  },
  night: {
    az: -35, el: 22,
    lit: [0.32, 0.42, 0.62], shade: [0.05, 0.07, 0.13], lift: [0.03, 0.045, 0.09], lambert: 0.4, sideK: 0.7, term: 0.12,
    charTint: [0.62, 0.72, 0.9], charShade: 0.55, charGrad: 0.12, bodyGrad: 0.3, sideTint: [0.5, 0.6, 0.85],
    blob: [0.1, 0.11, 0.16], actorShadow: true,
    top: "#060a18", hor: "#16233f", skyCurve: [0.0, 0.4, 0.7], fog: "#101b30", fogNear: 20, fogFar: 260, sunDisc: "#e8ecf5",
    sunCol: "#b9c8e8", sunI: 1.1, sky: "#24344f", ground: "#1a2030", hemiI: 0.35,
    bias: -0.0006, normalBias: 0.03,
  },
};"""

NIGHT_LOOK = """    cloud: { lit: "#ffd2a8", mid: "#f2a08f", shade: "#a98fc4" },
    bounce: [0.04, 0.02, 0.0],
    sat: 1.1,
  },
  night: {
    // moonlit night: deep blue horizon fading to near-black, cool water glints
    sky: { c: ["#1a2742", "#141d33", "#0d1526", "#080d1a", "#04060d"], e: [0, 3, 8, 16, 40] },
    water: { near: "#0d2233", mid: "#0a1a2c", far: "#060d18", crest: "#274a66", trough: "#04080f", glint: "#cfe0ff", shade: [0.3, 0.36, 0.55] },
    cloud: { lit: "#2c3d5c", mid: "#1d2942", shade: "#111828" },
    bounce: [0.01, 0.015, 0.03],
    sat: 0.85,
  },
};"""

GRADE_NIGHT = """export const GRADE_NIGHT2: GradeParams = {
  ky: [0, 0.12, 0.3, 0.58, 0.82, 0.94, 1],
  sat: [0.9, 0.95, 1.05],
  tintS: [0.03, 0.008], tintM: [0.008, 0.002], tintH: [-0.004, 0.002],
  vig: [0.24, 0.38],
};
export const GRADES: Record<"day" | "golden" | "night", GradeParams> = { day: GRADE_DAY2, golden: GRADE_GOLDEN2, night: GRADE_NIGHT2 };"""

NIGHT_SHOTS = """  { id: 15, a: 1863, b: TOTAL, light: "day", crowd: "tourists", tau: (t) => t, towns: true },
  { id: 16, a: 2025, b: 2265, light: "night", crowd: "none", tau: (t) => t, towns: true },
  { id: 17, a: 2265, b: 2505, light: "night", crowd: "none", tau: (t) => t },"""

NIGHT_CAMS = """// shot 16 (night town aerial): static framings with night-local push anchors (S2 re-anchored)
const S16a = (f: number) => zoom([17, 13, -52], [0, 9, 4], 44, pushK(f, 2025, 0.002));
const S16b = (f: number) => zoom([10, 10.5, -42], [0, 8, 8], 42, pushK(f, 2085, 0.002));
const S16c = (f: number) => zoom([5, 10, -31], [0, 8.6, 30], 40, pushK(f, 2165, 0.0015, 0.006, 35));
// shot 17 (night bridge wide -> closer, static: the column is gone at night)
const S17a = (f: number) => zoom([14, 10.5, -47], [-1, 7, -4], 40, pushK(f, 2265, 0.0016));
const S17b = (f: number) => zoom([9, 7, -38], [-1, 6.5, 0], 38, pushK(f, 2340, 0.0016));

const CAMS: Record<number, Key[]> = {"""

NIGHT_CAMS_END = """    { f: 1932, cut: true, s: S15c }, // crane pull-out on its own curved path, starts where S15b is (fastest ~1978, whoosh at 1962 mid-acceleration)
  ],
  16: [
    { f: 2025, s: S16a },
    { f: 2085, dur: 60, s: S16b },
    { f: 2165, dur: 60, s: S16c },
  ],
  17: [
    { f: 2265, s: S17a },
    { f: 2340, dur: 60, s: S17b },
  ],
};"""

B = "src/videos/bridge/"
edit(B + "lights.ts",
     'export const LIGHTS: Record<"day" | "golden", LightPreset> = {',
     'export const LIGHTS: Record<"day" | "golden" | "night", LightPreset> = {')
edit(B + "lights.ts",
     '''    sunCol: "#ffab5e", sunI: 5.5, sky: "#d8b0b8", ground: "#8a6a60", hemiI: 0.5,
    bias: -0.0006, normalBias: 0.03,
  },
};''',
     NIGHT_LIGHT)
edit(B + "lights.ts",
     'export const LOOK: Record<"day" | "golden", WorldLook> = {',
     'export const LOOK: Record<"day" | "golden" | "night", WorldLook> = {')
edit(B + "lights.ts",
     '''    cloud: { lit: "#ffd2a8", mid: "#f2a08f", shade: "#a98fc4" },
    bounce: [0.04, 0.02, 0.0],
    sat: 1.1,
  },
};''',
     NIGHT_LOOK)

edit(B + "grade.ts",
     'export const GRADES: Record<"day" | "golden", GradeParams> = { day: GRADE_DAY2, golden: GRADE_GOLDEN2 };',
     GRADE_NIGHT)
edit(B + "grade.ts",
     'export const GRADE_STRENGTH: Record<"day" | "golden", number> = { day: 1, golden: 1 };',
     'export const GRADE_STRENGTH: Record<"day" | "golden" | "night", number> = { day: 1, golden: 1, night: 1 };')
edit(B + "grade.ts",
     'export function gradeFor(fx: GradeEffect, light: "day" | "golden") {',
     'export function gradeFor(fx: GradeEffect, light: "day" | "golden" | "night") {')

edit(B + "story.ts",
     'export type Light = "day" | "golden";',
     'export type Light = "day" | "golden" | "night";')
edit(B + "story.ts",
     '  { id: 15, a: 1863, b: TOTAL, light: "day", crowd: "tourists", tau: (t) => t, towns: true },',
     NIGHT_SHOTS)
edit(B + "story.ts",
     'const CAMS: Record<number, Key[]> = {',
     NIGHT_CAMS)
edit(B + "story.ts",
     '''    { f: 1932, cut: true, s: S15c }, // crane pull-out on its own curved path, starts where S15b is (fastest ~1978, whoosh at 1962 mid-acceleration)
  ],
};''',
     NIGHT_CAMS_END)

edit(B + "world.ts",
     '  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;',
     '  private cloudMaps: Record<"day" | "golden" | "night", THREE.Texture[]>;')
edit(B + "world.ts",
     '    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };',
     '    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.night.cloud)) };')

edit(B + "episodes.ts",
     '  korku: { topic: "korku", shots: [12, 11, 7, 13], segLen: 240 },',
     '  korku: { topic: "korku", shots: [16, 17, 12, 11], segLen: 240 }, // night-first (16/17), golden fallbacks')

edit("render-episode.sh",
     '"$OUT" --frames="0-$((D - 1))"',
     '"$OUT" --frames="0-${EP_LAST:-$((D - 1))}"')

# ---- apply: verify every anchor exactly once, then write ----
plan = {}
for path, old, new in EDITORS:
    try:
        text = open(path, encoding="utf-8").read()
    except FileNotFoundError:
        print(f"HATA: dosya yok: {path}")
        sys.exit(1)
    n = text.count(old)
    if n != 1:
        print(f"HATA: {path}: çapa {n} kez bulundu (1 olmalı): {old[:70]!r}")
        sys.exit(1)
    plan[path] = text.replace(old, new, 1)

for path, text in plan.items():
    open(path, "w", encoding="utf-8").write(text)
    print(f"yazıldı: {path}")
print(f"NIGHT PATCH TAMAM ({len(plan)} dosya)")
