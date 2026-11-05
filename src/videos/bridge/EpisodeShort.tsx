// Generic episode renderer: the same World/camera/post chain as BridgeShort,
// but driven by an episode (title/hook/audio/word timings) instead of the
// bespoke bridge-collapse story. Shots cycle through a per-topic preset list
// with hard cuts; captions come from public/words/ep.json
// (words.json format: {file, duration, words:[{w,s,e}]}), audio from
// public/voice/ep.mp3. Register duration is a ceiling (EPISODE_MAX); the real
// length comes from --frames=0-(D-1), where D = ceil(duration*30)+12.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, continueRender, delayRender, getInputProps, staticFile, useCurrentFrame, useDelayRender } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World, loadKit } from "./world";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur, GrainEffect } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";
import { Kit } from "./build";
import { SHOTS, dofAt } from "./story";
import { EPISODE_PRESETS, planSegments, segmentAt } from "./episodes";

export const EPISODE_MAX = 2700;
export const HOOK_END = 60;

export type EpProps = { id: string; title: string; hook: string; topic: string; total: number };
const ep = (): EpProps =>
  ((getInputProps() as { ep?: EpProps }).ep ?? { id: "tarih-g01", title: "", hook: "", topic: "tarih", total: 1800 });

type PostToggles = { ink: boolean; lens: boolean; pre: boolean; bloom: boolean; grade: boolean; grain: boolean };
const toggles = (): PostToggles => ({ ink: true, lens: true, pre: true, bloom: true, grade: true, grain: false, ...((getInputProps() as { post?: Partial<PostToggles> }).post ?? {}) });

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("episode kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  return kit;
};

const Inner: React.FC<{ kit: Kit }> = ({ kit }) => {
  const F = useCurrentFrame();
  const { advance, camera, scene } = useThree();
  // composer settle: a still/first frame captures before any advance runs and the
  // composer stays empty. Pump a few frames ourselves, then release the lock.
  const { delayRender: delaySettle, continueRender: continueSettle } = useDelayRender();
  const [settleHandle] = useState(() => delaySettle("composer settle"));
  useEffect(() => {
    let done = false;
    const finish = () => { if (!done) { done = true; continueSettle(settleHandle); } };
    let n = 0;
    const t = setInterval(() => { advance(performance.now()); n += 1; if (n >= 4) { clearInterval(t); finish(); } }, 150);
    const failsafe = setTimeout(finish, 30000);
    return () => { clearInterval(t); clearTimeout(failsafe); finish(); };
  }, [advance, continueSettle, settleHandle]);

  const world = useMemo(() => new World(kit), [kit]);
  const target = useMemo(() => new THREE.Vector3(), []);
  const on = useMemo(toggles, []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
    grain: new GrainEffect({ amount: 0.025, cellPx: 1.5 }),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const post = useMemo(() => (
    <EffectComposer multisampling={4}>
      {on.ink ? <primitive object={fx.ink} dispose={null} /> : null}
      {on.lens && on.pre ? <primitive object={fx.lens.pre} dispose={null} /> : null}
      {on.lens ? <primitive object={fx.lens.main} dispose={null} /> : null}
      {on.bloom ? <primitive object={fx.bloom} dispose={null} /> : null}
      <primitive object={fx.tone} dispose={null} />
      {on.grade ? <primitive object={fx.grade} dispose={null} /> : null}
      {on.grain ? <primitive object={fx.grain} dispose={null} /> : null}
    </EffectComposer>
  ), [fx, on]);
  const cam = camera as THREE.PerspectiveCamera;
  const p = ep();
  const preset = EPISODE_PRESETS[p.topic] ?? EPISODE_PRESETS.tarih;
  const segs = useMemo(() => planSegments(preset, p.total), [preset, p.total]);
  const { shot, local } = segmentAt(segs, Math.min(F, p.total - 1));
  target.copy(world.update(shot, local, cam, scene));
  noInkFallback(world.root);
  const d = dofAt(local);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus(local)); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, SHOTS[shot - 1].light);
  fx.grain.seed = F;
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
const ShotView: React.FC<{ kit: Kit }> = ({ kit }) => (
  <AbsoluteFill>
    <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 40, near: 0.2, far: 1500 }}>
      <Inner kit={kit} />
    </ThreeCanvas>
  </AbsoluteFill>
);

type W = { w: string; s: number; e: number };

const Captions: React.FC = () => {
  const F = useCurrentFrame();
  const [words, setWords] = useState<W[] | null>(null);
  const [handle] = useState(() => delayRender("episode words"));
  useEffect(() => {
    fetch(staticFile("words/ep.json"))
      .then((r) => r.json())
      .then((j) => { setWords(j.words); continueRender(handle); })
      .catch(() => continueRender(handle));
  }, [handle]);
  if (!words) return null;
  const t = F / 30;
  const cur = words.findIndex((w) => t >= w.s && t < w.e);
  if (cur < 0) return null;
  const lo = Math.max(0, cur - 6);
  const hi = Math.min(words.length, cur + 7);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 220 }}>
      <div style={{
        maxWidth: 900, textAlign: "center", fontSize: 54, fontWeight: 800, lineHeight: 1.25,
        color: "#fff", fontFamily: "Arial, sans-serif",
        textShadow: "0 3px 0 #000, 3px 0 0 #000, -3px 0 0 #000, 0 -3px 0 #000, 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000",
      }}>
        {words.slice(lo, hi).map((w, i) => (
          <span key={lo + i} style={{ color: lo + i === cur ? "#ffd23f" : "#fff" }}>{w.w} </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const HookCard: React.FC = () => {
  const F = useCurrentFrame();
  const p = ep();
  if (F >= HOOK_END || !p.hook) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 300 }}>
      <div style={{
        maxWidth: 920, textAlign: "center", fontSize: 64, fontWeight: 900, lineHeight: 1.2,
        color: "#fff", fontFamily: "Arial, sans-serif",
        textShadow: "0 4px 0 #000, 4px 0 0 #000, -4px 0 0 #000, 0 -4px 0 #000, 4px 4px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000",
      }}>
        {p.hook}
      </div>
    </AbsoluteFill>
  );
};

export const EpisodeShort: React.FC = () => {
  const F = useCurrentFrame();
  const kit = useKit();
  if (!kit) return null;
  const flash = F >= HOOK_END && F < HOOK_END + 4 ? [1, 0.75, 0.45, 0.2][F - HOOK_END] : 0;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <ShotView kit={kit} />
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      <HookCard />
      <Captions />
      <Audio src={staticFile("voice/ep.mp3")} />
    </AbsoluteFill>
  );
};
