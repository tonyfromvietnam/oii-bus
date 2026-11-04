import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 1400;
const AREA = { x: 34, y: 18, z: 26 };

/** Mưa phùn quanh camera: LineSegments, tái sử dụng hạt rơi. */
export function Rain() {
  const ref = useRef<THREE.LineSegments>(null);
  const { geom, seeds } = useMemo(() => {
    const pos = new Float32Array(COUNT * 6);
    const seeds = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      seeds[i * 3] = (Math.random() - 0.5) * AREA.x;
      seeds[i * 3 + 1] = Math.random() * AREA.y;
      seeds[i * 3 + 2] = (Math.random() - 0.5) * AREA.z;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geom, seeds };
  }, []);
  const mat = useMemo(
    () => new THREE.LineBasicMaterial({ color: "#aebfcc", transparent: true, opacity: 0.35, fog: true }),
    [],
  );

  useFrame(({ camera }, dt) => {
    const pos = geom.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const fall = Math.min(dt, 0.05) * 9;
    const cx = camera.position.x;
    const cz = camera.position.z;
    for (let i = 0; i < COUNT; i++) {
      let y = seeds[i * 3 + 1]! - fall;
      if (y < 0) y += AREA.y;
      seeds[i * 3 + 1] = y;
      // bám theo camera theo kiểu "quấn" để không thấy biên
      const x = cx + ((((seeds[i * 3]! - cx) % AREA.x) + AREA.x * 1.5) % AREA.x) - AREA.x / 2;
      const z = cz + ((((seeds[i * 3 + 2]! - cz) % AREA.z) + AREA.z * 1.5) % AREA.z) - AREA.z / 2;
      const o = i * 6;
      arr[o] = x;
      arr[o + 1] = y;
      arr[o + 2] = z;
      arr[o + 3] = x - 0.04;
      arr[o + 4] = y + 0.35;
      arr[o + 5] = z - 0.02;
    }
    pos.needsUpdate = true;
  });

  return <lineSegments ref={ref} geometry={geom} material={mat} frustumCulled={false} />;
}
