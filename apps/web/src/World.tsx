import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { vi } from "./copy/vi";
import { GameLoop } from "./game/GameLoop";
import { NPCS } from "./game/npcs";
import { game } from "./game/state";
import { useUi } from "./game/ui";
import { useKeyboard } from "./game/useKeyboard";
import { Hud } from "./hud/Hud";
import { Avatar } from "./scene/Avatar";
import { BusWorld } from "./scene/BusWorld";
import { CameraRig } from "./scene/CameraRig";
import { Library } from "./scene/Library";
import { LibraryLights, Sky } from "./scene/Sky";

/** Xóm Oii: tầng thượng Bus Oii (mặc định) và thư viện tầng dưới. Lazy-load từ App. */
export default function World() {
  useKeyboard();
  const scene = useUi((s) => s.scene);
  const me = useUi((s) => s.me);
  useEffect(() => {
    useUi.getState().pushLog({ who: vi.scenes.bus.name, text: vi.hud.welcome, band: "system" });
  }, []);
  return (
    <div className="relative h-full w-full overflow-hidden" data-testid="world">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 42, near: 0.1, far: 420, position: [0, 9, 14] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NeutralToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
        style={{ touchAction: "none" }}
      >
        {scene === "bus" ? (
          <>
            <Sky />
            <BusWorld />
          </>
        ) : (
          <>
            <LibraryLights />
            <Library />
          </>
        )}
        <Avatar anim={game.player} color={me.color} hat={me.hat} name={me.nickname} isMe />
        {NPCS.filter((n) => n.scene === scene).map((n) => (
          <Avatar key={n.id} anim={n} color={n.color} hat={n.hat} name={n.name} />
        ))}
        <GameLoop />
        <CameraRig />
      </Canvas>
      <Hud />
    </div>
  );
}
