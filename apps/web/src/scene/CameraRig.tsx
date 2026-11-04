import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { OII_STREET } from "@xom-oii/world";
import { game } from "../game/state";

const MIN_DIST = 4;
const MAX_DIST = 14;
const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const hit = new THREE.Vector3();
const target = new THREE.Vector3();
const desired = new THREE.Vector3();

/**
 * Camera third-person: kéo để xoay, con lăn để zoom (4–14 m), chạm/bấm mặt đường để đi tới.
 * Trên mobile: nửa phải màn hình là vùng vuốt xoay camera (joystick ở nửa trái là DOM riêng).
 */
export function CameraRig() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    let dragging: { id: number; x: number; y: number; sx: number; sy: number; t: number } | null = null;

    const down = (e: PointerEvent) => {
      if (dragging) return;
      dragging = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        sx: e.clientX,
        sy: e.clientY,
        t: performance.now(),
      };
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== dragging.id) return;
      const dx = e.clientX - dragging.x;
      const dy = e.clientY - dragging.y;
      dragging.x = e.clientX;
      dragging.y = e.clientY;
      const c = game.camera;
      c.yaw -= dx * 0.006;
      c.pitch = Math.min(1.25, Math.max(0.08, c.pitch + dy * 0.004));
    };
    const up = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== dragging.id) return;
      const moved = Math.hypot(e.clientX - dragging.sx, e.clientY - dragging.sy);
      const quick = performance.now() - dragging.t < 350;
      dragging = null;
      if (moved < 8 && quick) {
        // chạm/bấm → đi tới điểm trên mặt phẳng y = 0
        const r = el.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        if (ray.ray.intersectPlane(ground, hit) && game.player.pose === "stand") {
          game.input.moveTarget = { x: hit.x, z: hit.z };
        }
      }
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const c = game.camera;
      c.dist = Math.min(MAX_DIST, Math.max(MIN_DIST, c.dist + e.deltaY * 0.01));
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [camera, gl]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const p = game.player;
    const c = game.camera;
    target.set(p.x, p.y + 1.5, p.z);
    let dist = c.dist;
    const dirX = Math.sin(c.yaw) * Math.cos(c.pitch);
    const dirY = Math.sin(c.pitch);
    const dirZ = Math.cos(c.yaw) * Math.cos(c.pitch);
    // không cho camera chui vào nhà (mặt tiền z = ±7)
    const limit = p.pose === "bus" ? 9 : 6.6;
    if (Math.abs(dirZ) > 1e-3) {
      const maxD = (Math.sign(dirZ) * limit - target.z) / dirZ;
      if (maxD > 0) dist = Math.min(dist, Math.max(1.2, maxD));
    }
    desired.set(target.x + dirX * dist, Math.max(0.5, target.y + dirY * dist), target.z + dirZ * dist);
    // tránh nhìn từ trên mái bến bus xuống
    const sh = OII_STREET.busShelter;
    if (desired.x > sh.x0 - 0.4 && desired.x < sh.x1 + 0.4 && desired.z > 5.3 && desired.y > 2.2) {
      desired.z = Math.min(desired.z, 5.3);
    }
    camera.position.lerp(desired, Math.min(1, dt * 10));
    camera.lookAt(target);
  });

  return null;
}
