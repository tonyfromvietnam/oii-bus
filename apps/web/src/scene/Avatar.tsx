import { Html } from "@react-three/drei";
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
const BODY_Y = 0.62;
const R = 0.52;
const tmp = new THREE.Vector3();

/**
 * Nhân vật tròn như mascot OiiMate: một bong bóng chat có đuôi nhỏ, mắt chấm navy, miệng cười.
 * Local +z là hướng mặt. Mọi text (tên, bong bóng chat, emoji) gán qua textContent — không bao giờ innerHTML.
 */
export function Avatar({ anim, color, hat, name, alumni, isMe }: Props) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const footL = useRef<THREE.Mesh>(null);
  const footR = useRef<THREE.Mesh>(null);
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
  const dark = useMemo(() => toon(new THREE.Color(color).multiplyScalar(0.8).getStyle()), [color]);
  // đuôi bong bóng: xanh thì bên trái, vàng/ấm thì bên phải (như logo)
  const tailSide = useMemo(
    () => (new THREE.Color(color).getHSL({ h: 0, s: 0, l: 0 }).h > 0.3 ? -1 : 1),
    [color],
  );

  useFrame((state, dt) => {
    const r = root.current;
    if (!r) return;
    const t = state.clock.elapsedTime;
    const lerp = (cur: number, target: number, k = 12) => cur + (target - cur) * Math.min(1, dt * k);
    const moving = anim.pose === "stand" && anim.speed > 0.2;
    const seated = anim.pose !== "stand";
    phase.current += dt * (moving ? 12 : 0);
    const ph = phase.current;
    const g = anim.gesture && anim.gesture.until > t ? anim.gesture.id : null;

    let y = seated ? SEAT_Y - 0.1 : 0;
    const hop = moving ? Math.abs(Math.sin(ph)) * 0.1 : 0;
    y += hop;
    if (g === "cheers" && !seated) y += Math.abs(Math.sin(t * 9)) * 0.28;
    r.position.set(anim.x, y, anim.z);
    r.rotation.y = anim.ry;

    if (body.current) {
      // nhún kiểu thạch: chạm đất thì bẹt, bật lên thì dài ra
      const squash = moving ? 1 - Math.cos(ph * 2) * 0.05 : 1 + Math.sin(t * 2.2) * 0.015;
      body.current.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
      let tilt = moving ? 0.08 : 0;
      if (g === "sorry") tilt = 0.45;
      body.current.rotation.x = lerp(body.current.rotation.x, tilt, 10);
      const sleepTilt =
        anim.pose === "sleep" ? 0.25 + Math.sin(t * 1.5) * 0.04 : moving ? Math.sin(ph) * 0.06 : 0;
      body.current.rotation.z = lerp(body.current.rotation.z, sleepTilt, 6);
    }
    if (footL.current && footR.current) {
      const swing = moving ? Math.sin(ph) * 0.12 : 0;
      footL.current.position.z = 0.06 + (seated ? 0.3 : swing);
      footR.current.position.z = 0.06 + (seated ? 0.3 : -swing);
    }

    let aL = { x: moving ? -Math.sin(ph) * 0.5 : 0, z: 0.25 };
    let aR = { x: moving ? Math.sin(ph) * 0.5 : 0, z: -0.25 };
    if (anim.holding === "tea") aR = { x: -1.2, z: -0.1 };
    switch (g) {
      case "wave":
        aR = { x: 0, z: -2.5 + Math.sin(t * 14) * 0.4 };
        break;
      case "tea":
        aR = { x: -1.6, z: 0 };
        break;
      case "hug":
        aL = { x: -1.4, z: -0.7 };
        aR = { x: -1.4, z: 0.7 };
        break;
      case "cheers":
        aL = { x: 0, z: 2.5 + Math.sin(t * 12) * 0.2 };
        aR = { x: 0, z: -2.5 - Math.sin(t * 12) * 0.2 };
        break;
    }
    if (armL.current && armR.current) {
      armL.current.rotation.x = lerp(armL.current.rotation.x, aL.x);
      armL.current.rotation.z = lerp(armL.current.rotation.z, aL.z);
      armR.current.rotation.x = lerp(armR.current.rotation.x, aR.x);
      armR.current.rotation.z = lerp(armR.current.rotation.z, aR.z);
    }
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

    if (tag.current) {
      r.getWorldPosition(tmp);
      const d = tmp.distanceTo(state.camera.position);
      tag.current.style.opacity = String(Math.max(0.3, Math.min(1, 1.6 - d / 22)));
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
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.46, 24]} />
        <meshBasicMaterial color="#1f2d4d" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      {isMe && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.015, 0]}>
          <ringGeometry args={[0.52, 0.6, 32]} />
          <meshBasicMaterial color="#4e9297" transparent opacity={0.9} depthWrite={false} />
        </mesh>
      )}
      {[
        [footL, 0.17],
        [footR, -0.17],
      ].map(([ref, x], i) => (
        <mesh
          key={i}
          ref={ref as React.RefObject<THREE.Mesh>}
          position={[x as number, 0.07, 0.06]}
          scale={[1, 0.6, 1.3]}
          material={dark}
        >
          <sphereGeometry args={[0.11, 12, 8]} />
        </mesh>
      ))}
      <group ref={body} position={[0, BODY_Y, 0]}>
        {/* thân bong bóng + đuôi */}
        <mesh material={mat} scale={[1, 0.94, 0.96]}>
          <sphereGeometry args={[R, 32, 24]} />
        </mesh>
        <mesh material={mat} position={[tailSide * 0.3, -0.38, -0.05]} rotation-z={tailSide * -0.7}>
          <coneGeometry args={[0.13, 0.32, 12]} />
        </mesh>
        {/* mặt */}
        <group ref={eyes} position={[0, 0.06, R * 0.93]}>
          {[-0.15, 0.15].map((x) => (
            <mesh key={x} position={[x, 0, 0]} scale={[1, 1, 0.5]} material={toon(C.ink)}>
              <sphereGeometry args={[0.055, 12, 10]} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, -0.07, R * 0.94]} rotation-z={Math.PI} material={toon(C.ink)}>
          <torusGeometry args={[0.065, 0.017, 6, 14, Math.PI]} />
        </mesh>
        {[-0.28, 0.28].map((x) => (
          <mesh
            key={x}
            position={[x, -0.06, R * 0.85]}
            rotation-y={x * 1.3}
            scale={[1, 0.6, 0.3]}
            material={toon(C.blush)}
          >
            <sphereGeometry args={[0.07, 10, 8]} />
          </mesh>
        ))}
        {/* tay nhỏ */}
        {[
          [armL, 0.46],
          [armR, -0.46],
        ].map(([ref, x], i) => (
          <group key={i} ref={ref as React.RefObject<THREE.Group>} position={[x as number, -0.02, 0]}>
            <mesh position={[0, -0.12, 0]} scale={[0.8, 1.1, 0.8]} material={dark}>
              <sphereGeometry args={[0.1, 12, 8]} />
            </mesh>
            {i === 1 && (
              <group ref={cup} position={[0, -0.22, 0.08]} visible={false}>
                <mesh material={toon("#f3d9b1")}>
                  <cylinderGeometry args={[0.07, 0.055, 0.17, 10]} />
                </mesh>
                <mesh position={[0, -0.05, 0]} material={toon(C.ink)}>
                  <cylinderGeometry args={[0.058, 0.055, 0.05, 10]} />
                </mesh>
                <mesh position={[0.02, 0.15, 0]} rotation-z={-0.2} material={toon(C.accent)}>
                  <cylinderGeometry args={[0.012, 0.012, 0.18, 6]} />
                </mesh>
              </group>
            )}
          </group>
        ))}
        <HatMesh hat={hat} color={color} />
      </group>
      <Html position={[0, 1.62, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div className="flex flex-col items-center gap-1 whitespace-nowrap select-none">
          <div ref={emoji} className="pop text-3xl" style={{ display: "none" }} />
          <div
            ref={bubble}
            className="say max-w-[230px] text-center text-sm leading-snug whitespace-normal"
            style={{ display: "none" }}
          />
          <div
            ref={tag}
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sm ${isMe ? "bg-[var(--accent)] text-white" : "bg-white/90 text-[var(--ink)]"}`}
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
  const top = R * 0.94 - 0.04;
  switch (hat) {
    case "non-la":
      return (
        <group position={[0, top + 0.04, 0]}>
          <mesh material={toon("#f1d58f")}>
            <coneGeometry args={[0.6, 0.34, 24]} />
          </mesh>
          <mesh position={[0, -0.13, 0]} rotation-x={Math.PI / 2} material={toon("#e3bf6b")}>
            <torusGeometry args={[0.5, 0.015, 4, 28]} />
          </mesh>
        </group>
      );
    case "beanie":
      return (
        <group position={[0, top - 0.16, 0]}>
          <mesh material={toon(C.oiiYellow)}>
            <sphereGeometry args={[0.47, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
          </mesh>
          <mesh position={[0, 0.5, 0]} material={toon(C.white)}>
            <sphereGeometry args={[0.1, 10, 8]} />
          </mesh>
        </group>
      );
    case "grad-cap":
      return (
        <group position={[0, top, 0]}>
          <mesh material={toon(C.ink)}>
            <cylinderGeometry args={[0.24, 0.27, 0.12, 14]} />
          </mesh>
          <mesh position={[0, 0.08, 0]} rotation-y={Math.PI / 4} material={toon(C.ink)}>
            <boxGeometry args={[0.66, 0.04, 0.66]} />
          </mesh>
          <mesh position={[0.26, -0.03, 0.15]} material={toon(C.gold)}>
            <boxGeometry args={[0.03, 0.22, 0.03]} />
          </mesh>
        </group>
      );
    case "cat-ears":
      return (
        <group position={[0, top - 0.05, 0]}>
          {[-0.24, 0.24].map((x) => (
            <group key={x} position={[x, 0.04, 0]} rotation-z={-x * 1.1}>
              <mesh material={toon(color)}>
                <coneGeometry args={[0.13, 0.24, 12]} />
              </mesh>
              <mesh position={[0, -0.02, 0.05]} material={toon(C.pink)}>
                <coneGeometry args={[0.07, 0.14, 10]} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "headphones":
      return (
        <group position={[0, 0.05, 0]}>
          <mesh material={toon(C.ink)}>
            <torusGeometry args={[0.53, 0.035, 6, 24, Math.PI]} />
          </mesh>
          {[-0.52, 0.52].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation-z={Math.PI / 2} material={toon(C.accent)}>
              <cylinderGeometry args={[0.14, 0.14, 0.1, 16]} />
            </mesh>
          ))}
        </group>
      );
    default:
      return null;
  }
}
