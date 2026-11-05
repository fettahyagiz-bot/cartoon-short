
import React from "react";

import { Composition, registerRoot } from "remotion";

import { ThreeCanvas } from "@remotion/three";

const Scene: React.FC = () => (

  <ThreeCanvas width={540} height={960} style={{ width: "100%", height: "100%" }}>

    {/* @ts-ignore */}

    <color attach="background" args={["red"]} />

    {/* @ts-ignore */}

    <mesh>

      {/* @ts-ignore */}

      <boxGeometry args={[2, 2, 2]} />

      {/* @ts-ignore */}

      <meshBasicMaterial color="green" />

    </mesh>

    {/* @ts-ignore */}

    <ambientLight intensity={2} />

  </ThreeCanvas>

);

registerRoot(() => <Composition id="Debug" component={Scene} durationInFrames={10} fps={30} width={540} height={960} />);

