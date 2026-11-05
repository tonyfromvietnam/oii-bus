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
import { EnvLight, LibraryLights, Sky } from "./scene/Sky";
import { Temple } from "./scene/Temple";

/** `?lowfx`: tắt bóng đổ, giảm độ phân giải (máy yếu, test tự động). */
const LOW_FX = typeof location !== "undefined" && new URLSearchParams(location.search).has("lowfx");

/** Oii-Bus: tầng thượng Oii-Bus (mặc định) và thư viện tầng dưới. Lazy-load từ App. */
export default function World() {
  useKeyboard();
  const scene = useUi((s) => s.scene);
  const me = useUi((s) => s.me);
  useEffect(() => {
    // một câu chào ngắn sau khi tạo nhân vật
    return useUi.subscribe((s, prev) => {
      if (prev.creatorOpen && !s.creatorOpen) s.showToast(vi.arrive.bus);
    });
  }, []);
  return (
    <div className="relative h-full w-full overflow-hidden" data-testid="world">
      <Canvas
        dpr={LOW_FX ? 1 : [1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 42, near: 0.1, far: 420, position: [0, 9, 14] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NeutralToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
        shadows={LOW_FX ? false : "soft"}
        style={{ touchAction: "none" }}
      >
        <EnvLight />
        {scene === "bus" ? (
          <>
            <Sky />
            <BusWorld />
          </>
        ) : scene === "library" ? (
          <>
            <LibraryLights />
            <Library />
          </>
        ) : (
          <>
            <Sky />
            <Temple />
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
