// Per-topic shot presets for the generic EpisodeShort renderer.
// Shot ids refer to story.ts SHOTS (camera + light + crowd come from there).
// Collapse/fall/water shots (8, 9, 10) are EXCLUDED: they show the destroyed bridge.
// korku uses golden-hour shots as a night stand-in until the night light preset lands.
import { SHOTS } from "./story";

export type EpisodePreset = { topic: string; shots: number[]; segLen: number };

export const EPISODE_PRESETS: Record<string, EpisodePreset> = {
  tarih: { topic: "tarih", shots: [1, 2, 3, 6, 15, 14], segLen: 240 },
  kıssa: { topic: "kıssa", shots: [2, 15, 6, 5], segLen: 240 },
  korku: { topic: "korku", shots: [12, 11, 7, 13], segLen: 240 },
};

export type Seg = { shot: number; start: number; len: number };

/** cut the episode into ~8 s segments, cycling the preset shot list */
export const planSegments = (preset: EpisodePreset, total: number): Seg[] => {
  const segs: Seg[] = [];
  let f = 0;
  let i = 0;
  while (f < total) {
    const shot = preset.shots[i % preset.shots.length];
    const len = Math.min(preset.segLen, total - f);
    segs.push({ shot, start: f, len });
    f += len;
    i += 1;
  }
  return segs;
};

/**
 * map an episode frame to (shot, shot-local frame): the shot's original camera
 * move replays looped inside its own [a, b) range, so moves never freeze.
 */
export const segmentAt = (segs: Seg[], F: number): { shot: number; local: number } => {
  const s = segs.find((x) => F >= x.start && F < x.start + x.len) ?? segs[segs.length - 1];
  const def = SHOTS[s.shot - 1];
  const L = def.b - def.a;
  return { shot: s.shot, local: def.a + ((F - s.start) % L) };
};
