import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Hat } from "@xom-oii/shared";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { vi } from "../copy/vi";
import type { AvatarAnim } from "../game/state";
import { C, toon } from "./materials";

interface Props {
  anim: AvatarAnim;
  color: string;
  hat: Hat;
  name: string;
  alumni?: boolean;
  isMe?: boolean;
}

const SEAT_Y = 0.45;
const tmp = new THREE.Vector3();

/**
 * Nhân vật chibi: đầu to bo tròn, mắt chấm, má hồng, thân nhỏ. Local +z là hướng mặt.
 * Mọi text (tên, bong bóng chat, emoji) gán qua textContent — không bao giờ innerHTML (brief §15).
 */
export function Avatar({ anim, color, hat, name, alumni, isMe }: Props) {
  const root = useRef<THREE.Group>(null);
  const bodyG = useRef<THREE.Group>(null);
  const headG = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const cup = useRef<THREE.Group>(null);
  const tag = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const emoji = useRef<HTMLDivElement>(null);
  const phase = useRef(Math.random() * 10);
  const blinkAt = useRef(2 + Math.random() * 3);
  const last = useRef({ bubble: null as string | null, emoji: null as string | null });

  const mat = useMemo(() => toon(color), [color]);
  const dark = useMemo(() => toon(new THREE.Color(color).multiplyScalar(0.72).getStyle()), [color]);

  useFrame((state, dt) => {
    const r = root.current;
    if (!r) return;
    const t = state.clock.elapsedTime;
    const lerp = (cur: number, target: number, k = 12) => cur + (target - cur) * Math.min(1, dt * k);
    const moving = anim.pose === "stand" && anim.speed > 0.2;
    const seated = anim.pose !== "stand";
    phase.current += dt * (moving ? 11 : 0);
    const ph = phase.current;
    const g = anim.gesture && anim.gesture.until > t ? anim.gesture.id : null;

    // nhún nhảy khi đi, nhảy lên khi "Yeah"
    let y = seated ? SEAT_Y - 0.24 : 0;
    if (moving) y += Math.abs(Math.sin(ph)) * 0.09;
    if (g === "cheers" && !seated) y += Math.abs(Math.sin(t * 9)) * 0.25;
    r.position.set(anim.x, y, anim.z);
    r.rotation.y = anim.ry;
    r.rotation.z = moving ? Math.sin(ph) * 0.07 : 0;

    // thở nhẹ
    const breathe = 1 + Math.sin(t * 2.2) * 0.015;
    if (bodyG.current) bodyG.current.scale.set(1, breathe, 1);

    if (legL.current && legR.current) {
      const swing = moving ? Math.sin(ph) * 0.6 : 0;
      legL.current.rotation.x = lerp(legL.current.rotation.x, seated ? -1.5 : swing);
      legR.current.rotation.x = lerp(legR.current.rotation.x, seated ? -1.5 : -swing);
    }

    let aL = { x: moving ? -Math.sin(ph) * 0.5 : 0, z: 0.15 };
    let aR = { x: moving ? Math.sin(ph) * 0.5 : 0, z: -0.15 };
    let bow = 0;
    if (anim.holding === "tea") aR = { x: -1.1, z: -0.1 };
    switch (g) {
      case "wave":
        aR = { x: 0, z: -2.6 + Math.sin(t * 14) * 0.35 };
        break;
      case "tea":
        aR = { x: -1.5, z: 0 };
        break;
      case "hug":
        aL = { x: -2.3, z: -0.5 };
        aR = { x: -2.3, z: 0.5 };
        break;
      case "sorry":
        bow = 0.45;
        break;
      case "cheers":
        aL = { x: 0, z: 2.6 + Math.sin(t * 12) * 0.2 };
        aR = { x: 0, z: -2.6 - Math.sin(t * 12) * 0.2 };
        break;
    }
    if (armL.current && armR.current) {
      armL.current.rotation.x = lerp(armL.current.rotation.x, aL.x);
      armL.current.rotation.z = lerp(armL.current.rotation.z, aL.z);
      armR.current.rotation.x = lerp(armR.current.rotation.x, aR.x);
      armR.current.rotation.z = lerp(armR.current.rotation.z, aR.z);
    }
    if (headG.current) {
      const sleepTilt = anim.pose === "sleep" ? 0.35 + Math.sin(t * 1.5) * 0.05 : 0;
      headG.current.rotation.x = lerp(headG.current.rotation.x, bow + sleepTilt * 0.5, 8);
      headG.current.rotation.z = lerp(headG.current.rotation.z, sleepTilt, 4);
    }
    if (bodyG.current) bodyG.current.rotation.x = lerp(bodyG.current.rotation.x, bow * 0.6, 8);

    // chớp mắt; ngủ thì nhắm
    if (eyes.current) {
      let sy = 1;
      if (anim.pose === "sleep") sy = 0.15;
      else if (t > blinkAt.current) {
        sy = 0.1;
        if (t > blinkAt.current + 0.12) blinkAt.current = t + 2 + Math.random() * 4;
      }
      eyes.current.scale.y = sy;
    }
    if (cup.current) cup.current.visible = anim.holding === "tea";

    // text overlay
    if (tag.current) {
      r.getWorldPosition(tmp);
      const d = tmp.distanceTo(state.camera.position);
      tag.current.style.opacity = String(Math.max(0.25, Math.min(1, 1.6 - d / 22)));
    }
    const bText =
      anim.bubble && anim.bubble.until > t ? anim.bubble.text : anim.pose === "sleep" ? "💤" : null;
    if (bubble.current && bText !== last.current.bubble) {
      last.current.bubble = bText;
      bubble.current.textContent = bText ?? "";
      bubble.current.style.display = bText ? "block" : "none";
    }
    const eText = g ? vi.gestures[g].emoji : null;
    if (emoji.current && eText !== last.current.emoji) {
      last.current.emoji = eText;
      emoji.current.textContent = eText ?? "";
      emoji.current.style.display = eText ? "block" : "none";
    }
  });

  return (
    <group ref={root}>
      {/* bóng tròn dưới chân */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.42, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      {isMe && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.015, 0]}>
          <ringGeometry args={[0.46, 0.54, 28]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} depthWrite={false} />
        </mesh>
      )}
      {[
        [legL, 0.12],
        [legR, -0.12],
      ].map(([ref, x], i) => (
        <group key={i} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.24, 0]}>
          <RoundedBox args={[0.17, 0.26, 0.19]} radius={0.06} position={[0, -0.12, 0]} material={dark} />
        </group>
      ))}
      <group ref={bodyG} position={[0, 0.22, 0]}>
        <RoundedBox args={[0.54, 0.5, 0.42]} radius={0.14} position={[0, 0.25, 0]} material={mat} />
        <mesh position={[0, 0.22, 0.212]} material={toon(C.white)}>
          <boxGeometry args={[0.2, 0.08, 0.01]} />
        </mesh>
        {[
          [armL, 0.34],
          [armR, -0.34],
        ].map(([ref, x], i) => (
          <group key={i} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.44, 0]}>
            <RoundedBox args={[0.14, 0.34, 0.15]} radius={0.06} position={[0, -0.15, 0]} material={mat} />
            <mesh position={[0, -0.33, 0]} material={toon(C.skin)}>
              <sphereGeometry args={[0.075, 10, 8]} />
            </mesh>
            {i === 1 && (
              <group ref={cup} position={[0, -0.38, 0.1]} visible={false}>
                <mesh material={toon("#f3d9b1")}>
                  <cylinderGeometry args={[0.07, 0.055, 0.17, 10]} />
                </mesh>
                <mesh position={[0, -0.05, 0]} material={toon(C.ink)}>
                  <cylinderGeometry args={[0.058, 0.055, 0.05, 10]} />
                </mesh>
                <mesh position={[0.02, 0.15, 0]} rotation-z={-0.2} material={toon(C.pink)}>
                  <cylinderGeometry args={[0.012, 0.012, 0.18, 6]} />
                </mesh>
              </group>
            )}
          </group>
        ))}
      </group>
      <group ref={headG} position={[0, 0.74, 0]}>
        <RoundedBox
          args={[0.8, 0.7, 0.68]}
          radius={0.22}
          smoothness={3}
          position={[0, 0.34, 0]}
          material={toon(C.skin)}
        />
        {/* tóc */}
        <RoundedBox
          args={[0.84, 0.18, 0.72]}
          radius={0.08}
          position={[0, 0.66, -0.01]}
          material={toon(C.hair)}
        />
        <RoundedBox
          args={[0.84, 0.46, 0.18]}
          radius={0.08}
          position={[0, 0.44, -0.27]}
          material={toon(C.hair)}
        />
        <RoundedBox
          args={[0.5, 0.12, 0.1]}
          radius={0.05}
          position={[-0.1, 0.55, 0.32]}
          rotation-z={0.15}
          material={toon(C.hair)}
        />
        {/* mắt */}
        <group ref={eyes} position={[0, 0.34, 0.345]}>
          {[-0.16, 0.16].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh material={toon(C.ink)}>
                <capsuleGeometry args={[0.045, 0.06, 4, 8]} />
              </mesh>
              <mesh position={[0.018, 0.03, 0.03]} material={toon(C.white)}>
                <sphereGeometry args={[0.016, 6, 6]} />
              </mesh>
            </group>
          ))}
        </group>
        {/* má hồng + miệng */}
        {[-0.27, 0.27].map((x) => (
          <mesh key={x} position={[x, 0.22, 0.343]} rotation-x={Math.PI / 2} material={toon(C.blush)}>
            <cylinderGeometry args={[0.065, 0.065, 0.01, 14]} />
          </mesh>
        ))}
        <mesh
          position={[0, 0.22, 0.345]}
          rotation-x={Math.PI / 2}
          rotation-z={Math.PI}
          material={toon(C.ink)}
        >
          <torusGeometry args={[0.04, 0.012, 6, 10, Math.PI]} />
        </mesh>
        <HatMesh hat={hat} color={color} />
      </group>
      <Html position={[0, 1.95, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div className="flex flex-col items-center gap-1 whitespace-nowrap select-none">
          <div ref={emoji} className="pop text-3xl" style={{ display: "none" }} />
          <div
            ref={bubble}
            className="max-w-[230px] rounded-2xl bg-white px-3 py-1 text-center text-sm leading-snug whitespace-normal text-[var(--ink)] shadow-md"
            style={{ display: "none" }}
          />
          <div
            ref={tag}
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${isMe ? "bg-[var(--ink)] text-white" : "bg-white/90 text-[var(--ink)]"}`}
          >
            {alumni ? "★ " : ""}
            {name}
          </div>
        </div>
      </Html>
    </group>
  );
}

function HatMesh({ hat, color }: { hat: Hat; color: string }) {
  const top = 0.72;
  switch (hat) {
    case "non-la":
      return (
        <group position={[0, top + 0.02, 0]}>
          <mesh material={toon("#f1d58f")}>
            <coneGeometry args={[0.62, 0.36, 20]} />
          </mesh>
          <mesh position={[0, -0.14, 0]} material={toon("#e3bf6b")}>
            <torusGeometry args={[0.52, 0.015, 4, 24]} />
          </mesh>
        </group>
      );
    case "beanie":
      return (
        <group position={[0, top - 0.06, 0]}>
          <mesh material={toon(C.lilac)}>
            <sphereGeometry args={[0.44, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh position={[0, 0.02, 0]} material={toon(C.white)}>
            <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
          </mesh>
          <mesh position={[0, 0.47, 0]} material={toon(C.white)}>
            <sphereGeometry args={[0.1, 10, 8]} />
          </mesh>
        </group>
      );
    case "grad-cap":
      return (
        <group position={[0, top, 0]}>
          <mesh material={toon(C.ink)}>
            <cylinderGeometry args={[0.3, 0.33, 0.14, 12]} />
          </mesh>
          <mesh position={[0, 0.09, 0]} rotation-y={Math.PI / 4} material={toon(C.ink)}>
            <boxGeometry args={[0.78, 0.04, 0.78]} />
          </mesh>
          <mesh position={[0.3, -0.02, 0.18]} material={toon(C.gold)}>
            <boxGeometry args={[0.03, 0.22, 0.03]} />
          </mesh>
        </group>
      );
    case "cat-ears":
      return (
        <group position={[0, top + 0.02, 0]}>
          {[-0.24, 0.24].map((x) => (
            <group key={x} position={[x, 0.08, 0]} rotation-z={-x * 0.6}>
              <mesh material={toon(color)}>
                <coneGeometry args={[0.13, 0.24, 4]} />
              </mesh>
              <mesh position={[0, -0.02, 0.04]} material={toon(C.pink)}>
                <coneGeometry args={[0.07, 0.14, 4]} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "headphones":
      return (
        <group position={[0, 0.38, 0]}>
          <mesh rotation-z={0} position={[0, 0.02, 0]} material={toon(C.ink)}>
            <torusGeometry args={[0.45, 0.035, 6, 20, Math.PI]} />
          </mesh>
          {[-0.44, 0.44].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation-z={Math.PI / 2} material={toon(C.pink)}>
              <cylinderGeometry args={[0.13, 0.13, 0.1, 14]} />
            </mesh>
          ))}
        </group>
      );
    default:
      return null;
  }
}
