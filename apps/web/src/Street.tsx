import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { vi } from "./copy/vi";
import { GameLoop } from "./game/GameLoop";
import { game } from "./game/state";
import { useUi } from "./game/ui";
import { useKeyboard } from "./game/useKeyboard";
import { Hud } from "./hud/Hud";
import { Avatar } from "./scene/Avatar";
import { Bus } from "./scene/Bus";
import { buildStreet } from "./scene/buildStreet";
import { CameraRig } from "./scene/CameraRig";
import { Lights } from "./scene/Lights";
import { Pigeons } from "./scene/Pigeons";
import { Rain } from "./scene/Rain";

function StreetStatic() {
  const obj = useMemo(() => buildStreet(), []);
  return <primitive object={obj} />;
}

/** Oii Street (M1: offline, một người). Lazy-load từ App để trang "Phố đóng cửa" nhẹ. */
export default function Street() {
  useKeyboard();
  useEffect(() => {
    useUi.getState().pushLog({ who: vi.streetName, text: vi.hud.welcome, band: "system" });
  }, []);
  const p = game.player;
  return (
    <div className="relative h-full w-full overflow-hidden" data-testid="street">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 55, near: 0.1, far: 140, position: [8, 4, 6] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.25;
        }}
        style={{ touchAction: "none" }}
      >
        <Lights />
        <StreetStatic />
        <Bus />
        <Pigeons />
        <Rain />
        <Avatar anim={p} coatColor={p.coatColor} hat={p.hat} name={p.nickname} />
        <Avatar anim={game.dave} coatColor="#1f3d2c" hat="flat-cap" name={vi.dave.name} scarf="#c9a24a" />
        <GameLoop />
        <CameraRig />
      </Canvas>
      <Hud />
    </div>
  );
}
