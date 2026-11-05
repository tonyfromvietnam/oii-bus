import * as THREE from "three";
import { mulberry32, type HouseStyle, type LandmarkId, type Terrain } from "@oii-bus/world";
import { signMaterial } from "./signs";
import { C, glow, mat, shiny, texMat } from "./materials";
import { StaticBuilder } from "./StaticBuilder";

/**
 * Địa danh UK phong cách đồ chơi nhưng đủ chi tiết để nhận ra: tỉ lệ, màu vật liệu, chi tiết đặc trưng.
 * Mỗi địa danh dựng tại gốc (tâm x = z = 0, đáy y = 0); BusWorld thu nhỏ và đặt ra xa.
 */
export const GROUND = -4.6;

type B = StaticBuilder;
const T = mat;

function finish(b: B): THREE.Group {
  const g = new THREE.Group();
  for (const m of b.build()) g.add(m);
  return g;
}

const pyramid = (b: B, m: THREE.Material, w: number, h: number, x: number, y: number, z: number) =>
  b.add(m, new THREE.ConeGeometry(w * 0.7071, h, 4), x, y + h / 2, z, 0, Math.PI / 4);

const cone = (b: B, m: THREE.Material, r: number, h: number, x: number, y: number, z: number, seg = 12) =>
  b.add(m, new THREE.ConeGeometry(r, h, seg), x, y + h / 2, z);

/** Hàng cửa sổ trên một mặt tiền hướng +z. */
function windows(
  b: B,
  m: THREE.Material,
  x0: number,
  x1: number,
  y: number,
  z: number,
  w: number,
  h: number,
  step: number,
) {
  for (let x = x0; x <= x1 + 1e-6; x += step) b.box(m, w, h, 0.15, x, y, z);
}

// ---------------------------------------------------------------- London
function bigBen(): THREE.Group {
  const b = new StaticBuilder();
  const stone = T("#e6c88d");
  const stoneDark = T("#cfae6f");
  const slate = T("#5f7f86");
  const gold = T("#f2c14e");
  const win = T("#7b8fa3");
  // Cung điện Westminster: khối gothic dài, nhiều chóp nhọn
  b.box(stone, 40, 14, 12, -24, 7, -1);
  b.box(slate, 40.4, 2, 12.4, -24, 15, -1);
  for (let x = -43; x <= -5; x += 3.2) {
    b.box(stoneDark, 0.7, 16, 0.7, x, 8, 5.2);
    cone(b, slate, 0.55, 2.4, x, 16, 5.2, 4);
  }
  for (const y of [4, 9]) windows(b, win, -41.4, -6.6, y, 5.1, 1.2, 2.6, 3.2);
  // tháp Victoria ở đầu kia
  b.box(stone, 9, 26, 9, -46, 13, -1);
  for (const dx of [-4, 4]) for (const dz of [-4, 4]) cone(b, slate, 0.7, 3, -46 + dx, 26, -1 + dz, 4);
  windows(b, win, -48.5, -43.5, 20, 3.6, 1.2, 4, 2.5);
  // tháp Elizabeth (Big Ben)
  b.box(stone, 7, 38, 7, 0, 19, 0);
  for (const dx of [-2.4, -0.8, 0.8, 2.4]) b.box(stoneDark, 0.35, 34, 0.3, dx, 19, 3.6); // gân dọc
  for (let y = 6; y < 36; y += 6) b.box(stoneDark, 7.4, 0.4, 7.4, 0, y, 0);
  b.box(stone, 8.6, 8.6, 8.6, 0, 42.3, 0);
  for (const [dx, dz, ry] of [
    [0, 4.32, 0],
    [4.32, 0, Math.PI / 2],
    [-4.32, 0, -Math.PI / 2],
    [0, -4.32, Math.PI],
  ] as const) {
    b.add(gold, new THREE.CircleGeometry(3.4, 32), dx * 1.0, 42.3, dz * 1.0, 0, ry);
    b.add(T("#fffaf0"), new THREE.CircleGeometry(3.0, 32), dx * 1.004, 42.3, dz * 1.004, 0, ry);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const lx = Math.cos(a) * 2.6;
      const ly = Math.sin(a) * 2.6;
      b.box(
        T(C.ink),
        0.15,
        0.4,
        0.05,
        dx * 1.008 + (ry === 0 || ry === Math.PI ? lx : 0),
        42.3 + ly,
        dz * 1.008 + (ry === 0 || ry === Math.PI ? 0 : lx),
        0,
        ry,
        -a,
      );
    }
    b.box(T(C.ink), 0.22, 2.2, 0.06, dx * 1.012, 43.2, dz * 1.012, 0, ry, 0);
    b.box(
      T(C.ink),
      0.22,
      1.6,
      0.06,
      dx * 1.012 + (ry === 0 ? 0.55 : ry === Math.PI ? -0.55 : 0),
      42.3,
      dz * 1.012 + (ry === Math.PI / 2 ? -0.55 : ry === -Math.PI / 2 ? 0.55 : 0),
      0,
      ry,
      -Math.PI / 2.6,
    );
  }
  // tầng chuông + mái chóp xanh xám
  b.box(stoneDark, 7.6, 1, 7.6, 0, 47.1, 0);
  b.box(stone, 6.6, 5, 6.6, 0, 50, 0);
  for (const dx of [-2, 0, 2]) b.box(T("#6b5d4a"), 1.2, 3, 6.7, dx, 50, 0);
  pyramid(b, slate, 7, 13, 0, 52.5, 0);
  for (const dx of [-3.2, 3.2]) for (const dz of [-3.2, 3.2]) cone(b, gold, 0.4, 3.5, dx, 52.5, dz, 4);
  b.box(gold, 0.3, 2, 0.3, 0, 66, 0);
  b.box(gold, 1.2, 0.3, 0.3, 0, 66.4, 0);
  return finish(b);
}

function londonEye(): { group: THREE.Group; wheel: THREE.Group } {
  const b = new StaticBuilder();
  const white = T("#f4f7f8");
  // khung chữ A nghiêng (chống từ một phía, như thật)
  for (const dx of [-7, 7]) b.box(white, 1.2, 33, 1.2, dx * 0.5, 15, 9, -0.45, 0, dx > 0 ? 0.22 : -0.22);
  b.box(white, 16, 1.2, 1.2, 0, 0.6, 16);
  b.box(T("#d9e4ea"), 30, 0.8, 8, 0, 0.4, 8); // bến lên
  const group = finish(b);
  const w = new StaticBuilder();
  w.add(white, new THREE.TorusGeometry(24, 0.5, 8, 72), 0, 0, 0);
  w.add(white, new THREE.TorusGeometry(22.8, 0.25, 6, 72), 0, 0, 0.8);
  w.add(white, new THREE.TorusGeometry(22.8, 0.25, 6, 72), 0, 0, -0.8);
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    w.box(T("#dde6ec"), 0.08, 24, 0.08, Math.cos(a) * 12, Math.sin(a) * 12, 0, 0, 0, a - Math.PI / 2);
    w.add(
      T("#bfe3ef"),
      new THREE.CapsuleGeometry(0.9, 1.6, 4, 10),
      Math.cos(a) * 25.4,
      Math.sin(a) * 25.4,
      0,
      0,
      0,
      Math.PI / 2,
    );
  }
  w.cyl(white, 1.6, 3, 0, 0, 0, Math.PI / 2);
  const wheel = finish(w);
  wheel.position.set(0, 27, 0);
  group.add(wheel);
  return { group, wheel };
}

function towerBridge(): THREE.Group {
  const b = new StaticBuilder();
  const stone = T("#e7dbc0");
  const stoneDark = T("#cbbd9c");
  const slate = T("#55707a");
  const blue = T("#8fc2df");
  const white = T("#f6f6f2");
  // nhìn ngang: hai tháp, hai lối đi trên cao, mặt cầu giữa, dây xích ra hai bờ
  for (const tx of [-18, 18]) {
    b.box(stone, 8, 30, 8, tx, 15, 0);
    b.box(T("#8fb1c4"), 4, 7, 8.2, tx, 4, 0); // vòm cổng
    for (const y of [14, 20]) for (const dx of [-2, 2]) b.box(T("#6e7f8c"), 1.2, 3, 8.2, tx + dx, y, 0);
    for (const dx of [-3.4, 3.4]) {
      for (const dz of [-3.4, 3.4]) {
        b.box(stoneDark, 1.8, 6, 1.8, tx + dx, 32, dz);
        pyramid(b, slate, 2, 4, tx + dx, 35, dz);
      }
    }
    b.box(stone, 6, 3, 6, tx, 31.5, 0);
    pyramid(b, slate, 6.4, 7, tx, 33, 0);
    b.box(T(C.gold), 0.3, 1.5, 0.3, tx, 40.5, 0);
  }
  for (const z of [-2, 2]) {
    b.box(blue, 28, 2.6, 1.6, 0, 27, z);
    for (let x = -13; x <= 13; x += 2.6) b.box(white, 0.2, 2.4, 1.7, x, 27, z);
  }
  b.box(blue, 28, 1, 8, 0, 9, 0);
  b.box(white, 28, 0.4, 8.2, 0, 9.7, 0);
  for (const s of [-1, 1]) {
    b.box(blue, 26, 1, 8, s * 35, 9, 0);
    // dây xích treo cong (3 đoạn) từ đỉnh tháp xuống bờ
    const pts = [
      [s * 22, 24],
      [s * 30, 15],
      [s * 40, 11],
      [s * 48, 10],
    ] as const;
    for (let i = 0; i < 3; i++) {
      const [x0, y0] = pts[i]!;
      const [x1, y1] = pts[i + 1]!;
      const len = Math.hypot(x1 - x0, y1 - y0);
      for (const z of [-3.6, 3.6])
        b.box(blue, len, 0.9, 0.9, (x0 + x1) / 2, (y0 + y1) / 2, z, 0, 0, Math.atan2(y1 - y0, x1 - x0));
    }
    for (let x = 24; x < 46; x += 3) b.box(white, 0.12, 4, 0.12, s * x, 11.5, 3.6);
  }
  for (const tx of [-18, 18]) b.box(stoneDark, 10, 6, 10, tx, -1, 0); // trụ dưới nước
  return finish(b);
}

function buckingham(): THREE.Group {
  const b = new StaticBuilder();
  const stone = T("#efe8d8");
  const win = T("#8b9db0");
  const gold = T(C.gold);
  b.box(stone, 64, 14, 12, 0, 7, -6);
  b.box(T("#e2d8c2"), 64.6, 1, 12.6, 0, 14.5, -6);
  for (const y of [3, 7.2, 11]) windows(b, win, -29.5, 29.5, y, 0.05, 1.3, 2.2, 3.1);
  // portico giữa
  b.box(stone, 20, 14.5, 2, 0, 7.25, 1);
  for (let i = 0; i < 6; i++) b.cyl(T(C.white), 0.55, 10, -6.25 + i * 2.5, 8, 2.3);
  b.add(stone, new THREE.ConeGeometry(10.5, 2.6, 3), 0, 15.4, 1.6, 0, 0, 0, 1, 1, 0.25);
  b.box(T("#c9b99a"), 8, 0.4, 1.4, 0, 6.2, 2.6); // ban công
  // cờ Hoàng gia
  b.cyl(T(C.ink), 0.12, 7, 0, 18.4, -2);
  b.box(T("#d8323f"), 3.6, 2.2, 0.12, 1.8, 21, -2);
  b.box(T("#f2c14e"), 1.8, 1.1, 0.13, 0.9, 21.55, -2);
  b.box(T("#3a5fcd"), 1.8, 1.1, 0.13, 2.7, 20.45, -2);
  // Đài tưởng niệm Victoria (trắng + thiên thần vàng)
  const mz = 22;
  b.cyl(T(C.white), 7, 1.2, 0, 0.6, mz);
  b.cyl(T(C.white), 4.5, 2.5, 0, 2.4, mz);
  b.box(T(C.white), 4, 6, 4, 0, 6.6, mz);
  b.cyl(T(C.white), 1.4, 3, 0, 11, mz);
  b.sphere(gold, 0.9, 0, 13.4, mz);
  for (const s of [-1, 1]) b.add(gold, new THREE.ConeGeometry(0.6, 3.2, 4), s * 1.2, 14.2, mz, 0, 0, s * 1.0);
  b.add(gold, new THREE.CapsuleGeometry(0.45, 1.2, 4, 8), 0, 14.1, mz);
  // cổng sắt đen viền vàng + vệ binh
  for (let x = -24; x <= 24; x += 1.5) b.box(T(C.ink), 0.15, 3.6, 0.15, x, 1.8, 10);
  b.box(gold, 48, 0.25, 0.25, 0, 3.4, 10);
  for (const gx of [-10, 10]) {
    b.box(T("#f4efe4"), 1.8, 3.2, 1.8, gx, 1.6, 12.5);
    pyramid(b, T("#d8323f"), 2.2, 1, gx, 3.2, 12.5);
    b.box(T(C.ink), 0.6, 1.0, 0.45, gx, 0.5, 14);
    b.box(T("#d8323f"), 0.8, 1.1, 0.55, gx, 1.55, 14);
    b.sphere(T(C.skin), 0.36, gx, 2.35, 14);
    b.add(T(C.ink), new THREE.CapsuleGeometry(0.42, 0.7, 4, 10), gx, 3.05, 14);
  }
  return finish(b);
}

// ---------------------------------------------------------------- Khắp UK
function brightonPier(): THREE.Group {
  const b = new StaticBuilder();
  const white = T("#fbfbf7");
  const rnd = mulberry32(3);
  // cầu tàu dài trên cột, vươn ra biển (dọc trục x)
  b.box(T("#d9cbb3"), 70, 0.8, 8, 0, 4, 0);
  for (let x = -34; x <= 34; x += 3) for (const z of [-3.6, 3.6]) b.cyl(T("#a9967a"), 0.25, 4, x, 2, z);
  for (const s of [-1, 1]) b.box(white, 70, 0.8, 0.15, 0, 4.8, s * 4);
  // nhà mái vòm trắng ở đầu cầu
  for (const [x, w] of [
    [-26, 10],
    [-12, 7],
  ] as const) {
    b.box(white, w, 4, 6, x, 6.4, 0);
    b.add(T("#8fd0cf"), new THREE.SphereGeometry(w * 0.32, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), x, 8.4, 0);
    cone(b, T(C.gold), 0.3, 1.6, x, 8.4 + w * 0.32, 0, 6);
  }
  b.add(
    signMaterial("BRIGHTON PIER", { bg: "#1f2d4d", fg: "#fde3a0" }),
    new THREE.PlaneGeometry(8, 1.4),
    -26,
    7.2,
    3.02,
  );
  // cầu trượt xoắn sọc + vòng quay nhỏ + đèn màu
  for (let i = 0; i < 8; i++)
    b.cyl(T(i % 2 ? "#ffffff" : "#e85d6a"), 1.4 - i * 0.12, 1.4, 14, 5.1 + i * 1.4, 0);
  cone(b, T("#e85d6a"), 1.2, 2, 14, 16.3, 0);
  b.add(white, new THREE.TorusGeometry(6, 0.3, 6, 36), 26, 12, 0);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.box(
      T(["#a8d3d9", "#fde3a0", "#f6b3c2"][i % 3]!),
      1,
      1,
      1,
      26 + Math.cos(a) * 6,
      12 + Math.sin(a) * 6,
      0,
    );
  }
  b.box(white, 0.6, 7, 0.6, 24, 7.6, 1.5, 0, 0, -0.3);
  b.box(white, 0.6, 7, 0.6, 28, 7.6, 1.5, 0, 0, 0.3);
  for (let x = -34; x <= 34; x += 2)
    b.sphere(glow(["#fde3a0", "#a8d3d9", "#f6b3c2"][Math.floor(rnd() * 3)]!, 0.4, 1.3), 0.18, x, 5.8, 4);
  return finish(b);
}

function stonehenge(): THREE.Group {
  const b = new StaticBuilder();
  const rnd = mulberry32(12);
  const stone = () => T(["#b7b4a7", "#a9a698", "#c3c0b3"][Math.floor(rnd() * 3)]!);
  b.add(T("#9fd49a"), new THREE.CylinderGeometry(26, 30, 1.2, 32), 0, 0.2, 0);
  // vòng sarsen ngoài: 30 trụ, xà đỡ phía trên (thiếu vài đoạn như thật)
  const R = 15;
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    if (i === 8 || i === 9 || i === 21) continue;
    const x = Math.cos(a) * R;
    const z = Math.sin(a) * R;
    b.box(
      stone(),
      2.1,
      4.6 + rnd() * 0.4,
      1.2,
      x,
      3.1,
      z,
      (rnd() - 0.5) * 0.05,
      -a + Math.PI / 2,
      (rnd() - 0.5) * 0.05,
    );
    if (i % 4 !== 3) {
      const a2 = a + Math.PI / 30;
      b.box(stone(), 3.2, 0.8, 1.1, Math.cos(a2) * R, 5.8, Math.sin(a2) * R, 0, -a2 + Math.PI / 2, 0);
    }
  }
  // móng ngựa trilithon bên trong
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * 0.15 + (i / 4) * Math.PI * 0.7 + Math.PI;
    const r = 8;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const h = i === 2 ? 7.4 : 6.2;
    for (const off of [-1.3, 1.3]) {
      b.box(
        stone(),
        1.9,
        h,
        1.4,
        x + Math.cos(a + Math.PI / 2) * off,
        h / 2 + 0.6,
        z + Math.sin(a + Math.PI / 2) * off,
        0,
        -a + Math.PI / 2,
      );
    }
    b.box(stone(), 4.8, 1, 1.4, x, h + 1.1, z, 0, -a + Math.PI / 2);
  }
  // đá đổ nằm + đá gót ngoài vòng
  b.box(stone(), 4.4, 1.2, 1.8, 6, 1.2, 9, 0, 0.8);
  b.box(stone(), 4, 1.1, 1.6, -9, 1.2, 5, 0, -0.4);
  b.box(stone(), 2.2, 5, 1.6, 22, 2.8, 8, 0.12, 0.4, 0.1);
  // cừu
  for (let i = 0; i < 6; i++) {
    const x = -24 + rnd() * 48;
    const z = 18 + rnd() * 6;
    b.add(T(C.white), new THREE.SphereGeometry(1, 10, 8), x, 1.5, z, 0, 0, 0, 1.1, 0.75, 0.75);
    b.sphere(T(C.ink), 0.38, x + 1.1, 1.8, z);
  }
  return finish(b);
}

function bath(): THREE.Group {
  const b = new StaticBuilder();
  const stone = T("#e9cf98");
  const stoneDark = T("#d6b77a");
  const win = T("#8a98a6");
  const slate = T("#7d8391");
  // Royal Crescent: dãy nhà Georgian uốn cong, cột Ionic khổng lồ
  const R = 36;
  const N = 26;
  for (let i = 0; i < N; i++) {
    const a = Math.PI * (0.18 + (i / (N - 1)) * 0.64);
    const x = -Math.cos(a) * R;
    const z = -Math.sin(a) * R + R * 0.65;
    const ry = Math.PI / 2 - a;
    b.box(stone, 4.4, 14, 7, x, 7, z - 3.5 * Math.sin(a), 0, -ry);
    b.box(slate, 4.6, 2, 6, x, 15, z - 3.5 * Math.sin(a), 0, -ry);
    const fx = x + Math.cos(a) * -0.1;
    const fz = z + 0.2;
    b.add(T(C.white), new THREE.CylinderGeometry(0.4, 0.4, 7.5, 10), fx - Math.sin(a) * 2, 8.5, fz, 0, 0, 0);
    for (const y of [2.5, 7, 11.3]) b.box(win, 1.2, y === 2.5 ? 2 : 2.4, 0.2, fx, y, fz, 0, -ry);
    if (i % 2 === 0) b.box(stoneDark, 0.8, 1.6, 0.8, x, 16.6, z - 3.5 * Math.sin(a));
  }
  // bãi cỏ trước Crescent + bể La Mã xanh ngọc phía trước
  b.add(T("#a6dba0"), new THREE.CircleGeometry(30, 32, 0, Math.PI), 0, 0.05, 8, -Math.PI / 2);
  b.box(T("#7fcfc6"), 16, 0.3, 7, 0, 0.3, 26);
  for (let x = -8; x <= 8; x += 2) b.cyl(stone, 0.35, 3.4, x, 1.7, 22.6);
  b.box(stoneDark, 17, 0.6, 1, 0, 3.6, 22.6);
  return finish(b);
}

function oxford(): THREE.Group {
  const b = new StaticBuilder();
  const stone = T("#e6cf9e");
  const stoneDark = T("#d1b57c");
  const lead = T("#8b98a3");
  // Radcliffe Camera: trống tròn đá vàng, cột đôi, mái vòm chì có gân, đèn lồng
  b.add(stoneDark, new THREE.CylinderGeometry(10, 10.4, 6, 16), 0, 3, 0);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.box(T("#7a8796"), 1.4, 3, 0.3, Math.cos(a) * 10.35, 3.2, Math.sin(a) * 10.35, 0, -a + Math.PI / 2);
  }
  b.add(stone, new THREE.CylinderGeometry(9, 9, 8, 24), 0, 10, 0);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    for (const d of [-0.12, 0.12])
      b.cyl(T("#f2e3c0"), 0.32, 7.6, Math.cos(a + d) * 9.3, 10, Math.sin(a + d) * 9.3);
  }
  b.add(stoneDark, new THREE.CylinderGeometry(9.6, 9.6, 1, 24), 0, 14.4, 0);
  b.add(stone, new THREE.CylinderGeometry(7.6, 7.8, 2.4, 24), 0, 16, 0);
  b.add(lead, new THREE.SphereGeometry(7.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), 0, 17, 0);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.box(
      T("#a7b2bc"),
      0.3,
      5.4,
      0.3,
      Math.cos(a) * 5.6,
      21.4,
      Math.sin(a) * 5.6,
      Math.sin(a) * 0.7,
      0,
      -Math.cos(a) * 0.7,
    );
  }
  b.cyl(stone, 1.4, 3, 0, 25.5, 0);
  b.add(lead, new THREE.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0, 27, 0);
  b.sphere(T(C.gold), 0.4, 0, 28.8, 0);
  // tháp đôi All Souls phía sau
  for (const tx of [-20, -14]) {
    b.box(stone, 3, 20, 3, tx, 10, -14);
    for (const dx of [-1.3, 1.3])
      for (const dz of [-1.3, 1.3]) cone(b, stoneDark, 0.35, 3, tx + dx, 20, -14 + dz, 4);
    pyramid(b, stoneDark, 2.4, 5, tx, 20, -14);
  }
  b.box(stone, 30, 9, 6, 6, 4.5, -16);
  windows(b, T("#7a8796"), -6, 18, 5, -12.9, 1.4, 3.6, 3);
  return finish(b);
}

function birmingham(): THREE.Group {
  const b = new StaticBuilder();
  // Selfridges Bullring: khối cong xanh đậm phủ đầy đĩa bạc
  b.add(T("#2d4f9e"), new THREE.SphereGeometry(1, 32, 20), 0, 9, 0, 0, 0, 0, 22, 10, 11);
  const disc = new THREE.CylinderGeometry(0.62, 0.62, 0.12, 12);
  const silver = T("#e8eef5");
  const n = 520;
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * 2.399963;
    const nx = Math.cos(phi) * r;
    const nz = Math.sin(phi) * r;
    if (y < -0.75) continue;
    const px = nx * 22.1;
    const py = 9 + y * 10.1;
    const pz = nz * 11.1;
    const normal = new THREE.Vector3(nx / 22, y / 10, nz / 11).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    const e = new THREE.Euler().setFromQuaternion(q);
    b.add(silver, disc.clone(), px, py, pz, e.x, e.y, e.z);
  }
  disc.dispose();
  b.box(T("#2d4f9e"), 30, 2, 18, 0, 0.5, 0);
  // nhà thờ St Martin + chóp nhọn đá đỏ
  const sand = T("#c98a6b");
  b.box(sand, 10, 9, 7, 28, 4.5, -4);
  b.box(sand, 4, 15, 4, 32, 7.5, -4);
  cone(b, T("#b97a5d"), 2.4, 12, 32, 15, -4, 8);
  // tượng bò đồng
  const bronze = T("#9a6b46");
  b.add(bronze, new THREE.CapsuleGeometry(1.1, 2.4, 4, 10), -26, 2.6, 8, 0, 0, Math.PI / 2);
  b.sphere(bronze, 0.9, -24.2, 3.2, 8);
  for (const s of [-1, 1])
    b.add(bronze, new THREE.ConeGeometry(0.2, 1, 6), -23.8, 4, 8 + s * 0.5, 0, 0, -0.9);
  for (const dx of [-1, 1]) for (const dz of [-0.5, 0.5]) b.cyl(bronze, 0.25, 1.4, -26 + dx, 0.7, 8 + dz);
  return finish(b);
}

function oldTrafford(): THREE.Group {
  const b = new StaticBuilder();
  const seat = T("#d8343f");
  const seatDark = T("#b72a35");
  const roof = T("#dfe3e8");
  const brick = T("#b5523f");
  const W = 46;
  const D = 32;
  // sân cỏ sọc + vạch trắng
  for (let i = 0; i < 10; i++)
    b.box(T(i % 2 ? "#5fbf6a" : "#6fcc78"), W / 10, 0.2, D, -W / 2 + W / 20 + (i * W) / 10, 0.3, 0);
  b.box(T(C.white), W - 4, 0.22, 0.25, 0, 0.42, 0, 0, Math.PI / 2, 0);
  b.add(T(C.white), new THREE.RingGeometry(3.6, 4, 24), 0, 0.43, 0, -Math.PI / 2);
  for (const s of [-1, 1]) {
    b.box(T(C.white), 0.25, 0.22, D - 4, s * (W / 2 - 2), 0.42, 0);
    b.box(T(C.white), 6, 0.22, 0.25, s * (W / 2 - 5), 0.42, -6);
    b.box(T(C.white), 6, 0.22, 0.25, s * (W / 2 - 5), 0.42, 6);
    b.box(T(C.white), 0.25, 0.22, 12, s * (W / 2 - 8), 0.42, 0);
    b.box(T(C.white), 0.3, 2.4, 7, s * (W / 2 - 1.6), 1.4, 0);
  }
  b.box(T(C.white), W - 4, 0.22, 0.25, 0, 0.42, D / 2 - 2);
  b.box(T(C.white), W - 4, 0.22, 0.25, 0, 0.42, -D / 2 + 2);
  // 3 khán đài (phía gần bỏ trống để nhìn vào trong) — ghế đỏ bậc thang, mái treo xám
  const stand = (cx: number, cz: number, len: number, ry: number) => {
    for (let r = 0; r < 7; r++) {
      const m = r % 2 ? seat : seatDark;
      const back = 1.6 + r * 1.5;
      b.box(m, len, 1.2, 1.6, cx + Math.sin(ry) * back, 1 + r * 1.3, cz + Math.cos(ry) * back, 0, ry);
    }
    b.box(brick, len + 1, 12, 2, cx + Math.sin(ry) * 13, 6, cz + Math.cos(ry) * 13, 0, ry);
    b.box(roof, len + 2, 0.5, 12, cx + Math.sin(ry) * 7.5, 13.5, cz + Math.cos(ry) * 7.5, 0, ry);
    for (let t = -len / 2; t <= len / 2; t += 6) {
      b.box(
        T("#ffffff"),
        0.3,
        2.6,
        0.3,
        cx + Math.cos(ry) * t + Math.sin(ry) * 13,
        14.6,
        cz - Math.sin(ry) * t + Math.cos(ry) * 13,
        0,
        ry,
      );
    }
  };
  stand(0, -D / 2, W + 4, Math.PI); // khán đài xa
  stand(-W / 2, 0, D + 4, -Math.PI / 2);
  stand(W / 2, 0, D + 4, Math.PI / 2);
  b.box(seatDark, W, 1.2, 1.2, 0, 0.6, D / 2 + 0.8); // hàng rào thấp phía gần
  return finish(b);
}

function liverpool(): THREE.Group {
  const b = new StaticBuilder();
  const stone = T("#ecebe4");
  const stoneDark = T("#d5d3c9");
  const copper = T("#7fc2a5");
  const win = T("#8b9db0");
  // Royal Liver Building: khối chính + 2 tháp đồng hồ + chim Liver đồng xanh
  b.box(stone, 30, 26, 18, 0, 13, 0);
  for (let y = 3; y < 25; y += 3) windows(b, win, -13, 13, y, 9.05, 1, 1.8, 2);
  for (const tx of [-9, 9]) {
    b.box(stone, 8, 8, 8, tx, 30, 0);
    for (const [dx, dz, ry] of [
      [0, 4.05, 0],
      [4.05, 0, Math.PI / 2],
      [-4.05, 0, -Math.PI / 2],
    ] as const) {
      b.add(T("#fffaf0"), new THREE.CircleGeometry(3, 28), tx + dx, 30, dz, 0, ry);
      b.box(T(C.ink), 0.2, 2.2, 0.05, tx + dx * 1.01, 30.6, dz * 1.01, 0, ry);
      b.box(T(C.ink), 0.2, 1.6, 0.05, tx + dx * 1.01, 30, dz * 1.01 + 0.01, 0, ry, 1.2);
    }
    b.add(stoneDark, new THREE.CylinderGeometry(3.4, 3.8, 5, 12), tx, 36.5, 0);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.cyl(T(C.white), 0.3, 4.6, tx + Math.cos(a) * 3.6, 36.5, Math.sin(a) * 3.6);
    }
    b.add(copper, new THREE.SphereGeometry(3.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), tx, 39, 0);
    b.cyl(copper, 0.4, 2, tx, 43, 0);
    // chim Liver
    b.add(copper, new THREE.CapsuleGeometry(0.8, 1.4, 4, 8), tx, 45.2, 0);
    b.sphere(copper, 0.6, tx, 46.6, 0.5);
    for (const s of [-1, 1])
      b.add(copper, new THREE.ConeGeometry(0.5, 3, 4), tx + s * 1.4, 46.2, 0, 0, 0, s * 1.2);
  }
  // Port of Liverpool Building (mái vòm xanh) bên cạnh
  b.box(stone, 20, 18, 16, 30, 9, -2);
  b.add(copper, new THREE.SphereGeometry(5, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), 30, 18, -2);
  for (const dx of [-8, 8])
    b.add(copper, new THREE.SphereGeometry(1.6, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), 30 + dx, 18, 5);
  return finish(b);
}

function angelNorth(): THREE.Group {
  const b = new StaticBuilder();
  const rust = T("#a35b3a");
  const rustDark = T("#8a4a2f");
  b.add(
    T("#9fd49a"),
    new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    0,
    0,
    0,
    0,
    0,
    0,
    22,
    4,
    16,
  );
  // thân thon dần, chân, đầu nhỏ
  b.box(rust, 2.6, 15, 1.8, 0, 11.5, 0);
  for (const s of [-1, 1]) b.box(rust, 1.2, 6, 1.4, s * 0.8, 5.5, 0, 0, 0, s * 0.03);
  b.box(rust, 2.1, 2.4, 1.6, 0, 20.2, 0);
  // đôi cánh dang rộng, hơi chúi về trước, có gân dọc
  for (const s of [-1, 1]) {
    b.box(rust, 26, 2.6, 0.5, s * 14, 16.5, 0.6, 0.08, -s * 0.06, 0);
    for (let x = 2; x <= 26; x += 2.2) b.box(rustDark, 0.35, 2.7, 0.9, s * x, 16.5, 0.6 + x * 0.012);
  }
  for (const y of [9, 12, 15]) b.box(rustDark, 2.8, 0.3, 2, 0, y, 0);
  return finish(b);
}

function edinburgh(): THREE.Group {
  const b = new StaticBuilder();
  const rnd = mulberry32(31);
  const rock = () => T(["#6f6a66", "#7d7772", "#625e5a"][Math.floor(rnd() * 3)]!);
  const stone = T("#b6aea2");
  const stoneDark = T("#9a9286");
  // núi đá núi lửa
  for (let i = 0; i < 9; i++) {
    const x = -22 + i * 5.5;
    b.add(
      rock(),
      new THREE.IcosahedronGeometry(1, 0),
      x,
      4 + rnd() * 2,
      rnd() * 4 - 2,
      rnd(),
      rnd(),
      rnd(),
      6 + rnd() * 2,
      7 + rnd() * 4,
      7,
    );
  }
  b.add(
    T("#8ccf8a"),
    new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    0,
    0,
    4,
    0,
    0,
    0,
    32,
    3,
    12,
  );
  // tường thành có răng cưa
  const wall = (x: number, z: number, w: number, h: number, y0: number) => {
    b.box(stone, w, h, 2, x, y0 + h / 2, z);
    for (let cx = x - w / 2 + 0.6; cx < x + w / 2; cx += 1.6) b.box(stone, 0.9, 0.9, 2, cx, y0 + h + 0.45, z);
  };
  wall(-4, 4, 34, 4, 10);
  // pháo đài Half Moon (cong)
  b.add(stone, new THREE.CylinderGeometry(6, 6.4, 7, 20, 1, false, 0, Math.PI), 13, 13.5, 2);
  for (let i = 0; i < 9; i++) {
    const a = (i / 8) * Math.PI;
    b.box(stone, 0.9, 0.9, 0.9, 13 + Math.sin(a) * 6, 17.4, 2 + Math.cos(a) * 6);
  }
  // cung điện, đại sảnh, nhà thờ nhỏ
  b.box(stone, 12, 9, 8, 0, 18.5, -2);
  windows(b, T("#7a8796"), -4.5, 4.5, 19, 2.05, 1, 2, 1.8);
  b.box(T("#6d7783"), 12.4, 1, 8.4, 0, 23.4, -2);
  b.box(stoneDark, 10, 7, 7, -11, 17.5, -3);
  pyramid(b, T("#6d7783"), 10, 3, -11, 21, -3);
  b.box(stone, 3, 13, 3, 6, 20.5, -4);
  for (let cx = 4.9; cx <= 7.1; cx += 1.1) b.box(stone, 0.6, 0.8, 3, cx, 27.4, -4);
  // cờ Saltire
  b.cyl(T(C.ink), 0.1, 5, 6, 30, -4);
  b.box(T("#2f5fb3"), 3.2, 2, 0.1, 7.6, 31.6, -4);
  b.box(T(C.white), 3.7, 0.3, 0.12, 7.6, 31.6, -4, 0, 0, 0.56);
  b.box(T(C.white), 3.7, 0.3, 0.12, 7.6, 31.6, -4, 0, 0, -0.56);
  return finish(b);
}

// ------------------------------------------------------- thêm địa danh ---
function stPauls(): THREE.Group {
  const b = new StaticBuilder();
  const cream = T("#efe6d2");
  const white = T("#fbf8f0");
  const lead = T("#8f9ea8");
  b.box(cream, 40, 14, 18, 0, 7, 0);
  windows(b, T("#8b9db0"), -17, 17, 5, 9.05, 1.2, 3, 3.4);
  // mặt tiền 2 tầng cột + trán tường
  for (const row of [0, 1])
    for (let i = 0; i < 8; i++) b.cyl(white, 0.5, 6, -8.4 + i * 2.4, 3 + row * 6.2, 10);
  b.box(cream, 20, 1, 2, 0, 6.3, 10);
  b.box(cream, 20, 1, 2, 0, 12.5, 10);
  b.add(cream, new THREE.ConeGeometry(11, 3.4, 3), 0, 14.7, 10, 0, 0, 0, 1, 1, 0.2);
  // hai tháp chuông phía trước
  for (const tx of [-14, 14]) {
    b.box(cream, 6, 22, 6, tx, 11, 6);
    b.add(cream, new THREE.CylinderGeometry(2.4, 2.8, 5, 12), tx, 24.5, 6);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.cyl(white, 0.25, 4.6, tx + Math.cos(a) * 2.6, 24.5, 6 + Math.sin(a) * 2.6);
    }
    b.add(lead, new THREE.SphereGeometry(2.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), tx, 27, 6);
    cone(b, T(C.gold), 0.4, 2.6, tx, 29, 6, 6);
  }
  // trống + mái vòm lớn + đèn lồng
  b.add(cream, new THREE.CylinderGeometry(10, 10, 9, 28), 0, 18.5, -2);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    b.cyl(white, 0.38, 8, Math.cos(a) * 10.4, 18.5, -2 + Math.sin(a) * 10.4);
  }
  b.add(T("#e6dcc4"), new THREE.CylinderGeometry(10.8, 10.8, 1, 28), 0, 23.4, -2);
  b.add(cream, new THREE.CylinderGeometry(8.6, 8.8, 2.4, 28), 0, 25, -2);
  b.add(lead, new THREE.SphereGeometry(8.6, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), 0, 26.2, -2);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.box(
      T("#a9b5bd"),
      0.3,
      6,
      0.3,
      Math.cos(a) * 6.3,
      31.4,
      -2 + Math.sin(a) * 6.3,
      Math.sin(a) * 0.75,
      0,
      -Math.cos(a) * 0.75,
    );
  }
  b.add(white, new THREE.CylinderGeometry(1.4, 1.6, 4, 12), 0, 36.6, -2);
  b.sphere(T(C.gold), 0.7, 0, 39.2, -2);
  b.box(T(C.gold), 0.2, 1.6, 0.2, 0, 40.4, -2);
  return finish(b);
}

function shard(): THREE.Group {
  const b = new StaticBuilder();
  const glass = shiny("#a9cfe6");
  // tháp kính nhọn, các mặt kính lệch nhau
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.add(
      glass,
      new THREE.ConeGeometry(9.5, 92 - i * 3, 3, 1),
      Math.cos(a) * 1.2,
      (92 - i * 3) / 2,
      Math.sin(a) * 1.2,
      0,
      a,
      0,
    );
  }
  b.add(T("#dcecf6"), new THREE.ConeGeometry(10, 80, 4), 0, 40, 0, 0, Math.PI / 4);
  for (let y = 6; y < 80; y += 6) {
    const r = 10 * (1 - y / 80) * 1.02;
    b.add(T("#f4f8fb"), new THREE.TorusGeometry(r, 0.12, 3, 4), 0, y, 0, Math.PI / 2, 0, Math.PI / 4);
  }
  // nhà thấp xung quanh cho có tỉ lệ
  b.box(T("#cbbfae"), 22, 6, 10, -20, 3, 4);
  b.box(T("#b7a998"), 14, 9, 10, 20, 4.5, 2);
  return finish(b);
}

function windsor(): THREE.Group {
  const b = new StaticBuilder();
  const stone = T("#cfc6b4");
  const stoneDark = T("#b8ae9a");
  const crenel = (x: number, z: number, w: number, d: number, y: number) => {
    for (let cx = x - w / 2 + 0.5; cx <= x + w / 2; cx += 1.4) b.box(stone, 0.8, 0.8, d, cx, y + 0.4, z);
  };
  b.add(
    T("#9fd49a"),
    new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    0,
    0,
    0,
    0,
    0,
    0,
    34,
    5,
    14,
  );
  // tường thành dài + các tháp vuông
  b.box(stone, 56, 8, 4, 0, 8, 2);
  crenel(0, 2, 56, 4, 12);
  for (const tx of [-26, -14, 14, 26]) {
    b.box(stoneDark, 6, 13, 6, tx, 9.5, 2);
    crenel(tx, 2, 6, 6, 16);
  }
  // Round Tower trên đồi giữa
  b.add(
    T("#a7d197"),
    new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    0,
    12,
    -3,
    0,
    0,
    0,
    10,
    4,
    8,
  );
  b.add(stone, new THREE.CylinderGeometry(6, 6.4, 12, 24), 0, 20, -3);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    b.box(stone, 0.9, 1, 0.9, Math.cos(a) * 5.8, 26.5, -3 + Math.sin(a) * 5.8);
  }
  b.cyl(T(C.ink), 0.12, 6, 0, 29.5, -3);
  b.box(T("#d8323f"), 4, 2.4, 0.12, 2, 31.5, -3);
  b.box(T("#3a5fcd"), 2, 1.2, 0.13, 3, 32.1, -3);
  b.box(T(C.gold), 2, 1.2, 0.13, 1, 30.9, -3);
  windows(b, T("#7a8796"), -22, 22, 8, 4.05, 1, 2, 4);
  return finish(b);
}

function whiteCliffs(): THREE.Group {
  const b = new StaticBuilder();
  const rnd = mulberry32(14);
  // vách đá phấn trắng, mặt cắt gồ ghề, cỏ xanh phía trên
  for (let i = 0; i < 12; i++) {
    const x = -42 + i * 7.5;
    const h = 16 + rnd() * 6;
    b.box(T(["#f6f4ee", "#ecebe4", "#fbfaf6"][i % 3]!), 8, h, 10, x, h / 2, rnd() * 2);
    b.box(T("#9fd49a"), 8.2, 1, 10.5, x, h + 0.5, rnd() * 2 - 0.2);
    for (let k = 0; k < 3; k++) b.box(T("#dcdad2"), 0.4, h * 0.6, 0.3, x - 3 + k * 3, h * 0.45, 5.2);
  }
  // hải đăng trắng-đỏ
  for (let i = 0; i < 6; i++) b.cyl(T(i % 2 ? "#d8323f" : "#ffffff"), 1.4 - i * 0.12, 2, 30, 23 + i * 2, -2);
  b.sphere(glow("#fff1b0", 0.6, 1.5), 0.9, 30, 35.5, -2);
  // biển phía trước
  b.box(shiny("#8fd0e6"), 100, 0.3, 14, 0, 0.1, 12);
  return finish(b);
}

function cardiff(): THREE.Group {
  const b = new StaticBuilder();
  const stone = T("#c9b9a0");
  const stoneDark = T("#b2a088");
  // tường thành + tháp đồng hồ trang trí (Clock Tower) + keep Norman trên gò
  b.box(stone, 50, 8, 3, 0, 4, 6);
  for (let cx = -24.5; cx <= 25; cx += 1.4) b.box(stone, 0.8, 0.8, 3, cx, 8.4, 6);
  b.box(stoneDark, 8, 24, 8, 16, 12, 2);
  for (const [dx, dz, ry] of [
    [0, 4.05, 0],
    [4.05, 0, Math.PI / 2],
  ] as const) {
    b.add(T("#ffffff"), new THREE.CircleGeometry(2.4, 24), 16 + dx, 18, 2 + dz, 0, ry);
    b.add(T(C.gold), new THREE.RingGeometry(2.3, 2.7, 24), 16 + dx * 1.002, 18, 2 + dz * 1.002, 0, ry);
  }
  pyramid(b, T("#5f7f86"), 8.6, 6, 16, 24, 2);
  for (const dx of [-3.6, 3.6])
    for (const dz of [-3.6, 3.6]) cone(b, T("#5f7f86"), 0.6, 3, 16 + dx, 24, 2 + dz, 8);
  b.add(T("#a7d197"), new THREE.ConeGeometry(12, 9, 24), -14, 4.5, -2);
  b.add(stone, new THREE.CylinderGeometry(5.5, 6, 6, 12), -14, 12, -2);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.box(stone, 1, 1, 1, -14 + Math.cos(a) * 5.4, 15.5, -2 + Math.sin(a) * 5.4);
  }
  // cờ rồng đỏ xứ Wales
  b.cyl(T(C.ink), 0.12, 6, 16, 33, 2);
  b.box(T("#ffffff"), 4, 1.2, 0.12, 18, 35.6, 2);
  b.box(T("#3faa5b"), 4, 1.2, 0.12, 18, 34.4, 2);
  b.add(T("#d8323f"), new THREE.ConeGeometry(0.7, 2, 4), 18, 35, 2.1, 0, 0, Math.PI / 2);
  return finish(b);
}

function snowdon(): THREE.Group {
  const b = new StaticBuilder();
  // dãy núi xám xanh, đỉnh tuyết, tàu leo núi nhỏ
  b.add(T("#7f8f86"), new THREE.ConeGeometry(30, 34, 7), 0, 17, -4);
  b.add(T("#8a9a8f"), new THREE.ConeGeometry(22, 24, 6), -28, 12, 2);
  b.add(T("#93a396"), new THREE.ConeGeometry(20, 20, 6), 26, 10, 3);
  b.add(T("#ffffff"), new THREE.ConeGeometry(8.8, 9, 7), 0, 29.5, -4);
  b.add(T("#ffffff"), new THREE.ConeGeometry(5, 5, 6), -28, 21.5, 2);
  b.add(T("#9fd49a"), new THREE.CylinderGeometry(40, 44, 3, 16), 0, 1.5, 4);
  b.box(T("#d8323f"), 3, 1.6, 1.6, 10, 14, 14, 0, 0, 0.5);
  b.box(T("#7a5a3a"), 22, 0.3, 0.6, 14, 10, 14, 0, 0, 0.5);
  return finish(b);
}

function cotswolds(): THREE.Group {
  const b = new StaticBuilder();
  const stone = T("#e2c78c");
  const roof = T("#b9a780");
  // dãy nhà đá vàng mái dốc (Arlington Row), suối nhỏ, cầu đá
  for (let i = 0; i < 8; i++) {
    const x = -24 + i * 6.2;
    b.box(stone, 6, 4.5, 5, x, 2.25, 0);
    b.add(roof, new THREE.ConeGeometry(4.4, 3.4, 4, 1), x, 6.2, 0, 0, Math.PI / 4, 0, 1, 1, 0.75);
    b.box(stone, 0.9, 2, 0.9, x + 2, 7.4, 0);
    b.box(T("#7a8796"), 1, 1, 0.2, x - 1.4, 2.6, 2.55);
    b.box(T("#7a8796"), 1, 1, 0.2, x + 1.4, 2.6, 2.55);
    b.box(T(["#5f8a6b", "#3d5f8a", "#8a3d3d"][i % 3]!), 0.9, 1.8, 0.2, x, 0.9, 2.55);
    b.sphere(T("#c98ab8"), 0.5, x + 2.6, 0.5, 3);
  }
  b.box(shiny("#9ccfe0"), 60, 0.2, 3, 0, 0.1, 6);
  b.add(stone, new THREE.TorusGeometry(2.4, 0.5, 6, 12, Math.PI), 10, 0.1, 6, 0, Math.PI / 2, 0);
  return finish(b);
}

function cambridge(): THREE.Group {
  const b = new StaticBuilder();
  const stone = T("#e9dcc0");
  const stoneDark = T("#d6c6a4");
  // King's College Chapel: sảnh dài, cửa sổ kính màu cao, 4 tháp nhọn ở góc
  b.box(stone, 44, 22, 12, 0, 11, 0);
  for (let i = 0; i < 11; i++) {
    const x = -19 + i * 3.8;
    b.box(stoneDark, 0.9, 24, 0.9, x - 1.9, 12, 6.1);
    b.box(T("#7b8fb3"), 2.4, 15, 0.2, x, 11, 6.05);
    cone(b, stoneDark, 0.4, 2.4, x - 1.9, 24, 6.1, 4);
  }
  b.box(stoneDark, 44.4, 1, 12.4, 0, 22.5, 0);
  for (const dx of [-21.5, 21.5]) {
    for (const dz of [-5.6, 5.6]) {
      b.box(stone, 2.4, 28, 2.4, dx, 14, dz);
      cone(b, stoneDark, 1.3, 5, dx, 28, dz, 8);
    }
  }
  b.box(T("#7b8fb3"), 0.2, 16, 7, 22.05, 12, 0);
  // sông Cam + thuyền punting
  b.box(shiny("#8cc6c9"), 70, 0.2, 6, 0, 0.1, 13);
  for (const px of [-10, 12]) {
    b.box(T("#7a5a3a"), 5, 0.5, 1.4, px, 0.4, 13);
    b.box(T(C.ink), 0.08, 4, 0.08, px + 2, 2.4, 13, 0, 0, 0.3);
  }
  b.add(T("#9fd49a"), new THREE.BoxGeometry(70, 0.3, 4), 0, 0.15, 8.5);
  return finish(b);
}

function blackpool(): THREE.Group {
  const b = new StaticBuilder();
  const red = T("#b8452f");
  // tháp sắt kiểu Eiffel đỏ nâu trên toà nhà gạch, bãi biển phía trước
  b.box(texMat("brick", "#b85a45"), 30, 10, 14, 0, 5, 0);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.box(
      red,
      0.9,
      46,
      0.9,
      Math.cos(a) * 3.2,
      33,
      Math.sin(a) * 3.2,
      Math.sin(a) * 0.09,
      0,
      -Math.cos(a) * 0.09,
    );
  }
  for (let y = 14; y < 55; y += 4) {
    const r = 5.6 - (y - 10) * 0.075;
    b.box(red, r * 2, 0.35, r * 2, 0, y, 0);
    b.box(red, r * 2, 0.35, 0.35, 0, y + 2, r, 0, 0, 0.6);
    b.box(red, r * 2, 0.35, 0.35, 0, y + 2, -r, 0, 0, -0.6);
  }
  b.box(T("#f2e9d8"), 4.6, 3, 4.6, 0, 57, 0);
  cone(b, red, 2, 4, 0, 58.5, 0, 4);
  b.box(T(C.gold), 0.2, 3, 0.2, 0, 64, 0);
  b.box(T("#efe0bf"), 60, 0.2, 10, 0, 0.1, 13);
  return finish(b);
}

function lakeDistrict(): THREE.Group {
  const b = new StaticBuilder();
  const rnd = mulberry32(17);
  // núi xanh thoai thoải, hồ phẳng lặng, thuyền nhỏ, cừu
  for (const [x, r, h, c] of [
    [-24, 22, 18, "#7fae78"],
    [4, 26, 24, "#6f9f6c"],
    [30, 20, 15, "#86b57f"],
  ] as const)
    b.add(T(c), new THREE.ConeGeometry(r, h, 8), x, h / 2, -10);
  b.box(shiny("#7fb8d0"), 80, 0.3, 16, 0, 0.15, 6);
  for (const bx of [-8, 14]) {
    b.box(T("#ffffff"), 3, 0.6, 1, bx, 0.6, 6);
    b.box(T(C.ink), 0.1, 3, 0.1, bx, 2.2, 6);
    b.add(T("#ffffff"), new THREE.ConeGeometry(1, 2.4, 3), bx + 0.6, 2.4, 6, 0, Math.PI / 2, 0);
  }
  for (let i = 0; i < 8; i++) {
    const x = -36 + rnd() * 72;
    b.add(T(C.white), new THREE.SphereGeometry(1, 10, 8), x, 1, 15 + rnd() * 3, 0, 0, 0, 1.1, 0.8, 0.8);
    b.sphere(T(C.ink), 0.4, x + 1.1, 1.3, 15.5);
  }
  for (let x = -38; x < 38; x += 1.6) b.box(T("#bfb6a6"), 1.5, 1, 1, x, 0.5, 19);
  return finish(b);
}

function york(): THREE.Group {
  const b = new StaticBuilder();
  const stone = T("#e2d3b4");
  const stoneDark = T("#cbb995");
  // York Minster: thân gothic, cửa sổ hoa hồng, 2 tháp tây + tháp trung tâm
  b.box(stone, 46, 22, 16, 4, 11, 0);
  for (let i = 0; i < 9; i++) b.box(T("#7b8fb3"), 2.2, 12, 0.2, -14 + i * 4.2, 11, 8.05);
  for (const tx of [-22, -12]) {
    b.box(stone, 8, 38, 8, tx, 19, 2);
    for (const dx of [-3.4, 3.4])
      for (const dz of [-3.4, 3.4]) cone(b, stoneDark, 0.6, 4, tx + dx, 38, 2 + dz, 4);
    b.box(T("#7b8fb3"), 3, 10, 0.2, tx, 22, 6.05);
  }
  b.box(stone, 10, 18, 10, 8, 31, 0);
  for (const dx of [-4.4, 4.4]) for (const dz of [-4.4, 4.4]) cone(b, stoneDark, 0.6, 4, 8 + dx, 40, dz, 4);
  b.add(T("#b4466a"), new THREE.CircleGeometry(3, 24), -17, 14, 6.12);
  // phố The Shambles: nhà gỗ đổ nghiêng
  for (let i = 0; i < 5; i++) {
    const x = 18 + i * 4;
    b.box(T("#f2ead8"), 3.8, 7, 4, x, 3.5, 10, 0, 0, (i % 2 ? 1 : -1) * 0.04);
    for (const by of [2, 5]) b.box(T("#4a3426"), 3.9, 0.25, 4.1, x, by, 10);
    b.add(T("#7d6a5a"), new THREE.ConeGeometry(3, 2.4, 4, 1), x, 8.2, 10, 0, Math.PI / 4, 0, 1, 1, 0.8);
  }
  return finish(b);
}

function hadriansWall(): THREE.Group {
  const b = new StaticBuilder();
  const rnd = mulberry32(21);
  // tường đá La Mã chạy trên sống đồi lượn sóng + pháo đài nhỏ (milecastle) + cây cô đơn Sycamore Gap
  for (let i = 0; i < 30; i++) {
    const x = -45 + i * 3;
    const y = 4 + Math.sin(i * 0.4) * 3;
    b.add(
      T("#9fcf8f"),
      new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      x,
      0,
      0,
      0,
      0,
      0,
      3.4,
      y,
      8,
    );
    b.box(T(["#b8b0a2", "#a9a194", "#c3bbad"][Math.floor(rnd() * 3)]!), 3.1, 2, 1.6, x, y + 1, 0);
  }
  b.box(T("#b8b0a2"), 6, 4, 6, 6, 6.5 + Math.sin(17 * 0.4) * 3, 0);
  b.cyl(T("#6b4f3a"), 0.5, 5, -12, 4 + Math.sin(11 * 0.4) * 3 + 2.5, -1.5);
  b.sphere(T("#6fae5c"), 3.6, -12, 4 + Math.sin(11 * 0.4) * 3 + 6.8, -1.5);
  return finish(b);
}

function forthBridge(): THREE.Group {
  const b = new StaticBuilder();
  const red = T("#c0392b");
  // cầu đường sắt dầm hẫng đỏ: 3 khối kim cương nối nhau
  for (const cx of [-30, 0, 30]) {
    for (const s of [-1, 1]) {
      b.box(red, 1, 30, 1, cx + s * 6, 15, 0, 0, 0, s * 0.42);
      b.box(red, 1, 30, 1, cx + s * 6, 15, 0, 0, 0, -s * 0.42);
      b.box(red, 15, 1, 1, cx + s * 7.5, 26, 0, 0, 0, -s * 0.5);
      b.box(red, 15, 1, 1, cx + s * 7.5, 4, 0, 0, 0, s * 0.5);
    }
    b.box(red, 2, 34, 2, cx, 17, 0);
    b.box(T("#9a9286"), 8, 4, 6, cx, -1, 0);
  }
  b.box(red, 90, 1.4, 3, 0, 10, 0);
  b.box(T("#7a3a2a"), 4, 1, 1.6, 8, 11.2, 0); // tàu hoả nhỏ
  b.box(T("#ffd166"), 4, 1, 1.6, 12.2, 11.2, 0);
  b.box(shiny("#7fb8d0"), 110, 0.3, 30, 0, -0.2, 2);
  return finish(b);
}

function lochNess(): THREE.Group {
  const b = new StaticBuilder();
  // hồ dài, núi Highland, lâu đài Urquhart đổ nát, và… Nessie!
  b.add(T("#7f9f78"), new THREE.ConeGeometry(28, 20, 7), -20, 10, -16);
  b.add(T("#8aa983"), new THREE.ConeGeometry(30, 22, 7), 22, 11, -18);
  b.box(shiny("#5f8fa8"), 100, 0.3, 18, 0, 0.15, 4);
  const stone = T("#a59c8c");
  b.box(stone, 6, 14, 6, -18, 7, -4);
  for (let cx = -20.5; cx <= -15.5; cx += 1.2) b.box(stone, 0.7, 0.8, 6, cx, 14.4, -4);
  b.box(stone, 14, 4, 2, -8, 2, -4);
  b.box(stone, 4, 6, 2, -2, 3, -4);
  // Nessie: cổ dài và hai bướu nổi trên mặt nước
  const ness = T("#4f8f6e");
  b.add(ness, new THREE.CapsuleGeometry(0.6, 5, 4, 10), 12, 2.8, 6, 0, 0, -0.3);
  b.sphere(ness, 0.9, 12.9, 5.6, 6);
  b.sphere(T(C.ink), 0.12, 13.5, 5.8, 6.6);
  for (const hx of [15, 18])
    b.add(ness, new THREE.SphereGeometry(1.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), hx, 0.3, 6);
  return finish(b);
}

function giantsCauseway(): THREE.Group {
  const b = new StaticBuilder();
  const rnd = mulberry32(44);
  // hàng nghìn cột đá lục giác bậc thang xuống biển, vách đá phía sau
  b.box(T("#6f7f6a"), 80, 16, 12, 0, 8, -14);
  b.box(T("#9fd49a"), 80, 1, 12.5, 0, 16.5, -14);
  for (let i = 0; i < 18; i++) {
    for (let j = 0; j < 10; j++) {
      const x = -30 + i * 3.4 + (j % 2) * 1.7;
      const z = -6 + j * 2.9;
      const h = Math.max(0.6, 7 - j * 0.6 - Math.abs(i - 9) * 0.25 + rnd() * 1.2);
      b.add(
        T(["#4a4e52", "#575b5f", "#3f4347"][Math.floor(rnd() * 3)]!),
        new THREE.CylinderGeometry(1.6, 1.6, h, 6),
        x,
        h / 2,
        z,
      );
    }
  }
  b.box(shiny("#6fa8c0"), 100, 0.3, 20, 0, 0.3, 26);
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
      return { group, update: (t) => (wheel.rotation.z = -t * 0.04) };
    }
    case "tower-bridge":
      return { group: towerBridge() };
    case "buckingham":
      return { group: buckingham() };
    case "brighton-pier":
      return { group: brightonPier() };
    case "stonehenge":
      return { group: stonehenge() };
    case "bath":
      return { group: bath() };
    case "oxford":
      return { group: oxford() };
    case "birmingham":
      return { group: birmingham() };
    case "old-trafford":
      return { group: oldTrafford() };
    case "liverpool":
      return { group: liverpool() };
    case "angel-north":
      return { group: angelNorth() };
    case "edinburgh":
      return { group: edinburgh() };
    case "st-pauls":
      return { group: stPauls() };
    case "shard":
      return { group: shard() };
    case "windsor":
      return { group: windsor() };
    case "white-cliffs":
      return { group: whiteCliffs() };
    case "cardiff":
      return { group: cardiff() };
    case "snowdon":
      return { group: snowdon() };
    case "cotswolds":
      return { group: cotswolds() };
    case "cambridge":
      return { group: cambridge() };
    case "blackpool":
      return { group: blackpool() };
    case "lake-district":
      return { group: lakeDistrict() };
    case "york":
      return { group: york() };
    case "hadrians-wall":
      return { group: hadriansWall() };
    case "forth-bridge":
      return { group: forthBridge() };
    case "loch-ness":
      return { group: lochNess() };
    case "giants-causeway":
      return { group: giantsCauseway() };
  }
}

// ------------------------------------------------------------- cảnh dọc đường
const G = GROUND;

const HOUSE_STYLES: Record<HouseStyle, { walls: string[]; roof: string; trim: string }> = {
  london: {
    walls: ["#f7f3ea", "#dcefe6", "#fde3a0", "#d9ecf2", "#f6dcd3"],
    roof: "#6f7d8c",
    trim: "#ffffff",
  },
  bath: { walls: ["#ead2a0", "#e4c78f", "#efd9ad"], roof: "#7d8391", trim: "#f6ead0" },
  brick: { walls: ["#c46a55", "#b55e4a", "#cf7a62"], roof: "#5f6673", trim: "#f4efe6" },
  stone: { walls: ["#b9b3a8", "#a9a397", "#c6c0b4"], roof: "#5f6673", trim: "#ece8df" },
};
const DOOR_COLORS = ["#4e9297", "#1f2d4d", "#e85d6a", "#f2c14e", "#7fb7c9"];
const SHOP_SIGNS: [string, string, string][] = [
  ["Phở 🍜", "#fde3a0", "#1f2d4d"],
  ["Fish & Chips", "#4e9297", "#ffffff"],
  ["Bánh mì", "#f6b3c2", "#1f2d4d"],
  ["Trà sữa 🧋", "#a8d3d9", "#1f2d4d"],
  ["Tạp hoá Á Đông", "#e85d6a", "#ffffff"],
  ["The Red Lion 🍺", "#1f2d4d", "#fde3a0"],
  ["Corner Shop", "#dcefe6", "#1f2d4d"],
];

function roadLines(b: B, len: number) {
  for (let x = -len / 2; x < len / 2; x += 6) b.box(T(C.roadLine), 3, 0.02, 0.3, x + 1.5, G + 0.02, 0);
  for (const z of [-6.6, -6.8]) b.box(T("#f2c14e"), len, 0.02, 0.1, 0, G + 0.02, z); // vạch vàng đôi sát lề
  b.box(T(C.pavement), len, 0.25, 4, 0, G + 0.12, -9);
  b.box(T(C.pavement), len, 0.25, 4, 0, G + 0.12, 9);
}

function cityTile(b: B, len: number, style: HouseStyle, rnd: () => number) {
  const s = HOUSE_STYLES[style];
  b.box(T("#cfe8c8"), len, 0.1, 40, 0, G - 0.02, -31);
  const n = 5;
  const w = len / n;
  for (let i = 0; i < n; i++) {
    const cx = -len / 2 + w * (i + 0.5);
    const h = 4.2 + rnd() * 1.4;
    b.box(T(s.walls[Math.floor(rnd() * s.walls.length)]!), w - 0.2, h, 6, cx, G + h / 2, -24);
    b.add(
      T(s.roof),
      new THREE.ConeGeometry(w * 0.6, 1.8, 4, 1),
      cx,
      G + h + 0.9,
      -24,
      0,
      Math.PI / 4,
      0,
      1,
      1,
      0.6,
    );
    b.box(T(s.trim), w - 0.1, 0.25, 0.3, cx, G + h - 0.1, -20.9);
    b.box(T("#8a6a5a"), 0.5, 1.2, 0.5, cx + w / 3, G + h + 1.4, -24);
    const shop = rnd() < 0.28;
    if (shop) {
      const [text, bg, fg] = SHOP_SIGNS[Math.floor(rnd() * SHOP_SIGNS.length)]!;
      b.box(glow("#fff4d6", 0.35, 1), w - 1.4, 1.6, 0.2, cx, G + 1.2, -20.92);
      b.add(signMaterial(text, { bg, fg }), new THREE.PlaneGeometry(w - 1.2, 0.8), cx, G + 2.5, -20.85);
    } else {
      b.box(
        T(DOOR_COLORS[Math.floor(rnd() * DOOR_COLORS.length)]!),
        0.9,
        1.7,
        0.2,
        cx - w / 4,
        G + 0.85,
        -20.92,
      );
      b.box(T(s.trim), 1.3, 1.1, 0.24, cx + w / 5, G + 1.4, -20.92);
      b.box(glow("#fff1c4", 0.2, 1), 1.0, 0.8, 0.26, cx + w / 5, G + 1.4, -20.92);
    }
    b.box(T(s.trim), 1.2, 1.0, 0.24, cx, G + h - 1.2, -20.92);
    b.box(glow("#fff1c4", 0.2, 1), 0.9, 0.7, 0.26, cx, G + h - 1.2, -20.92);
  }
  // cây, đèn đường, bốt điện thoại / hòm thư đỏ
  for (const tx of [-len / 3, len / 5]) {
    b.cyl(T(C.woodDark), 0.25, 2, tx, G + 1, -12);
    b.sphere(T("#8fcf8c"), 1.6, tx, G + 3, -12);
  }
  b.cyl(T(C.ink), 0.1, 3.8, 0, G + 1.9, -8.5);
  b.box(glow("#fde3a0", 0.35, 1.2), 0.5, 0.6, 0.5, 0, G + 4, -8.5);
  if (rnd() < 0.5) {
    b.box(T("#d8323f"), 1.2, 2.6, 1.2, len / 2 - 4, G + 1.3, -9.2);
    b.box(glow("#fff6d6", 0.2, 0.8), 0.9, 1.6, 1.25, len / 2 - 4, G + 1.4, -9.2);
  } else {
    b.cyl(T("#d8323f"), 0.35, 1.2, len / 2 - 4, G + 0.6, -8.6);
    b.sphere(T("#d8323f"), 0.36, len / 2 - 4, G + 1.2, -8.6);
  }
}

function countryTile(b: B, len: number, rnd: () => number) {
  b.box(T("#b7e3a8"), len, 0.1, 60, 0, G - 0.02, -36);
  // đồi thoai thoải
  for (let i = 0; i < 3; i++) {
    b.add(
      T(["#a3d993", "#b2e0a2", "#95cf86"][i]!),
      new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      -len / 2 + rnd() * len,
      G,
      -40 - rnd() * 20,
      0,
      0,
      0,
      18 + rnd() * 10,
      5 + rnd() * 4,
      12,
    );
  }
  // hàng rào cây + tường đá khô
  b.box(T("#6fb66a"), len, 1.2, 1, 0, G + 0.6, -12);
  for (let x = -len / 2; x < len / 2; x += 1.2)
    b.box(T("#c8c0b0"), 1.1, 0.8, 0.8, x + 0.6, G + 0.4, -20 + Math.sin(x) * 0.2);
  // cừu
  for (let i = 0; i < 4; i++) {
    const x = -len / 2 + rnd() * len;
    const z = -15 - rnd() * 5;
    b.add(T(C.white), new THREE.SphereGeometry(1, 10, 8), x, G + 0.75, z, 0, 0, 0, 0.75, 0.55, 0.55);
    b.sphere(T(C.ink), 0.26, x + 0.75, G + 0.95, z);
  }
  // nhà tranh
  if (rnd() < 0.5) {
    const cx = -len / 2 + rnd() * len;
    b.box(T("#f6efe2"), 6, 3, 4, cx, G + 1.5, -26);
    b.add(
      T("#d7b56d"),
      new THREE.ConeGeometry(4.6, 2.6, 4, 1),
      cx,
      G + 4.3,
      -26,
      0,
      Math.PI / 4,
      0,
      1,
      1,
      0.65,
    );
  }
}

function coastTile(b: B, len: number, rnd: () => number) {
  b.box(T("#efe0bf"), len, 0.12, 10, 0, G - 0.01, -16); // bãi sỏi/cát
  b.box(T("#8fd0e6"), len, 0.05, 80, 0, G - 0.06, -60); // biển
  for (let i = 0; i < 3; i++)
    b.box(T("#ffffff"), len * 0.3, 0.06, 0.4, -len / 3 + i * len * 0.35, G, -22 - i * 6); // sóng
  // hàng chòi tắm biển nhiều màu
  const huts = ["#e85d6a", "#a8d3d9", "#fde3a0", "#4e9297", "#f6b3c2", "#ffffff"];
  for (let x = -len / 2 + 1.5; x < len / 2; x += 3) {
    b.box(T(huts[Math.floor(rnd() * huts.length)]!), 2.2, 2.4, 2, x, G + 1.2, -12.5);
    b.add(T("#f6f6f2"), new THREE.ConeGeometry(1.8, 1, 4), x, G + 2.9, -12.5, 0, Math.PI / 4, 0, 1, 1, 0.8);
  }
  b.box(T(C.white), len, 0.8, 0.2, 0, G + 0.6, -10.8); // lan can bờ biển
}

function riverTile(b: B, len: number) {
  b.box(T("#c9c3b5"), len, 1.2, 1.2, 0, G + 0.6, -11); // tường kè
  b.box(T("#8fc6dc"), len, 0.05, 80, 0, G - 0.4, -52);
  for (let i = 0; i < 3; i++)
    b.box(T("#bfe1ee"), len * 0.25, 0.06, 0.4, -len / 3 + i * len * 0.35, G - 0.36, -20 - i * 9);
  for (const x of [-len / 4, len / 4]) {
    b.cyl(T(C.ink), 0.12, 3.6, x, G + 3, -11);
    b.sphere(glow("#fde3a0", 0.35, 1.2), 0.4, x, G + 5, -11);
  }
}

/** Một "ô" cảnh dài `len` mét, kiểu theo địa danh gần nhất. Lặp lại dọc tuyến. */
export function buildTile(len: number, seed: number, terrain: Terrain, style: HouseStyle): THREE.Group {
  const b = new StaticBuilder();
  const rnd = mulberry32(seed);
  roadLines(b, len);
  if (terrain === "city") cityTile(b, len, style, rnd);
  else if (terrain === "country") countryTile(b, len, rnd);
  else if (terrain === "coast") coastTile(b, len, rnd);
  else riverTile(b, len);
  const g = new THREE.Group();
  for (const m of b.build()) {
    m.matrixAutoUpdate = false;
    g.add(m);
  }
  return g;
}
