import { useFrame, useThree } from "@react-three/fiber";
import { OII_STREET } from "@xom-oii/world";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { game } from "../game/state";
import { M, applyDarkness } from "./materials";

const DAY_SKY = new THREE.Color("#8d9aa5");
const NIGHT_SKY = new THREE.Color("#18212c");
const DUSK_SKY = new THREE.Color("#3a4656");

/**
 * Ánh sáng theo độ tối (giờ London thật): trời, sương xanh xám, hemisphere,
 * tối đa 7 PointLight (5 đèn đường + cửa hàng + pub), Belisha nhấp nháy.
 */
export function Lights() {
  const { scene } = useThree();
  const hemi = useRef<THREE.HemisphereLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  const points = useRef<(THREE.PointLight | null)[]>([]);
  const fog = useMemo(() => new THREE.FogExp2(NIGHT_SKY.getHex(), 0.032), []);
  const sky = useMemo(() => new THREE.Color(), []);

  const lights = useMemo(() => {
    const lamps = OII_STREET.lamps
      .filter((l) => l.light)
      .map((l) => ({
        x: l.x,
        y: 4.4,
        z: l.z - Math.sign(l.z) * 0.7,
        color: "#ffc46b",
        power: 14,
        distance: 15,
      }));
    const shopX = (OII_STREET.shop.x0 + OII_STREET.shop.x1) / 2;
    const pubX = (OII_STREET.pub.x0 + OII_STREET.pub.x1) / 2;
    return [
      ...lamps,
      { x: shopX, y: 2, z: 5.6, color: "#fff4d6", power: 6, distance: 9 },
      { x: pubX, y: 2.2, z: 5.4, color: "#ffad55", power: 6, distance: 10 },
    ];
  }, []);

  useEffect(() => {
    scene.fog = fog;
    scene.background = sky;
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene, fog, sky]);

  useFrame(({ clock }) => {
    const d = game.env.darkness;
    // trời: ngày → chạng vạng → đêm
    if (d < 0.5) sky.copy(DAY_SKY).lerp(DUSK_SKY, d * 2);
    else sky.copy(DUSK_SKY).lerp(NIGHT_SKY, (d - 0.5) * 2);
    fog.color.copy(sky);
    fog.density = 0.022 + d * 0.01;
    if (hemi.current) hemi.current.intensity = 1.7 - d * 1.0;
    if (moon.current) moon.current.intensity = 1.1 - d * 0.7;
    points.current.forEach((p, i) => {
      if (p) p.intensity = lights[i]!.power * (0.05 + d * 0.95);
    });
    applyDarkness(d);
    // Belisha nhấp nháy ~1 Hz
    const on = Math.floor(clock.elapsedTime * 1.6) % 2 === 0;
    M.belisha.emissiveIntensity = on ? 1.6 : 0.1;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#b8c6d4", "#3a3430", 0.6]} />
      <directionalLight ref={moon} position={[-20, 30, 10]} color="#c9d6e6" intensity={0.3} />
      {lights.map((l, i) => (
        <pointLight
          key={i}
          ref={(el) => {
            points.current[i] = el;
          }}
          position={[l.x, l.y, l.z]}
          color={l.color}
          distance={l.distance}
          decay={1.2}
        />
      ))}
      {[-4.6, 4.6].map((z) => (
        <mesh key={z} material={M.belisha} position={[OII_STREET.zebraX - 2.2, 3.18, z]}>
          <sphereGeometry args={[0.2, 12, 8]} />
        </mesh>
      ))}
    </>
  );
}
