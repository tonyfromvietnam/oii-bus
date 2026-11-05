import { useFrame } from "@react-three/fiber";
import { LANDMARKS, ROUTE_LENGTH, nearestLandmark, routeToLocalX, type LandmarkId } from "@oii-bus/world";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { game } from "../game/state";
import { GROUND, buildLandmark, buildTile, type LandmarkObject } from "./landmarks";
import { C, mat, texMat } from "./materials";
import { Deck, HALF_L, HALF_W } from "./Deck";

const G = GROUND;

function buildWheels(): THREE.Mesh[] {
  const wheels: THREE.Mesh[] = [];
  const geo = new THREE.CylinderGeometry(1.3, 1.3, 0.7, 20);
  geo.rotateX(Math.PI / 2);
  for (const x of [-HALF_L + 5, -HALF_L + 8, -4, 4, HALF_L - 7]) {
    for (const s of [-1, 1]) {
      const m = new THREE.Mesh(geo, mat(C.tyre));
      m.position.set(x, G + 1.3, s * (HALF_W - 0.2));
      const hub = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.72), mat(C.white));
      m.add(hub);
      wheels.push(m);
    }
  }
  return wheels;
}

const TILE = 40;
const TILE_COUNT = ROUTE_LENGTH / TILE;

/** Chiều cao "đồ chơi" (m) và bề rộng tối đa của từng địa danh trong khung hình. */
const TOY: Partial<Record<LandmarkId, number>> = {
  "big-ben": 20,
  "london-eye": 19,
  "tower-bridge": 15,
  buckingham: 9,
  "brighton-pier": 8,
  stonehenge: 9,
  bath: 10,
  oxford: 14,
  birmingham: 11,
  "old-trafford": 9,
  liverpool: 16,
  "angel-north": 13,
  edinburgh: 16,
  "st-pauls": 17,
  shard: 22,
  windsor: 12,
  "white-cliffs": 10,
  cardiff: 14,
  snowdon: 18,
  cotswolds: 7,
  cambridge: 13,
  blackpool: 20,
  "lake-district": 12,
  york: 17,
  "hadrians-wall": 7,
  "forth-bridge": 12,
  "loch-ness": 11,
  "giants-causeway": 8,
};
const MAX_WIDTH = 60;
const LANDMARK_Z = -46;
const box3 = new THREE.Box3();
const size = new THREE.Vector3();

/**
 * Đưa địa danh về cỡ "đồ chơi" và đặt ở xa phía sau bus, để cả công trình nằm gọn trong khung hình
 * khi bus chạy ngang qua.
 */
function toyScale(id: LandmarkId, lm: LandmarkObject): LandmarkObject {
  const inner = lm.group;
  box3.setFromObject(inner).getSize(size);
  const s = Math.min((TOY[id] ?? 15) / size.y, MAX_WIDTH / size.x);
  inner.scale.setScalar(s);
  inner.position.set(0, G, LANDMARK_Z);
  const outer = new THREE.Group();
  outer.add(inner);
  return { group: outer, update: lm.update };
}

/** Cảnh UK trôi qua: ô cảnh lặp lại + địa danh, vị trí tính từ giờ thật (giống nhau cho mọi người). */
function Scenery() {
  const tiles = useMemo(
    () =>
      Array.from({ length: TILE_COUNT }, (_, i) => {
        const at = i * TILE;
        const near = nearestLandmark(at);
        return { at, obj: buildTile(TILE, 100 + i, near.terrain, near.houses) };
      }),
    [],
  );
  const marks = useMemo(
    () => LANDMARKS.map((lm) => ({ at: lm.at, ...toyScale(lm.id, buildLandmark(lm.id)) })),
    [],
  );
  const road = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    for (const t of tiles) {
      const x = routeToLocalX(t.at, game.route);
      t.obj.position.x = x;
      t.obj.visible = Math.abs(x) < 170;
      t.obj.updateMatrixWorld(true);
    }
    for (const m of marks) {
      const x = routeToLocalX(m.at, game.route);
      m.group.position.x = x;
      m.group.visible = Math.abs(x) < 240;
      m.update?.(clock.elapsedTime);
    }
  });

  return (
    <group>
      <group ref={road}>
        <mesh rotation-x={-Math.PI / 2} position={[0, G, 0]} material={texMat("asphalt", C.road, 60, 1.4)}>
          <planeGeometry args={[600, 30]} />
        </mesh>
        <mesh
          rotation-x={-Math.PI / 2}
          position={[0, G - 0.1, 0]}
          material={texMat("grass", C.grass, 60, 26)}
        >
          <planeGeometry args={[600, 260]} />
        </mesh>
      </group>
      {tiles.map((t) => (
        <primitive key={t.at} object={t.obj} />
      ))}
      {marks.map((m) => (
        <primitive key={m.at} object={m.group} />
      ))}
    </group>
  );
}

/** Oii-Bus: cảnh UK trôi qua phía sau + tầng thượng siêu to (Deck). */
export function BusWorld() {
  const wheels = useMemo(() => buildWheels(), []);
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    for (const w of wheels) w.rotation.z = -game.route / 1.3;
    // xe rung rinh nhẹ cho có cảm giác đang chạy
    if (body.current) body.current.position.y = Math.sin(clock.elapsedTime * 7) * 0.012;
  });
  return (
    <>
      {/* lùi cảnh vật ra xa cho vừa thân xe rộng */}
      <group position-z={-7}>
        <Scenery />
      </group>
      <group ref={body}>
        <Deck />
        {wheels.map((w, i) => (
          <primitive key={i} object={w} />
        ))}
      </group>
    </>
  );
}
