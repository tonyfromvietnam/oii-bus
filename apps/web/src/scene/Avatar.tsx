import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { vi } from "../copy/vi";
import type { AvatarAnim } from "../game/state";
import { M } from "./materials";

export type Hat = "none" | "beanie" | "cap" | "bucket" | "flat-cap" | "earmuffs";

interface Props {
  anim: AvatarAnim;
  coatColor: string;
  hat: Hat;
  name: string;
  alumni?: boolean;
  scarf?: string;
  /** Gọi mỗi frame để lấy vị trí thế giới (ví dụ khi ngồi trên bus). */
  worldOffset?: () => { x: number; y: number; z: number } | null;
}

const HIP = 0.85;
const tmp = new THREE.Vector3();

/**
 * Nhân vật low-poly dựng từ primitive. Local +z là hướng mặt.
 * Mọi text (tên, bong bóng chat, emoji) gán qua textContent — không bao giờ innerHTML (brief §15).
 */
export function Avatar({ anim, coatColor, hat, name, alumni, scarf = "#d9c27a", worldOffset }: Props) {
  const root = useRef<THREE.Group>(null);
  const upper = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const cup = useRef<THREE.Mesh>(null);
  const tag = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const emoji = useRef<HTMLDivElement>(null);
  const phase = useRef(0);
  const lastBubble = useRef<string | null>(null);
  const lastEmoji = useRef<string | null>(null);

  const coat = useMemo(() => new THREE.MeshLambertMaterial({ color: coatColor }), [coatColor]);
  const scarfMat = useMemo(() => new THREE.MeshLambertMaterial({ color: scarf }), [scarf]);
  const hatMat = useMemo(() => new THREE.MeshLambertMaterial({ color: "#2b3a55" }), []);

  useFrame((state, dt) => {
    const r = root.current;
    if (!r) return;
    const off = worldOffset?.();
    r.position.set(anim.x + (off?.x ?? 0), anim.y + (off?.y ?? 0), anim.z + (off?.z ?? 0));
    r.rotation.y = anim.ry;
    const t = state.clock.elapsedTime;

    // đi bộ
    const moving = anim.pose === "stand" && anim.speed > 0.2;
    phase.current += dt * (moving ? 4 + anim.speed * 1.6 : 0);
    const swing = moving ? Math.sin(phase.current) * Math.min(0.7, 0.25 + anim.speed * 0.12) : 0;
    const sitting = anim.pose !== "stand";
    const lerp = (cur: number, target: number) => cur + (target - cur) * Math.min(1, dt * 12);

    if (legL.current && legR.current) {
      legL.current.rotation.x = lerp(legL.current.rotation.x, sitting ? -1.45 : swing);
      legR.current.rotation.x = lerp(legR.current.rotation.x, sitting ? -1.45 : -swing);
    }

    // cử chỉ
    const g = anim.gesture && anim.gesture.until > t ? anim.gesture.id : null;
    let aLx = -swing * 0.8;
    let aRx = swing * 0.8;
    let aLz = 0.08;
    let aRz = -0.08;
    let bow = 0;
    if (anim.holding === "tea") aRx = -0.9;
    switch (g) {
      case "wave":
        aRz = -2.6 + Math.sin(t * 12) * 0.35;
        aRx = 0;
        break;
      case "tea":
        aRx = -1.35;
        break;
      case "hug":
        aLx = aRx = -1.4;
        aLz = -0.5;
        aRz = 0.5;
        break;
      case "sorry":
        bow = 0.65;
        aLx = aRx = 0.15;
        break;
      case "cheers":
        aRx = -2.6;
        aRz = -0.2;
        break;
    }
    if (armL.current && armR.current) {
      armL.current.rotation.x = lerp(armL.current.rotation.x, aLx);
      armR.current.rotation.x = lerp(armR.current.rotation.x, aRx);
      armL.current.rotation.z = lerp(armL.current.rotation.z, aLz);
      armR.current.rotation.z = lerp(armR.current.rotation.z, aRz);
    }
    if (upper.current) {
      upper.current.rotation.x = lerp(upper.current.rotation.x, bow);
      upper.current.position.y = HIP + (moving ? Math.abs(Math.sin(phase.current)) * 0.04 : 0);
    }
    if (cup.current) cup.current.visible = anim.holding === "tea";

    // name tag mờ dần theo khoảng cách camera
    if (tag.current) {
      r.getWorldPosition(tmp);
      const d = tmp.distanceTo(state.camera.position);
      tag.current.style.opacity = String(Math.max(0.12, Math.min(1, 1 - (d - 7) / 16)));
    }
    // bong bóng chat
    const bText = anim.bubble && anim.bubble.until > t ? anim.bubble.text : null;
    if (bubble.current && bText !== lastBubble.current) {
      lastBubble.current = bText;
      bubble.current.textContent = bText ?? "";
      bubble.current.style.display = bText ? "block" : "none";
    }
    const eText = g ? vi.gestures[g].emoji : null;
    if (emoji.current && eText !== lastEmoji.current) {
      lastEmoji.current = eText;
      emoji.current.textContent = eText ?? "";
      emoji.current.style.display = eText ? "block" : "none";
    }
  });

  return (
    <group ref={root}>
      {/* chân */}
      {[
        [legL, 0.11],
        [legR, -0.11],
      ].map(([ref, x], i) => (
        <group key={i} ref={ref as React.RefObject<THREE.Group>} position={[x as number, HIP, 0]}>
          <mesh material={M.trousers} position={[0, -0.4, 0]}>
            <boxGeometry args={[0.17, 0.8, 0.19]} />
          </mesh>
          <mesh material={M.black} position={[0, -0.8, 0.05]}>
            <boxGeometry args={[0.18, 0.1, 0.28]} />
          </mesh>
        </group>
      ))}
      <group ref={upper} position={[0, HIP, 0]}>
        {/* áo khoác */}
        <mesh material={coat} position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.23, 0.3, 0.9, 8]} />
        </mesh>
        <mesh material={scarfMat} position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.17, 0.2, 0.12, 8]} />
        </mesh>
        {/* đầu */}
        <mesh material={M.skin} position={[0, 0.98, 0]}>
          <icosahedronGeometry args={[0.18, 1]} />
        </mesh>
        <HatMesh hat={hat} material={hatMat} />
        {/* tay */}
        {[
          [armL, 0.31],
          [armR, -0.31],
        ].map(([ref, x], i) => (
          <group key={i} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.72, 0]}>
            <mesh material={coat} position={[0, -0.3, 0]}>
              <boxGeometry args={[0.13, 0.62, 0.15]} />
            </mesh>
            <mesh material={M.skin} position={[0, -0.64, 0]}>
              <icosahedronGeometry args={[0.065, 0]} />
            </mesh>
            {i === 1 && (
              <mesh ref={cup} material={M.white} position={[0, -0.7, 0.08]} visible={false}>
                <cylinderGeometry args={[0.05, 0.04, 0.13, 8]} />
              </mesh>
            )}
          </group>
        ))}
      </group>
      <Html position={[0, 2.12, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div className="flex flex-col items-center gap-1 whitespace-nowrap select-none">
          <div ref={emoji} className="animate-bounce text-3xl" style={{ display: "none" }} />
          <div
            ref={bubble}
            className="max-w-[220px] rounded-2xl bg-white/90 px-3 py-1 text-center text-sm whitespace-normal text-slate-900 shadow"
            style={{ display: "none" }}
          />
          <div ref={tag} className="rounded-full bg-black/45 px-2 py-0.5 text-xs text-white">
            {alumni ? "★ " : ""}
            {name}
          </div>
        </div>
      </Html>
    </group>
  );
}

function HatMesh({ hat, material }: { hat: Hat; material: THREE.Material }) {
  switch (hat) {
    case "beanie":
      return (
        <group position={[0, 1.05, 0]}>
          <mesh material={material}>
            <sphereGeometry args={[0.19, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={M.white} position={[0, 0.2, 0]}>
            <icosahedronGeometry args={[0.06, 0]} />
          </mesh>
        </group>
      );
    case "cap":
      return (
        <group position={[0, 1.06, 0]}>
          <mesh material={material}>
            <sphereGeometry args={[0.185, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={material} position={[0, 0.0, 0.17]}>
            <boxGeometry args={[0.26, 0.03, 0.16]} />
          </mesh>
        </group>
      );
    case "bucket":
      return (
        <mesh material={material} position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.16, 0.26, 0.16, 10]} />
        </mesh>
      );
    case "flat-cap":
      return (
        <mesh material={material} position={[0, 1.1, 0.03]} scale={[1, 0.35, 1.15]}>
          <sphereGeometry args={[0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      );
    case "earmuffs":
      return (
        <group position={[0, 0.98, 0]}>
          {[-0.18, 0.18].map((x) => (
            <mesh key={x} material={M.flowers} position={[x, 0, 0]}>
              <icosahedronGeometry args={[0.07, 0]} />
            </mesh>
          ))}
        </group>
      );
    default:
      return null;
  }
}
