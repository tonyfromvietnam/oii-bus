import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { game } from "../game/state";
import { applyDarkness } from "./materials";
import { StaticBuilder } from "./StaticBuilder";

const DAY = { top: new THREE.Color("#9fd2dc"), bottom: new THREE.Color("#f1f8ec") };
// khi London tối: hoàng hôn tím hồng, không bao giờ tối om
const DUSK = { top: new THREE.Color("#8ea6cf"), bottom: new THREE.Color("#fde3c8") };

/** Trời gradient pastel + mây bông + nắng ấm. Đổi sang hoàng hôn tím khi London tối thật. */
export function Sky() {
  const { scene } = useThree();
  const uniforms = useMemo(
    () => ({ top: { value: DAY.top.clone() }, bottom: { value: DAY.bottom.clone() } }),
    [],
  );
  const fog = useMemo(() => new THREE.Fog(DAY.bottom.getHex(), 90, 300), []);
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const clouds = useMemo(() => {
    const b = new StaticBuilder();
    // vật liệu riêng (không dùng cache toon) để tắt sương mù cho mây
    const white = new THREE.MeshBasicMaterial({ color: "#ffffff", fog: false });
    for (let i = 0; i < 14; i++) {
      const x = -200 + i * 30 + (i % 3) * 7;
      const y = 32 + (i % 4) * 7;
      const z = -110 - (i % 5) * 15;
      for (let k = 0; k < 4; k++) b.sphere(white, 5 + (k % 2) * 2.5, x + k * 5, y + (k % 2) * 2, z);
    }
    const g = new THREE.Group();
    for (const m of b.build()) g.add(m);
    return g;
  }, []);

  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useFrame(({ clock }) => {
    const d = game.env.darkness * 0.7;
    uniforms.top.value.copy(DAY.top).lerp(DUSK.top, d);
    uniforms.bottom.value.copy(DAY.bottom).lerp(DUSK.bottom, d);
    fog.color.copy(uniforms.bottom.value);
    if (sun.current) sun.current.intensity = 2.0 - d * 0.9;
    if (hemi.current) hemi.current.intensity = 1.5 - d * 0.4;
    applyDarkness(game.env.darkness);
    clouds.position.x = ((clock.elapsedTime * -2 - game.route * 0.15) % 420) + 140;
  });

  return (
    <>
      <mesh scale={400} renderOrder={-1}>
        <sphereGeometry args={[1, 24, 12]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          uniforms={uniforms}
          vertexShader={`varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={`uniform vec3 top; uniform vec3 bottom; varying float h; void main(){ gl_FragColor = vec4(mix(bottom, top, smoothstep(-0.05, 0.6, h)), 1.0); }`}
        />
      </mesh>
      <primitive object={clouds} />
      <hemisphereLight ref={hemi} args={["#eef8f6", "#e9dcc4", 1.5]} />
      <directionalLight ref={sun} position={[30, 50, 40]} color="#fff1d6" intensity={2} />
    </>
  );
}

/** Ánh sáng ấm trong thư viện. */
export function LibraryLights() {
  const { scene } = useThree();
  useEffect(() => {
    const prev = scene.background;
    scene.background = new THREE.Color("#f1f8ec");
    return () => {
      scene.background = prev;
    };
  }, [scene]);
  return (
    <>
      <hemisphereLight args={["#fff4e6", "#e8c39e", 1.6]} />
      <directionalLight position={[-6, 10, 8]} color="#ffe8c7" intensity={1.4} />
    </>
  );
}
