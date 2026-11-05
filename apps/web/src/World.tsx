import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { vi } from "./copy/vi";
import { GameLoop } from "./game/GameLoop";
import { NPCS } from "./game/npcs";
import { game } from "./game/state";
import { startFarm, useFarm } from "./game/farm";
import { useUi } from "./game/ui";
import { dailyCheckIn, readReferral } from "./game/progress";
import { useKeyboard } from "./game/useKeyboard";
import { Hud } from "./hud/Hud";
import { Avatar } from "./scene/Avatar";
import { BusWorld } from "./scene/BusWorld";
import { CameraRig } from "./scene/CameraRig";
import { EnvLight, Sky } from "./scene/Sky";

/** `?lowfx`: tắt bóng đổ, giảm độ phân giải (máy yếu, test tự động). */
const LOW_FX = typeof location !== "undefined" && new URLSearchParams(location.search).has("lowfx");

/** Oii-Bus: một tầng thượng siêu to. Lazy-load từ App. */
export default function World() {
  useKeyboard();
  const me = useUi((s) => s.me);
  const afk = useFarm((s) => s.afk);
  useEffect(() => {
    readReferral();
    startFarm();
    // lên xe (sau khi tạo nhân vật): điểm danh chuỗi ngày, rồi câu chào ngắn
    return useUi.subscribe((s, prev) => {
      if (prev.creatorOpen && !s.creatorOpen) {
        s.showToast(vi.arrive.bus);
        setTimeout(dailyCheckIn, 2200);
      }
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
        // treo máy: ngừng vẽ 3D cho đỡ tốn pin (farm vẫn chạy bằng đồng hồ riêng)
        frameloop={afk ? "never" : "always"}
        style={{ touchAction: "none" }}
      >
        <EnvLight />
        <Sky />
        <BusWorld />
        <Avatar anim={game.player} color={me.color} hat={me.hat} name={me.nickname} isMe />
        {NPCS.map((n) => (
          <Avatar key={n.id} anim={n} color={n.color} hat={n.hat} name={n.name} />
        ))}
        <GameLoop />
        <CameraRig />
      </Canvas>
      <Hud />
    </div>
  );
}
