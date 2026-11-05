import React from "react";

import { Composition, registerRoot } from "remotion";

import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { EpisodeShort, EPISODE_MAX } from "./videos/bridge/EpisodeShort";

const Root: React.FC = () => (
  <>
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="EpisodeShort" component={EpisodeShort} durationInFrames={EPISODE_MAX} fps={30} width={1080} height={1920} />
  </>
);

registerRoot(Root);
