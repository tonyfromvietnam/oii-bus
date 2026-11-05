import { useFrame } from "@react-three/fiber";
import { SHOP_WIDTH, STREET_PLACES, STREET_SCENE, placeSpot, type PlaceId } from "@oii-bus/world";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { PLACES } from "../copy/handbook";
import { activeQuests, isDone, useHandbook } from "../game/handbook";
import { C, glow, mat, metal, shiny, texMat } from "./materials";
import { signMaterial } from "./signs";
import { StaticBuilder } from "./StaticBuilder";

const B = STREET_SCENE.bounds;
/** Màu mặt tiền từng cửa hàng (gợi ý thương hiệu ngoài đời nhưng không dùng logo thật). */
const FACADE: Record<PlaceId, { wall: string; sign: string; fg: string }> = {
  arrivals: { wall: "#dfe8ee", sign: "#1f2d4d", fg: "#fde3a0" },
  bank: { wall: "#2f6b5a", sign: "#ffffff", fg: "#2f6b5a" },
  letting: { wall: "#e9cf98", sign: "#1f2d4d", fg: "#ffffff" },
  gp: { wall: "#f4f1ea", sign: "#3a6fb5", fg: "#ffffff" },
  pharmacy: { wall: "#cfe3f2", sign: "#2a5ea8", fg: "#ffffff" },
  supermarket: { wall: "#f2d14a", sign: "#2a4fa0", fg: "#ffffff" },
  asian: { wall: "#c74a3a", sign: "#f2c14e", fg: "#8f2522" },
  laundrette: { wall: "#a8d3d9", sign: "#ffffff", fg: "#1f2d4d" },
  cafe: { wall: "#7a5434", sign: "#fde3a0", fg: "#1f2d4d" },
  station: { wall: "#b5523f", sign: "#ffffff", fg: "#c0392b" },
  freshers: { wall: "#ffffff", sign: "#4e9297", fg: "#ffffff" },
  busstop: { wall: "#ffffff", sign: "#4e9297", fg: "#ffffff" },
};

function buildStreet(): THREE.Group {
  const b = new StaticBuilder();
  const W = B.maxX - B.minX + 4;
  // mặt đường lát đá cho người đi bộ + vỉa hè + lòng đường phía gần
  b.box(texMat("flagstone", "#d8d0c2", 10, 3), W, 0.2, 13, 0, -0.1, 0.2);
  b.box(texMat("asphalt", "#9aa3ab", 12, 1), W, 0.1, 8, 0, -0.16, 10.5);
  b.box(mat("#cfc6b6"), W, 0.18, 0.3, 0, 0.0, 6.6);
  // các cửa hàng phía xa
  for (const p of STREET_PLACES.filter((x) => x.kind === "shop")) {
    const f = FACADE[p.id];
    const info = PLACES[p.id];
    const h = 6 + ((((p.x * 7) % 3) + 3) % 2.5);
    const w = SHOP_WIDTH - 0.15;
    b.box(
      p.id === "station" || p.id === "bank" ? texMat("brick", f.wall) : mat(f.wall),
      w,
      h,
      6,
      p.x,
      h / 2,
      -10.4,
    );
    b.box(mat("#5f6673"), w + 0.1, 0.4, 6.2, p.x, h + 0.2, -10.4);
    // mặt kính + cửa
    b.box(glow("#fff4d6", 0.35, 1.0), w - 1.6, 2.0, 0.12, p.x - 0.5, 1.3, -7.38);
    b.box(shiny("#cfe9ee"), 1.0, 2.3, 0.12, p.x + w / 2 - 0.85, 1.15, -7.38);
    b.box(mat("#ffffff"), w, 0.12, 0.2, p.x, 2.45, -7.3);
    // biển hiệu
    b.box(mat(f.sign), w - 0.3, 0.75, 0.2, p.x, 3.0, -7.32);
    b.add(
      signMaterial(info.sign, { bg: f.sign, fg: f.fg }),
      new THREE.PlaneGeometry(w - 0.5, 0.62),
      p.x,
      3.0,
      -7.21,
    );
    // cửa sổ tầng trên
    for (const dx of [-1.2, 1.2]) {
      b.box(mat("#ffffff"), 1.2, 1.3, 0.14, p.x + dx, 4.6, -7.36);
      b.box(glow("#fff1c4", 0.2, 0.9), 0.95, 1.05, 0.16, p.x + dx, 4.6, -7.36);
    }
    // tấm thảm trước cửa (chỗ đứng bấm E)
    b.box(mat("#bfb39a"), 2.2, 0.02, 1.0, p.x, 0.01, -6.7);
  }
  // gian Freshers' Fair (lều)
  const fr = STREET_PLACES.find((x) => x.id === "freshers")!;
  b.box(mat("#ffffff"), 3.2, 0.9, 1.2, fr.x, 0.45, fr.z + 0.8);
  b.box(mat(C.accent), 3.3, 0.12, 1.3, fr.x, 0.95, fr.z + 0.8);
  for (const dx of [-1.5, 1.5])
    for (const dz of [0.25, 1.35]) b.cyl(metal("#dfe3e8"), 0.05, 2.4, fr.x + dx, 1.2, fr.z + dz);
  b.add(
    mat("#f6b3c2"),
    new THREE.ConeGeometry(2.4, 1.0, 4),
    fr.x,
    2.9,
    fr.z + 0.8,
    0,
    Math.PI / 4,
    0,
    1,
    1,
    0.55,
  );
  b.add(
    signMaterial("", { bg: "#4e9297", fg: "#ffffff", lines: ["FRESHERS' FAIR", "🤝 Tìm bạn đồng hành"] }),
    new THREE.PlaneGeometry(2.4, 0.8),
    fr.x,
    1.55,
    fr.z + 0.12,
    0,
    Math.PI,
  );
  // bến Oii-Bus
  const bs = STREET_PLACES.find((x) => x.id === "busstop")!;
  b.box(metal("#4e9297"), 2.8, 0.12, 1.2, bs.x, 2.4, bs.z + 0.8);
  for (const dx of [-1.3, 1.3]) b.cyl(metal("#4e9297"), 0.05, 2.4, bs.x + dx, 1.2, bs.z + 1.3);
  b.box(shiny("#cfe9ee"), 2.6, 1.8, 0.04, bs.x, 1.2, bs.z + 1.35);
  b.box(mat("#d9a874"), 2.2, 0.08, 0.4, bs.x, 0.45, bs.z + 1.1);
  b.cyl(metal("#1f2d4d"), 0.05, 2.8, bs.x - 1.9, 1.4, bs.z + 0.6);
  b.add(
    signMaterial("", { bg: "#ffffff", fg: "#4e9297", border: "#4e9297", lines: ["Oii-Bus", "🚌"] }),
    new THREE.CircleGeometry(0.4, 20),
    bs.x - 1.9,
    2.75,
    bs.z + 0.55,
    0,
    Math.PI,
  );
  // cây + đèn đường
  for (const x of [-17, -3, 9, 21]) {
    if (x === -3 || x === 21) {
      b.cyl(mat(C.woodDark), 0.18, 2.6, x, 1.3, 2.2);
      b.sphere(mat("#8fcf8c"), 1.3, x, 3.2, 2.2);
    } else {
      b.cyl(metal("#1f2d4d"), 0.08, 3.6, x, 1.8, 2.2);
      b.box(glow("#fde3a0", 0.4, 1.3), 0.4, 0.5, 0.4, x, 3.75, 2.2);
    }
  }
  // dãy nhà nền phía sau cho có chiều sâu
  for (let x = -40; x <= 40; x += 6)
    b.box(mat(["#e8dccb", "#d8e4e0", "#ecd9c6"][Math.abs(x) % 3]!), 5.8, 9, 5, x, 4.5, -17);
  // xe buýt hai tầng đỗ phía gần (low-poly)
  b.box(mat(C.bus), 9, 2.0, 2.4, 6, 1.4, 9.5);
  b.box(mat(C.bus), 9, 1.6, 2.4, 6, 3.2, 9.5);
  b.box(shiny("#cfe9ee"), 8.6, 0.8, 2.42, 6, 1.9, 9.5);
  b.box(shiny("#cfe9ee"), 8.6, 0.8, 2.42, 6, 3.3, 9.5);
  for (const x of [2.6, 9.2])
    for (const z of [8.3, 10.7]) b.cyl(mat(C.tyre), 0.5, 0.3, x, 0.45, z, Math.PI / 2);
  const g = new THREE.Group();
  for (const m of b.build()) {
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  }
  return g;
}

/** Mũi tên vàng nhấp nhô phía trên nơi có nhiệm vụ đang mở. */
function QuestMarkers() {
  const done = useHandbook((s) => s.done);
  const days = useHandbook((s) => s.chapterDoneOn);
  const places = useMemo(() => {
    void done;
    void days;
    return [
      ...new Set(
        activeQuests()
          .filter((q) => q.place && !isDone(q.id))
          .map((q) => q.place!),
      ),
    ];
  }, [done, days]);
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.position.y = 3.2 + Math.sin(clock.elapsedTime * 3 + i) * 0.18;
      g.rotation.y = clock.elapsedTime * 1.5;
    });
  });
  return (
    <>
      {places.map((id, i) => {
        const s = placeSpot(id);
        return (
          <group
            key={id}
            position={[s.x, 3.2, s.z - 0.6]}
            ref={(el) => {
              refs.current[i] = el;
            }}
          >
            <mesh rotation-x={Math.PI} material={glow("#ffd34d", 0.8, 1.2)}>
              <coneGeometry args={[0.32, 0.6, 4]} />
            </mesh>
            <mesh position={[0, 0.55, 0]} material={glow("#ffd34d", 0.8, 1.2)}>
              <sphereGeometry args={[0.16, 10, 8]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

export function Street() {
  const street = useMemo(() => buildStreet(), []);
  return (
    <>
      <primitive object={street} />
      <QuestMarkers />
    </>
  );
}
