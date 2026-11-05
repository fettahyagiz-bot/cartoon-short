
import React, { useEffect, useMemo, useState } from "react";

import { AbsoluteFill, Composition, continueRender, delayRender, getInputProps, registerRoot } from "remotion";

import { ThreeCanvas } from "@remotion/three";

import { EffectComposer, ToneMapping } from "@react-three/postprocessing";

import { ToneMappingMode } from "postprocessing";

import { World, loadKit } from "./videos/bridge/world";

import { Kit } from "./videos/bridge/build";

const Inner4: React.FC<{ kit: Kit; msaa: number }> = ({ kit, msaa }) => {

  const world = useMemo(() => new World(kit), [kit]);

  return (<><primitive object={world.root} dispose={null} />

    <EffectComposer multisampling={msaa}><ToneMapping mode={ToneMappingMode.NEUTRAL} /></EffectComposer></>);

};

const Scene4: React.FC = () => {

  const msaa = Number((getInputProps() as { msaa?: number }).msaa ?? 4);

  const [kit, setKit] = useState<Kit | null>(null);

  const [handle] = useState(() => delayRender("dbg4 kit"));

  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);

  if (!kit) return null;

  return (

    <AbsoluteFill style={{ background: "#ff00ff" }}>

      <ThreeCanvas width={1080} height={1920} camera={{ fov: 40, near: 0.2, far: 1500, position: [0, 10, 45] }}>

        <Inner4 kit={kit} msaa={msaa} />

      </ThreeCanvas>

    </AbsoluteFill>

  );

};

registerRoot(() => <Composition id="Debug4" component={Scene4} durationInFrames={10} fps={30} width={1080} height={1920} />);

