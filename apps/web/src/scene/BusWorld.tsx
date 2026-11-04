import { useFrame } from "@react-three/fiber";
import {
  BUS_PROPS as P,
  BUS_SCENE,
  DUCKS,
  LANDMARKS,
  ROUTE_LENGTH,
  nearestLandmark,
  routeToLocalX,
  type LandmarkId,
} from "@xom-oii/world";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { game } from "../game/state";
import { GROUND, buildLandmark, buildTile, type LandmarkObject } from "./landmarks";
import { C, glow, toon } from "./materials";
import { signMaterial } from "./signs";
import { StaticBuilder } from "./StaticBuilder";

const B = BUS_SCENE.bounds;
const HALF_L = B.maxX + 0.6;
const HALF_W = B.maxZ + 0.4;
const G = GROUND;

/** Bus siêu to mui trần: thân đỏ, sàn gỗ, lan can vàng, cờ dây, đồ đạc vui. */
function buildBus(): THREE.Group {
  const b = new StaticBuilder();
  const red = toon(C.bus);
  // thân xe
  b.box(red, HALF_L * 2, -G - 0.9, HALF_W * 2, 0, (G + 0.9) / 2, 0);
  b.box(toon(C.cream), HALF_L * 2 + 0.02, 0.35, HALF_W * 2 + 0.02, 0, G + 2.0, 0);
  b.box(toon(C.busDark), HALF_L * 2 + 0.04, 0.3, HALF_W * 2 + 0.04, 0, G + 0.95, 0);
  // cửa sổ tầng dưới (thư viện sáng đèn ấm bên trong)
  for (let x = -HALF_L + 2; x < HALF_L - 2; x += 2.6) {
    for (const s of [-1, 1])
      b.box(glow("#ffe2a8", 0.45, 1.1), 2.0, 1.4, 0.06, x + 1, G + 3.0, s * (HALF_W + 0.01));
  }
  // kính chắn gió + bảng điểm đến
  b.box(toon(C.glass), 0.08, 1.8, HALF_W * 2 - 1, HALF_L + 0.01, G + 3.0, 0);
  b.add(
    signMaterial("", { bg: "#3b2f45", fg: "#ffd166", lines: ["N29 · VÒNG LONDON"] }),
    new THREE.PlaneGeometry(5, 0.9),
    HALF_L + 0.05,
    G + 4.1,
    0,
    0,
    Math.PI / 2,
  );
  for (const z of [-2.6, 2.6]) b.sphere(glow("#fff6d6", 0.5, 1.2), 0.4, HALF_L + 0.05, G + 1.5, z);
  // tên xe hai bên hông
  const logo = signMaterial("", {
    bg: "#fff4e0",
    fg: "#ff5a5f",
    lines: ["Bus Oii 🚌  ·  Xóm Oii"],
    width: 1024,
    height: 160,
  });
  b.add(logo, new THREE.PlaneGeometry(10, 1.5), -4, G + 2.0, HALF_W + 0.04);
  // sàn gỗ
  b.box(toon(C.deck), HALF_L * 2, 0.2, HALF_W * 2, 0, -0.1, 0);
  for (let z = -HALF_W + 0.5; z < HALF_W; z += 1)
    b.box(toon(C.deckLine), HALF_L * 2, 0.012, 0.05, 0, 0.002, z);
  // lan can quanh tầng thượng (thấp, tròn, vàng)
  const rail = toon(C.rail);
  for (const s of [-1, 1]) {
    b.box(rail, HALF_L * 2, 0.12, 0.12, 0, 0.95, s * HALF_W);
    b.box(red, HALF_L * 2, 0.5, 0.12, 0, 0.25, s * HALF_W);
    for (let x = -HALF_L; x <= HALF_L; x += 2) b.cyl(rail, 0.05, 0.95, x, 0.47, s * HALF_W);
  }
  for (const s of [-1, 1]) {
    b.box(rail, 0.12, 0.12, HALF_W * 2, s * HALF_L, 0.95, 0);
    b.box(red, 0.12, 0.5, HALF_W * 2, s * HALF_L, 0.25, 0);
  }
  // cờ dây pastel dọc hai bên
  const flags = [C.oiiBlue, C.oiiYellow, C.mint, C.white, C.oiiBlue];
  // chỉ phía xa: phía gần sẽ cắt ngang nhân vật trong khung hình
  for (const s of [-1]) {
    for (let x = -HALF_L + 1; x < HALF_L; x += 0.9) {
      const sag = Math.sin(((x + HALF_L) / 6) * Math.PI) * 0.15;
      b.add(
        toon(flags[Math.round((x + HALF_L) / 0.9) % flags.length]!),
        new THREE.ConeGeometry(0.16, 0.3, 3),
        x,
        1.85 - Math.abs(sag),
        s * HALF_W,
        Math.PI,
        0,
        0,
      );
    }
    b.box(toon(C.ink), HALF_L * 2, 0.02, 0.02, 0, 2.0, s * HALF_W);
    for (const x of [-HALF_L, 0, HALF_L]) b.cyl(rail, 0.04, 1.1, x, 1.5, s * HALF_W);
  }
  // đèn dây (sáng khi London tối)
  const bulb = glow("#fff3b0", 0.3, 1.4);
  for (let x = -HALF_L + 0.5; x < HALF_L; x += 1.4) b.sphere(bulb, 0.06, x, 1.98, -HALF_W);

  // --- đồ đạc ---
  const cushion = toon(C.cushion);
  const benchSeat = (x: number, z: number, w: number, d: number, backDir: "x" | "z", backSign: number) => {
    b.box(toon(C.woodDark), w, 0.35, d, x, 0.17, z);
    b.box(cushion, w - 0.05, 0.12, d - 0.05, x, 0.41, z);
    if (backDir === "x") b.box(cushion, 0.15, 0.6, d, x + backSign * (w / 2 - 0.07), 0.75, z);
    else b.box(cushion, w, 0.6, 0.15, x, 0.75, z + backSign * (d / 2 - 0.07));
  };
  for (const fb of P.frontBenches) benchSeat(fb.x + 0.25, fb.z, 0.7, 1.9, "x", -1);
  for (const sb of P.sideBenches) benchSeat(sb.x, sb.z - 0.2, 1.9, 0.6, "z", -1);

  // khung ảnh "📸" ở đầu xe
  const fx = P.photo.x + 1.1;
  b.box(toon(C.white), 0.15, 2.3, 2.6, fx, 1.6, 0);
  b.box(toon(C.lemon), 0.18, 1.8, 2.1, fx - 0.01, 1.7, 0);
  b.add(
    signMaterial("", { bg: "#ffffff", fg: "#3b2f45", lines: ["📸 Chụp ảnh", "với London!"] }),
    new THREE.PlaneGeometry(1.8, 1.0),
    fx - 0.11,
    1.7,
    0,
    0,
    -Math.PI / 2,
  );
  b.cyl(toon(C.ink), 0.06, 0.6, fx, 0.3, 0);

  // quầy trà sữa
  const tc = P.teaCart;
  b.box(toon(C.oiiBlue), 1.6, 0.95, 0.9, tc.x, 0.48, tc.z);
  b.box(toon(C.white), 1.7, 0.08, 1.0, tc.x, 0.98, tc.z);
  for (let i = 0; i < 4; i++) {
    b.cyl(
      toon(["#f3d9b1", "#d9b8ff", "#ffc7d1", "#bfe8d6"][i]!),
      0.08,
      0.22,
      tc.x - 0.5 + i * 0.33,
      1.13,
      tc.z + 0.2,
    );
  }
  b.cyl(toon(C.ink), 0.04, 1.6, tc.x, 1.75, tc.z - 0.2);
  b.add(toon(C.oiiYellow), new THREE.ConeGeometry(1.2, 0.5, 8), tc.x, 2.6, tc.z - 0.2);
  b.add(
    signMaterial("Trà sữa 🧋", { bg: "#ff8fab", fg: "#ffffff" }),
    new THREE.PlaneGeometry(1.4, 0.35),
    tc.x,
    0.55,
    tc.z + 0.46,
  );

  // góc karaoke
  const k = P.karaoke;
  b.box(toon(C.oiiBlue), 0.6, 1.0, 0.5, k.x + 0.6, 0.5, k.z);
  b.cyl(toon("#6b5b7b"), 0.18, 0.02, k.x + 0.6, 0.65, k.z - 0.26, Math.PI / 2);
  b.cyl(toon(C.ink), 0.03, 1.3, k.x - 0.2, 0.65, k.z - 0.1);
  b.sphere(toon("#c0c0d0"), 0.08, k.x - 0.2, 1.33, k.z - 0.1);
  b.add(
    signMaterial("🎤 Karaoke", { bg: "#b77cff", fg: "#ffffff" }),
    new THREE.PlaneGeometry(1.1, 0.3),
    k.x + 0.6,
    1.2,
    k.z - 0.27,
    0,
    Math.PI,
  );

  // máy meal deal
  const v = P.vending;
  b.box(toon("#4e9297"), 1.1, 2.0, 0.8, v.x, 1.0, v.z);
  b.box(glow("#e9f6ff", 0.4, 1), 0.75, 1.1, 0.05, v.x - 0.08, 1.25, v.z + 0.41);
  b.add(
    signMaterial("MEAL DEAL £3.50", { bg: "#ffd166", fg: "#3b2f45" }),
    new THREE.PlaneGeometry(1.0, 0.25),
    v.x,
    1.95,
    v.z + 0.42,
  );

  // nồi lẩu chung
  const h = P.hotpot;
  b.cyl(toon(C.wood), 0.85, 0.08, h.x, 0.72, h.z);
  b.cyl(toon(C.woodDark), 0.12, 0.7, h.x, 0.35, h.z);
  b.cyl(toon("#c0c4cc"), 0.4, 0.25, h.x, 0.88, h.z);
  b.cyl(toon("#ff8a5c"), 0.36, 0.02, h.x, 1.0, h.z);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.cyl(toon(C.white), 0.1, 0.05, h.x + Math.cos(a) * 0.62, 0.78, h.z + Math.sin(a) * 0.62);
  }
  for (const s of BUS_SCENE.seats.filter((s) => s.id.startsWith("hotpot")))
    b.cyl(toon(C.peach), 0.25, 0.45, s.x, 0.22, s.z);

  // bảng nhiệm vụ
  const q = P.questBoard;
  b.box(toon(C.woodDark), 1.4, 1.1, 0.12, q.x, 1.35, q.z);
  b.box(toon("#e8c39e"), 1.25, 0.95, 0.13, q.x, 1.35, q.z);
  b.add(
    signMaterial("", { bg: "#fff4e0", fg: "#3b2f45", lines: ["⭐ NHIỆM VỤ", "tuần này"] }),
    new THREE.PlaneGeometry(0.9, 0.55),
    q.x,
    1.4,
    q.z + 0.08,
  );
  for (const lx of [-0.5, 0.5]) b.cyl(toon(C.woodDark), 0.04, 0.8, q.x + lx, 0.4, q.z);

  // cầu thang xuống thư viện
  const st = P.stairs;
  b.box(toon("#6b5b7b"), 2.6, 0.02, 1.8, st.x, 0.01, st.z);
  for (let i = 0; i < 5; i++)
    b.box(toon(C.deckLine), 2.4, 0.03, 0.3, st.x - 1 + i * 0.5, -0.2 - i * 0.25, st.z, 0, Math.PI / 2);
  for (const dz of [-0.95, 0.95]) b.box(rail, 2.6, 0.08, 0.08, st.x, 0.95, st.z + dz);
  b.box(rail, 0.08, 0.08, 1.9, st.x - 1.3, 0.95, st.z);
  b.add(
    signMaterial("", { bg: "#3b2f45", fg: "#ffffff", lines: ["📚 Thư viện", "tầng dưới · suỵt!"] }),
    new THREE.PlaneGeometry(1.4, 0.75),
    st.x + 1.35,
    1.35,
    st.z,
    0,
    Math.PI / 2,
  );
  b.cyl(toon(C.ink), 0.04, 1.0, st.x + 1.35, 0.5, st.z);

  // ô dựng sẵn
  const u = P.umbrellas;
  b.cyl(toon(C.ink), 0.22, 0.6, u.x, 0.3, u.z);
  [C.oiiBlue, C.oiiYellow, C.accent].forEach((c, i) => {
    b.cyl(toon(C.ink), 0.02, 1.1, u.x - 0.1 + i * 0.1, 0.75, u.z, 0, 0, (i - 1) * 0.2);
    b.add(
      toon(c),
      new THREE.ConeGeometry(0.12, 0.5, 6),
      u.x - 0.1 + i * 0.12 + (i - 1) * 0.15,
      1.2,
      u.z,
      0,
      0,
      (i - 1) * 0.2,
    );
  });

  // chậu cây xinh
  for (const [px, pz] of [
    [15.6, -3.2],
    [-15.6, 3.2],
    [-2.4, 3.2],
    [9.2, 3.2],
  ] as const) {
    b.cyl(toon(C.peach), 0.25, 0.4, px, 0.2, pz);
    b.sphere(toon(C.leaf), 0.35, px, 0.6, pz);
  }

  // bánh xe
  const g = new THREE.Group();
  for (const m of b.build()) g.add(m);
  return g;
}

function buildWheels(): THREE.Mesh[] {
  const wheels: THREE.Mesh[] = [];
  const geo = new THREE.CylinderGeometry(0.95, 0.95, 0.6, 18);
  geo.rotateX(Math.PI / 2);
  for (const x of [-HALF_L + 3, -HALF_L + 5.2, HALF_L - 3.5]) {
    for (const s of [-1, 1]) {
      const m = new THREE.Mesh(geo, toon(C.tyre));
      m.position.set(x, G + 0.95, s * (HALF_W - 0.2));
      const hub = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.62), toon(C.white));
      m.add(hub);
      wheels.push(m);
    }
  }
  return wheels;
}

function Ducks() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    DUCKS.forEach((d, i) => {
      const g = refs.current[i];
      if (!g) return;
      g.visible = !game.ducksFound.has(d.id);
      g.position.y = 0.02 + Math.abs(Math.sin(clock.elapsedTime * 3 + i)) * 0.06;
      g.rotation.y = Math.sin(clock.elapsedTime + i) * 0.5;
    });
  });
  return (
    <>
      {DUCKS.map((d, i) => (
        <group
          key={d.id}
          position={[d.x, 0, d.z]}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <mesh position={[0, 0.13, 0]} scale={[1, 0.8, 1.2]} material={toon("#ffd84a")}>
            <sphereGeometry args={[0.16, 12, 10]} />
          </mesh>
          <mesh position={[0, 0.3, 0.1]} material={toon("#ffd84a")}>
            <sphereGeometry args={[0.1, 12, 10]} />
          </mesh>
          <mesh position={[0, 0.29, 0.21]} scale={[1, 0.5, 1]} material={toon("#ff9a3c")}>
            <sphereGeometry args={[0.05, 8, 6]} />
          </mesh>
          {[-0.045, 0.045].map((x) => (
            <mesh key={x} position={[x, 0.33, 0.18]} material={toon(C.ink)}>
              <sphereGeometry args={[0.015, 6, 6]} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

function Steam() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const t = (clock.elapsedTime * 0.5 + i / 4) % 1;
      m.position.set(P.hotpot.x + Math.sin(i * 2 + t * 3) * 0.15, 1.1 + t * 1.2, P.hotpot.z);
      m.scale.setScalar(0.12 + t * 0.2);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - t);
    });
  });
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
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
        <mesh rotation-x={-Math.PI / 2} position={[0, G, 0]} material={toon(C.road)}>
          <planeGeometry args={[600, 14]} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, G - 0.1, 0]} material={toon(C.grass)}>
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

export function BusWorld() {
  const bus = useMemo(() => buildBus(), []);
  const wheels = useMemo(() => buildWheels(), []);
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    for (const w of wheels) w.rotation.z = -game.route / 0.95;
    // xe rung rinh nhẹ cho có cảm giác đang chạy
    if (body.current) body.current.position.y = Math.sin(clock.elapsedTime * 7) * 0.012;
  });
  return (
    <>
      <Scenery />
      <group ref={body}>
        <primitive object={bus} />
        {wheels.map((w, i) => (
          <primitive key={i} object={w} />
        ))}
        <Ducks />
        <Steam />
      </group>
    </>
  );
}
