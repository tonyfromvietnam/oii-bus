import { useFrame } from "@react-three/fiber";
import { mulberry32 } from "@xom-oii/world";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { game, type Pigeon } from "../game/state";
import { M } from "./materials";

const N = 8;
const rnd = mulberry32(42);
const randomPavement = () => {
  const side = rnd() < 0.5 ? -1 : 1;
  return { x: -30 + rnd() * 60, z: side * (4.4 + rnd() * 2.2) };
};

/** Bồ câu đi lang thang trên vỉa hè, bay lên khi có người lại gần. 2 draw call (instanced). */
export function Pigeons() {
  const body = useRef<THREE.InstancedMesh>(null);
  const head = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  if (game.pigeons.length === 0) {
    for (let i = 0; i < N; i++) {
      const p = randomPavement();
      game.pigeons.push({
        ...p,
        y: 0.12,
        ry: rnd() * 6.28,
        mode: "walk",
        timer: rnd() * 3,
        tx: p.x,
        tz: p.z,
      });
    }
  }

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const pl = game.player;
    game.pigeons.forEach((p: Pigeon, i) => {
      const dx = p.x - pl.x;
      const dz = p.z - pl.z;
      const near = dx * dx + dz * dz < 2.4 * 2.4 && pl.pose !== "bus";
      if (p.mode === "walk") {
        if (near) {
          p.mode = "fly";
          p.timer = 3 + rnd() * 2;
          const target = randomPavement();
          p.tx = target.x;
          p.tz = target.z;
        } else {
          p.timer -= dt;
          if (p.timer <= 0) {
            p.timer = 1 + rnd() * 3;
            p.tx = Math.max(-34, Math.min(34, p.x + (rnd() - 0.5) * 3));
            p.tz = Math.sign(p.z) * Math.max(4.3, Math.min(6.7, Math.abs(p.z) + (rnd() - 0.5) * 1.5));
          }
          const mx = p.tx - p.x;
          const mz = p.tz - p.z;
          const d = Math.hypot(mx, mz);
          if (d > 0.05) {
            const step = Math.min(d, 0.5 * dt);
            p.x += (mx / d) * step;
            p.z += (mz / d) * step;
            p.ry = Math.atan2(mx, mz);
          }
          p.y = 0.12;
        }
      } else {
        p.timer -= dt;
        const mx = p.tx - p.x;
        const mz = p.tz - p.z;
        const d = Math.hypot(mx, mz);
        if (d > 0.1) {
          const step = Math.min(d, 6 * dt);
          p.x += (mx / d) * step;
          p.z += (mz / d) * step;
          p.ry = Math.atan2(mx, mz);
        }
        const targetY = p.timer > 0.8 ? 3.5 + Math.sin(i) : 0.12;
        p.y += (targetY - p.y) * Math.min(1, dt * 2.5);
        if (p.timer <= 0 && d < 0.2) {
          p.mode = "walk";
          p.timer = 1;
        }
      }
      const peck = p.mode === "walk" ? Math.max(0, Math.sin(t * 5 + i * 1.7)) * 0.05 : 0;
      dummy.position.set(p.x, p.y + 0.12, p.z);
      dummy.rotation.set(0, p.ry, 0);
      dummy.scale.set(0.11, 0.1, 0.17);
      dummy.updateMatrix();
      body.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(p.x + Math.sin(p.ry) * 0.15, p.y + 0.22 - peck, p.z + Math.cos(p.ry) * 0.15);
      dummy.scale.setScalar(0.06);
      dummy.updateMatrix();
      head.current?.setMatrixAt(i, dummy.matrix);
    });
    if (body.current) body.current.instanceMatrix.needsUpdate = true;
    if (head.current) head.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={body} args={[undefined, undefined, N]} material={M.pigeon} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
      </instancedMesh>
      <instancedMesh
        ref={head}
        args={[undefined, undefined, N]}
        material={M.pigeonHead}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[1, 0]} />
      </instancedMesh>
    </>
  );
}
