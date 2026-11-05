import { useFrame, useThree } from "@react-three/fiber";
import { SCENES } from "@oii-bus/world";
import { useEffect } from "react";
import * as THREE from "three";
import { game } from "../game/state";

const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const hit = new THREE.Vector3();
const target = new THREE.Vector3();
const desired = new THREE.Vector3();

/** Góc camera cố định (không xoay, không zoom) để ai cũng điều khiển được. */
const OFFSET = new THREE.Vector3(0, 8.5, 13.5);
const FOV = 48;

/** Camera theo sau từ góc chéo cố định. Chạm/bấm sàn để đi tới. */
export function CameraRig() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    let start: { x: number; y: number; t: number } | null = null;
    const down = (e: PointerEvent) => {
      start = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    const up = (e: PointerEvent) => {
      if (!start) return;
      const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      const quick = performance.now() - start.t < 400;
      start = null;
      if (moved > 10 || !quick || game.player.pose !== "stand") return;
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(floor, hit)) {
        const b = SCENES[game.scene].bounds;
        game.input.moveTarget = {
          x: Math.min(b.maxX - 0.4, Math.max(b.minX + 0.4, hit.x)),
          z: Math.min(b.maxZ - 0.4, Math.max(b.minZ + 0.4, hit.z)),
        };
      }
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
    };
  }, [camera, gl]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const p = game.player;
    const b = SCENES[game.scene].bounds;
    const cam = camera as THREE.PerspectiveCamera;
    const narrow = cam.aspect < 1;
    // giữ khung hình trong phạm vi sàn để không phí màn hình
    const marginX = narrow ? 3 : 10;
    const cx = Math.min(b.maxX - marginX, Math.max(b.minX + marginX, p.x));
    target.set(cx, 0.8, p.z * 0.45 - 1.2);
    if (narrow) {
      // màn dọc (điện thoại): nhìn cao hơn để sàn chiếm nhiều chỗ
      desired.set(target.x, target.y + OFFSET.y * 1.9, target.z + OFFSET.z * 1.2);
    } else {
      desired.set(target.x + OFFSET.x, target.y + OFFSET.y, target.z + OFFSET.z);
    }
    if (cam.fov !== FOV) {
      cam.fov = FOV;
      cam.updateProjectionMatrix();
    }
    if (camera.position.distanceTo(desired) > 25) camera.position.copy(desired);
    else camera.position.lerp(desired, Math.min(1, dt * 5));
    camera.lookAt(target);
  });

  return null;
}
