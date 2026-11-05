
import React, { useEffect, useMemo, useState } from "react";

import { AbsoluteFill, Composition, continueRender, delayRender, registerRoot } from "remotion";

import { ThreeCanvas } from "@remotion/three";

import { World, loadKit } from "./videos/bridge/world";

import { Kit } from "./videos/bridge/build";

const Inner2: React.FC<{ kit: Kit }> = ({ kit }) => {

  const world = useMemo(() => new World(kit), [kit]);

  return <primitive object={world.root} dispose={null} />;

};

const Scene2: React.FC = () => {

  const [kit, setKit] = useState<Kit | null>(null);

  const [handle] = useState(() => delayRender("dbg kit"));

  useEffect(() => { loadKit().then((k) => { console.log("KIT KEYS:", Object.keys(k).join(",")); setKit(k); continueRender(handle); }); }, [handle]);

  if (!kit) return null;

  return (

    <AbsoluteFill style={{ background: "#ff00ff" }}>

      <ThreeCanvas width={1080} height={1920} camera={{ fov: 40, near: 0.2, far: 1500, position: [0, 10, 45] }}>

        <Inner2 kit={kit} />

      </ThreeCanvas>

    </AbsoluteFill>

  );

};

registerRoot(() => <Composition id="Debug2" component={Scene2} durationInFrames={10} fps={30} width={1080} height={1920} />);

