
import React, { useEffect, useMemo, useState } from "react";

import { AbsoluteFill, Composition, continueRender, delayRender, getInputProps, registerRoot } from "remotion";

import { ThreeCanvas } from "@remotion/three";

import { EffectComposer } from "@react-three/postprocessing";

import { World, loadKit } from "./videos/bridge/world";

import { Kit } from "./videos/bridge/build";

const Inner3: React.FC<{ kit: Kit; msaa: number }> = ({ kit, msaa }) => {

  const world = useMemo(() => new World(kit), [kit]);

  return (<><primitive object={world.root} dispose={null} /><EffectComposer multisampling={msaa} /></>);

};

const Scene3: React.FC = () => {

  const msaa = Number((getInputProps() as { msaa?: number }).msaa ?? 4);

  const [kit, setKit] = useState<Kit | null>(null);

  const [handle] = useState(() => delayRender("dbg3 kit"));

  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);

  if (!kit) return (<AbsoluteFill style={{ background: "#ff00ff", color: "#fff", fontSize: 80 }}><div>KIT-WAIT</div></AbsoluteFill>);

  return (

    <AbsoluteFill style={{ background: "#00ff00" }}><div style={{color:"#000",fontSize:80}}>KIT-OK</div>

      <ThreeCanvas width={1080} height={1920} camera={{ fov: 40, near: 0.2, far: 1500, position: [0, 10, 45] }}>

        <Inner3 kit={kit} msaa={msaa} />

      </ThreeCanvas>

    </AbsoluteFill>

  );

};

registerRoot(() => <Composition id="Debug8" component={Scene3} durationInFrames={10} fps={30} width={1080} height={1920} />);

