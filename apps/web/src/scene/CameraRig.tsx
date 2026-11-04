import { useFrame, useThree } from "@react-three/fiber";
import { SCENES } from "@xom-oii/world";
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
const OFFSET = { bus: new THREE.Vector3(0, 3.7, 12.5), library: new THREE.Vector3(0, 7.5, 10) };
const FOV = { bus: 50, library: 42 };

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
    const narrow = (camera as THREE.PerspectiveCamera).aspect < 1;
    // giữ khung hình trong phạm vi scene để không phí màn hình
    const marginX = narrow ? 2 : 7;
    const cx = Math.min(b.maxX - marginX, Math.max(b.minX + marginX, p.x));
    target.set(cx, game.scene === "bus" ? 1.9 : 0.6, p.z * 0.4 - (game.scene === "bus" ? 1 : 0));
    const off = OFFSET[game.scene];
    if (narrow) {
      // màn dọc (điện thoại): nhìn cao hơn để sàn chiếm nhiều chỗ, trời vẫn còn ở phía trên
      target.y = game.scene === "bus" ? 1.2 : 0.6;
      desired.set(target.x, target.y + off.y * 2.1, target.z + off.z * 1.25);
    } else {
      desired.set(target.x + off.x, target.y + off.y, target.z + off.z);
    }
    // chuyển scene thì nhảy ngay, còn lại đi theo mượt
    const cam = camera as THREE.PerspectiveCamera;
    if (cam.fov !== FOV[game.scene]) {
      cam.fov = FOV[game.scene];
      cam.updateProjectionMatrix();
    }
    if (camera.position.distanceTo(desired) > 25) camera.position.copy(desired);
    else camera.position.lerp(desired, Math.min(1, dt * 5));
    camera.lookAt(target);
  });

  return null;
}
