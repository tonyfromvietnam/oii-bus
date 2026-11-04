import * as THREE from "three";
import { mulberry32, type LandmarkId } from "@xom-oii/world";
import { signMaterial } from "./signs";
import { C, glow, toon } from "./materials";
import { StaticBuilder } from "./StaticBuilder";

/**
 * Địa danh London phong cách đồ chơi: khối đơn giản, màu pastel, hơi "mập" cho dễ thương.
 * Toạ độ cục bộ: đường ở y = GROUND, phía xa của bus là −z.
 */
export const GROUND = -4.6;

const G = GROUND;

function finish(b: StaticBuilder): THREE.Group {
  const g = new THREE.Group();
  for (const m of b.build()) g.add(m);
  return g;
}

function cone(
  b: StaticBuilder,
  color: THREE.Material,
  r: number,
  h: number,
  x: number,
  y: number,
  z: number,
  seg = 4,
  ry = Math.PI / 4,
) {
  b.add(color, new THREE.ConeGeometry(r, h, seg), x, y, z, 0, ry);
}

function bigBen(): THREE.Group {
  const b = new StaticBuilder();
  const stone = toon("#f2d49b");
  const z = -32;
  // nghị viện
  b.box(stone, 44, 12, 9, -26, G + 6, z - 2);
  for (let i = 0; i < 11; i++) {
    b.box(toon("#e6c27f"), 0.8, 14, 0.8, -46 + i * 4, G + 7, z + 2.6);
    cone(b, toon("#7d8fb3"), 0.8, 2.2, -46 + i * 4, G + 15.1, z + 2.6);
  }
  b.box(toon("#7d8fb3"), 44, 0.6, 9.4, -26, G + 12.3, z - 2);
  // tháp đồng hồ
  b.box(stone, 7, 38, 7, 0, G + 19, z);
  b.box(toon("#e6c27f"), 7.6, 1, 7.6, 0, G + 30, z);
  b.box(stone, 8, 8, 8, 0, G + 35, z);
  for (const [dx, dz, ry] of [
    [0, 4.02, 0],
    [4.02, 0, Math.PI / 2],
    [-4.02, 0, -Math.PI / 2],
  ] as const) {
    b.add(toon(C.white), new THREE.CircleGeometry(3, 24), dx, G + 35, z + dz, 0, ry);
    b.add(toon(C.gold), new THREE.RingGeometry(2.8, 3.2, 24), dx * 1.002, G + 35, z + dz * 1.002, 0, ry);
    b.box(toon(C.ink), 0.25, 2.2, 0.1, dx * 1.01, G + 35.8, z + dz * 1.01, 0, ry);
    b.box(
      toon(C.ink),
      1.6,
      0.25,
      0.1,
      dx * 1.01 + (ry ? 0 : 0.6),
      G + 35,
      z + dz * 1.01 + (ry ? 0.6 * Math.sign(dx) : 0),
      0,
      ry,
    );
  }
  b.box(stone, 6, 4, 6, 0, G + 41, z);
  cone(b, toon("#6b7fa8"), 4.6, 12, 0, G + 49, z);
  b.sphere(toon(C.gold), 0.6, 0, G + 55.4, z);
  return finish(b);
}

function londonEye(): { group: THREE.Group; wheel: THREE.Group } {
  const b = new StaticBuilder();
  const z = -48;
  const cy = G + 26;
  // chân chữ A
  for (const dz of [-6, 6]) {
    b.box(toon(C.white), 1, 30, 1, -6, G + 13, z + dz, 0, 0, -0.38);
    b.box(toon(C.white), 1, 30, 1, 6, G + 13, z + dz, 0, 0, 0.38);
  }
  b.box(toon(C.white), 30, 1.2, 1.2, 0, G + 0.6, z);
  const group = finish(b);
  const w = new StaticBuilder();
  w.add(toon(C.white), new THREE.TorusGeometry(22, 0.45, 8, 64), 0, 0, 0);
  w.add(toon(C.white), new THREE.TorusGeometry(20.5, 0.25, 6, 64), 0, 0, 0);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    w.box(toon("#dfe7f2"), 0.15, 22, 0.15, Math.cos(a) * 11, Math.sin(a) * 11, 0, 0, 0, a - Math.PI / 2);
    w.add(
      toon(C.sky),
      new THREE.CapsuleGeometry(0.9, 1.2, 4, 8),
      Math.cos(a) * 22.6,
      Math.sin(a) * 22.6,
      0,
      0,
      0,
      Math.PI / 2,
    );
  }
  w.sphere(toon(C.white), 1.4, 0, 0, 0);
  const wheel = finish(w);
  wheel.position.set(0, cy, z);
  group.add(wheel);
  return { group, wheel };
}

function towerBridge(): THREE.Group {
  const b = new StaticBuilder();
  const stone = toon("#f0dcb4");
  const blue = toon("#7fc4e8");
  // chỉ dựng phía xa (−z): phía gần sẽ chắn camera
  for (const tx of [-20, 20]) {
    for (const tz of [-9.5]) {
      b.box(stone, 5, 26, 5, tx, G + 13, tz);
      cone(b, toon("#6b7fa8"), 3.4, 6, tx, G + 29, tz);
      for (const c of [-2.6, 2.6]) {
        b.box(stone, 1.2, 4, 1.2, tx + c, G + 27, tz + c * 0.9);
        cone(b, toon("#6b7fa8"), 0.9, 2.4, tx + c, G + 30.2, tz + c * 0.9);
      }
      b.box(toon("#cfe9f7"), 3, 6, 0.2, tx, G + 18, tz + Math.sign(tz) * 2.6);
    }
    // xà vươn qua đường
    b.box(stone, 5, 3, 14, tx, G + 24, -3);
  }
  // hai lối đi trên cao (xe chạy bên dưới)
  b.box(blue, 35, 2, 2.2, 0, G + 23.5, -8);
  // dây cáp xanh dịu
  for (const side of [-1, 1]) {
    for (const tz of [-11.5]) {
      b.box(blue, 18, 0.6, 0.6, side * 30, G + 11, tz, 0, 0, side * 0.62);
      b.box(blue, 16, 0.6, 0.6, side * 10.5, G + 12, tz, 0, 0, -side * 0.8);
    }
  }
  return finish(b);
}

function stPauls(): THREE.Group {
  const b = new StaticBuilder();
  const cream = toon("#fbf1de");
  const z = -40;
  b.box(cream, 34, 14, 22, 0, G + 7, z);
  for (let i = 0; i < 8; i++) b.box(toon(C.white), 1.2, 10, 1.2, -9 + i * 2.6, G + 6, z + 11.6);
  b.box(cream, 22, 2, 2, 0, G + 12, z + 11.6);
  b.add(cream, new THREE.ConeGeometry(12, 4, 3), 0, G + 15.2, z + 11, 0, 0, 0, 1, 1, 0.3);
  b.cyl(cream, 9, 8, 0, G + 18, z);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.box(toon(C.white), 0.7, 7, 0.7, Math.cos(a) * 9.4, G + 18, z + Math.sin(a) * 9.4);
  }
  b.add(toon("#a9c7d8"), new THREE.SphereGeometry(9, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0, G + 22, z);
  b.cyl(cream, 1.6, 4, 0, G + 32.5, z);
  b.sphere(toon(C.gold), 0.9, 0, G + 35.2, z);
  for (const tx of [-14, 14]) {
    b.box(cream, 5, 20, 5, tx, G + 10, z + 8);
    cone(b, toon("#a9c7d8"), 2.6, 5, tx, G + 22.5, z + 8, 8, 0);
  }
  return finish(b);
}

function shard(): THREE.Group {
  const b = new StaticBuilder();
  const glass = toon("#b8dcff");
  const z = -60;
  b.add(glass, new THREE.ConeGeometry(12, 90, 4, 1, true), 0, G + 45, z, 0, Math.PI / 4);
  b.add(toon("#d9edff"), new THREE.ConeGeometry(11.6, 88, 4), 0.6, G + 44, z + 0.6, 0, Math.PI / 4 + 0.08);
  for (let i = 1; i < 9; i++) {
    const r = 12 * (1 - (i * 9.5) / 90);
    b.add(
      toon(C.white),
      new THREE.TorusGeometry(r * 1.0, 0.18, 3, 4),
      0,
      G + i * 9.5,
      z,
      Math.PI / 2,
      0,
      Math.PI / 4,
    );
  }
  return finish(b);
}

function buckingham(): THREE.Group {
  const b = new StaticBuilder();
  const stone = toon("#f5eedf");
  const z = -36;
  b.box(stone, 60, 16, 12, 0, G + 8, z);
  b.box(toon("#e9dfc8"), 62, 1.2, 12.6, 0, G + 16.4, z);
  for (let r = 0; r < 3; r++) {
    for (let i = 0; i < 14; i++) {
      b.box(glow("#fff1c4", 0.2, 0.9), 1.6, 2.4, 0.2, -26 + i * 4, G + 3.5 + r * 4.4, z + 6.05);
    }
  }
  for (let i = 0; i < 6; i++) b.box(toon(C.white), 1.4, 12, 1.4, -7.5 + i * 3, G + 7, z + 6.8);
  b.box(stone, 20, 2.4, 2, 0, G + 14, z + 6.8);
  b.cyl(toon(C.ink), 0.15, 8, 0, G + 21, z);
  b.box(toon(C.busRed), 3.4, 2, 0.1, 1.7, G + 24, z);
  b.box(toon("#3a5fcd"), 3.4, 0.7, 0.12, 1.7, G + 24, z);
  // cổng + vệ binh mũ lông gấu
  for (let i = 0; i < 9; i++) b.box(toon(C.ink), 0.2, 4, 0.2, -12 + i * 3, G + 2, z + 16);
  b.box(toon(C.gold), 26, 0.3, 0.3, 0, G + 4, z + 16);
  for (const gx of [-8, 8]) {
    b.box(toon(C.white), 1.6, 3, 1.6, gx, G + 1.5, z + 18);
    b.box(toon(C.ink), 0.5, 1.0, 0.4, gx, G + 0.5, z + 19.5);
    b.box(toon(C.busRed), 0.7, 1.0, 0.5, gx, G + 1.5, z + 19.5);
    b.sphere(toon(C.skin), 0.38, gx, G + 2.3, z + 19.5);
    b.add(toon(C.ink), new THREE.CapsuleGeometry(0.42, 0.7, 4, 10), gx, G + 3.0, z + 19.5);
  }
  return finish(b);
}

function gherkin(): THREE.Group {
  const b = new StaticBuilder();
  const z = -50;
  b.add(toon("#7fcfb8"), new THREE.SphereGeometry(1, 24, 16), 0, G + 26, z, 0, 0, 0, 11, 30, 11);
  for (let i = 0; i < 6; i++) {
    b.add(
      toon("#4f9d8b"),
      new THREE.TorusGeometry(1, 0.012, 4, 32),
      0,
      G + 26,
      z,
      Math.PI / 2 + 0.5,
      (i / 6) * Math.PI,
      0,
      11.1,
      11.1,
      30,
    );
  }
  b.sphere(toon("#5ab09a"), 2, 0, G + 55, z);
  return finish(b);
}

function chinatown(): THREE.Group {
  const b = new StaticBuilder();
  const red = toon("#ff5a5f");
  const green = toon("#4fbf8f");
  const z = -14;
  // cổng
  for (const px of [-6, 6]) b.cyl(red, 0.6, 9, px, G + 4.5, z);
  b.box(red, 15, 1.2, 1.2, 0, G + 8.4, z);
  b.box(green, 17, 0.8, 3, 0, G + 9.4, z, 0, 0, 0);
  b.box(green, 13, 0.8, 2.4, 0, G + 10.4, z);
  b.box(toon(C.gold), 4, 1.4, 0.3, 0, G + 7.2, z + 0.7);
  // đèn lồng đỏ
  for (let i = 0; i < 9; i++) {
    const lx = -16 + i * 4;
    b.add(
      glow("#ff6b6b", 0.4, 1.2),
      new THREE.SphereGeometry(0.55, 10, 8),
      lx,
      G + 6.2 - Math.sin((i / 8) * Math.PI) * 0.8,
      z - 3,
      0,
      0,
      0,
      1,
      1.25,
      1,
    );
  }
  b.box(toon(C.ink), 36, 0.05, 0.05, 0, G + 6.9, z - 3);
  // dãy quán
  const signs: [string, string, string][] = [
    ["Phở Oii", "#ffcf4a", "#b23a3a"],
    ["Tạp hoá Á Đông", "#ff5a5f", "#fff4e0"],
    ["Bánh mì 🥖", "#9de8c9", "#3b2f45"],
    ["Trà sữa", "#cdb8ff", "#3b2f45"],
  ];
  signs.forEach(([text, bg, fg], i) => {
    const sx = -21 + i * 14;
    b.box(toon([C.cream, C.peach, C.mint, C.pink][i]!), 12, 9, 8, sx, G + 4.5, z - 10);
    b.box(glow("#fff1c4", 0.3, 1), 7, 3, 0.2, sx, G + 2.2, z - 5.9);
    b.add(signMaterial(text, { bg, fg }), new THREE.PlaneGeometry(9, 1.8), sx, G + 5.6, z - 5.85);
  });
  return finish(b);
}

export interface LandmarkObject {
  group: THREE.Group;
  update?: (t: number) => void;
}

export function buildLandmark(id: LandmarkId): LandmarkObject {
  switch (id) {
    case "big-ben":
      return { group: bigBen() };
    case "london-eye": {
      const { group, wheel } = londonEye();
      return { group, update: (t) => (wheel.rotation.z = -t * 0.05) };
    }
    case "tower-bridge":
      return { group: towerBridge() };
    case "st-pauls":
      return { group: stPauls() };
    case "shard":
      return { group: shard() };
    case "buckingham":
      return { group: buckingham() };
    case "gherkin":
      return { group: gherkin() };
    case "chinatown":
      return { group: chinatown() };
  }
}

const HOUSE_COLORS = ["#ffc7d1", "#ffe3a3", "#bfe8d6", "#cfd8ff", "#ffd2b5", "#e3d1ff"];
const DOOR_COLORS = ["#ff6b6b", "#4f9df0", "#3fbf8f", "#ffb84d", "#b77cff"];

/**
 * Một "ô" cảnh dài `len` mét: dãy nhà pastel phía xa, cây, đèn, vạch đường. Lặp lại dọc tuyến.
 * `river` = đoạn qua sông (Tower Bridge): không có nhà, chỉ có nước.
 */
export function buildTile(len: number, seed: number, river: boolean): THREE.Group {
  const b = new StaticBuilder();
  const rnd = mulberry32(seed);
  for (let x = -len / 2; x < len / 2; x += 6) b.box(toon(C.roadLine), 3, 0.02, 0.3, x + 1.5, G + 0.02, 0);
  if (river) {
    for (const s of [-1, 1]) b.box(toon(C.water), len, 0.05, 60, 0, G - 0.05, s * 37);
    for (const s of [-1, 1]) b.box(toon(C.stone), len, 1.2, 0.4, 0, G + 0.6, s * 7.2); // lan can cầu
    return finishTile(b);
  }
  for (const s of [-1, 1]) {
    b.box(toon(C.pavement), len, 0.25, 4, 0, G + 0.12, s * 9);
    b.box(toon(C.grass), len, 0.1, 40, 0, G - 0.02, s * 31);
  }
  // nhà phía xa
  const w = len / 4;
  for (let i = 0; i < 4; i++) {
    const cx = -len / 2 + w * (i + 0.5);
    const h = 3.6 + rnd() * 1.6;
    const body = toon(HOUSE_COLORS[Math.floor(rnd() * HOUSE_COLORS.length)]!);
    b.box(body, w - 0.4, h, 6, cx, G + h / 2, -24);
    b.add(
      toon("#8a7fa8"),
      new THREE.ConeGeometry(w * 0.62, 2, 4, 1),
      cx,
      G + h + 1,
      -24,
      0,
      Math.PI / 4,
      0,
      1,
      1,
      0.55,
    );
    b.box(
      toon(DOOR_COLORS[Math.floor(rnd() * DOOR_COLORS.length)]!),
      1.1,
      1.9,
      0.2,
      cx - w / 4,
      G + 0.95,
      -20.95,
    );
    for (const wx of [cx + w / 6, cx - w / 6]) {
      b.box(toon(C.white), 1.3, 1.2, 0.2, wx, G + h - 1.1, -20.95);
      b.box(glow("#fff1c4", 0.25, 1), 1.0, 0.9, 0.24, wx, G + h - 1.1, -20.95);
    }
    b.box(toon(C.white), 1.4, 1.1, 0.24, cx + w / 4, G + 1.3, -20.95);
    b.box(toon(C.busRed), 0.5, 1.2, 0.5, cx + w / 4 + 0.6, G + h + 1.2, -24);
  }
  // cây tròn + đèn đường + bốt điện thoại thỉnh thoảng
  for (const tx of [-len / 3, len / 6]) {
    b.cyl(toon(C.woodDark), 0.3, 2, tx, G + 1, -12);
    b.sphere(toon(C.leaf), 1.7, tx, G + 3, -12);
    b.sphere(toon("#95dda0"), 1.1, tx + 0.9, G + 3.8, -11.7);
  }
  b.cyl(toon(C.ink), 0.12, 4, 0, G + 2, -8);
  b.sphere(glow("#ffe7a3", 0.35, 1.2), 0.4, 0, G + 4.2, -8);
  if (rnd() < 0.5) {
    b.box(toon(C.busRed), 1.4, 3, 1.4, len / 2 - 3, G + 1.5, -8.6);
    b.box(glow("#fff6d6", 0.2, 0.8), 1.0, 1.8, 1.45, len / 2 - 3, G + 1.6, -8.6);
  }
  return finishTile(b);
}

function finishTile(b: StaticBuilder) {
  const g = new THREE.Group();
  for (const m of b.build()) {
    m.matrixAutoUpdate = false;
    g.add(m);
  }
  return g;
}
