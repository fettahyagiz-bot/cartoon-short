
import React, { useEffect, useMemo, useState } from "react";

import { AbsoluteFill, Composition, continueRender, delayRender, getInputProps, registerRoot, useDelayRender } from "remotion";

import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";

import { EffectComposer } from "@react-three/postprocessing";

import { World, loadKit } from "./videos/bridge/world";

import { Kit } from "./videos/bridge/build";

const Inner3: React.FC<{ kit: Kit; msaa: number }> = ({ kit, msaa }) => {

  const { advance } = useThree();

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

  return (<><primitive object={world.root} dispose={null} /><EffectComposer multisampling={msaa} /></>);

};

const Scene3: React.FC = () => {

  const msaa = Number((getInputProps() as { msaa?: number }).msaa ?? 4);

  const [kit, setKit] = useState<Kit | null>(null);

  const [handle] = useState(() => delayRender("dbg3 kit"));

  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);

  if (!kit) return null;

  return (

    <AbsoluteFill style={{ background: "#ff00ff" }}>

      <ThreeCanvas width={1080} height={1920} camera={{ fov: 40, near: 0.2, far: 1500, position: [0, 10, 45] }}>

        <Inner3 kit={kit} msaa={msaa} />

      </ThreeCanvas>

    </AbsoluteFill>

  );

};

registerRoot(() => <Composition id="Debug9" component={Scene3} durationInFrames={10} fps={30} width={1080} height={1920} />);

