import { useFrame } from "@react-three/fiber";
import { BUS } from "@xom-oii/world";
import { useMemo, useRef } from "react";
import type * as THREE from "three";
import { game } from "../game/state";
import { buildBus } from "./buildStreet";

/** Bus N29: vị trí đọc từ mô phỏng (M1 offline: client; M2: server broadcast). */
export function Bus() {
  const obj = useMemo(() => buildBus(), []);
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    g.position.set(game.bus.x, 0, BUS.laneZ);
    g.visible = game.bus.phase !== "away" || game.player.pose === "bus";
  });
  return (
    <group ref={ref}>
      <primitive object={obj} />
    </group>
  );
}
