import * as THREE from "three";
import { OII_STREET, mulberry32, type House } from "@xom-oii/world";
import { M, doorMaterial } from "./materials";
import { signMaterial } from "./signs";
import { StaticBuilder } from "./StaticBuilder";

/**
 * Dựng toàn bộ phần tĩnh của Oii Street từ dữ liệu `packages/world`.
 * Quy ước: mặt tiền bắc ở z = −7 nhìn về +z; mặt tiền nam ở z = +7 nhìn về −z.
 */

const PAVE_Y = 0.12;
const H = 7.2; // chiều cao nhà 2 tầng

type B = StaticBuilder;

/** s = −1 (bắc) | +1 (nam). Trả về z của một điểm cách mặt tiền `out` mét ra phía đường. */
const fz = (s: number, out: number) => s * (7 - out);

function house(
  b: B,
  h: Pick<House, "x" | "width" | "doorColor" | "brick" | "lit" | "number">,
  s: number,
  opts: { height?: number } = {},
) {
  const { x, width: w } = h;
  const height = opts.height ?? H;
  const depth = 8;
  const brick = [M.brick0, M.brick1, M.brick2][h.brick]!;
  b.box(brick, w, height, depth, x, height / 2, s * (7 + depth / 2));
  // chân tường + gờ trắng giữa hai tầng
  b.box(M.brickDark, w, 0.5, 0.06, x, PAVE_Y + 0.25, fz(s, 0.02));
  b.box(M.stone, w, 0.16, 0.12, x, 3.45, fz(s, 0.05));
  // cửa đi + khung + ô kính trên cửa
  const dx = x - w / 2 + 1.1;
  b.box(M.white, 1.25, 2.55, 0.08, dx, PAVE_Y + 1.27, fz(s, 0.03));
  b.box(doorMaterial(h.doorColor), 1.0, 2.05, 0.1, dx, PAVE_Y + 1.03, fz(s, 0.06));
  b.box(h.lit[0] ? M.glassLit : M.glassDark, 0.95, 0.32, 0.1, dx, PAVE_Y + 2.32, fz(s, 0.06));
  b.box(M.gold, 0.06, 0.06, 0.06, dx + 0.36, PAVE_Y + 1.05, fz(s, 0.13)); // tay nắm
  b.box(M.stone, 1.4, 0.12, 0.45, dx, PAVE_Y + 0.06, fz(s, -0.1)); // bậc cửa
  // cửa sổ tầng trệt (bay đơn giản)
  const wx = x + w / 2 - 1.35;
  windowFrame(b, wx, 1.75, s, 1.5, 1.55, h.lit[0]);
  // tầng trên: 2 cửa sổ
  windowFrame(b, x - w / 4, 5.0, s, 1.05, 1.45, h.lit[1]);
  windowFrame(b, x + w / 4, 5.0, s, 1.05, 1.45, h.lit[2]);
  if (height > H) windowFrame(b, x, 8.4, s, 1.05, 1.3, h.lit[1]);
  roof(b, x, w, height, s);
}

function windowFrame(b: B, x: number, y: number, s: number, w: number, h: number, lit: boolean) {
  b.box(M.white, w + 0.16, h + 0.16, 0.08, x, y, fz(s, 0.03));
  b.box(lit ? M.glassLit : M.glassDark, w, h, 0.1, x, y, fz(s, 0.05));
  b.box(M.white, 0.06, h, 0.12, x, y, fz(s, 0.07)); // song dọc
  b.box(M.white, w, 0.06, 0.12, x, y + h * 0.12, fz(s, 0.07)); // song ngang
  b.box(M.stone, w + 0.3, 0.1, 0.22, x, y - h / 2 - 0.1, fz(s, 0.1)); // bậu
  b.box(M.stone, w + 0.2, 0.14, 0.1, x, y + h / 2 + 0.14, fz(s, 0.04)); // lanh tô
}

function roof(b: B, x: number, w: number, height: number, s: number) {
  const len = 4.7;
  const a = 0.52;
  const cy = height + (len / 2) * Math.sin(a) - 0.05;
  const off = (len / 2) * Math.cos(a);
  b.box(M.slate, w + 0.04, 0.14, len, x, cy, s * (7 + off - 0.1), -s * a);
  b.box(M.slate, w + 0.04, 0.14, len, x, cy, s * (15 - off + 0.1), s * a);
  // ống khói trên tường chung
  const cx = x + w / 2;
  const top = height + len * Math.sin(a) * 0.5 + 0.9;
  b.box(M.brick1, 0.9, 2.2, 1.1, cx, top - 0.6, s * 11);
  b.box(M.stone, 1.0, 0.12, 1.2, cx, top + 0.5, s * 11);
  for (const dz of [-0.25, 0.25]) b.cyl(M.chimneyPot, 0.12, 0.45, cx, top + 0.78, s * 11 + dz);
}

function shop(b: B) {
  const { x0, x1 } = OII_STREET.shop;
  const x = (x0 + x1) / 2;
  const w = x1 - x0;
  const s = 1;
  b.box(M.brick2, w, H, 8, x, H / 2, 11);
  b.box(M.black, w, 3.4, 0.1, x, 1.7, fz(s, 0.02));
  b.box(M.shopGlass, w - 2.6, 2.3, 0.12, x - 0.9, PAVE_Y + 1.45, fz(s, 0.06)); // mặt kính
  b.box(M.shopGlass, 1.1, 2.3, 0.12, x1 - 1.0, PAVE_Y + 1.25, fz(s, 0.06)); // cửa kính
  b.box(M.white, w - 2.6, 0.08, 0.14, x - 0.9, PAVE_Y + 1.6, fz(s, 0.08)); // kệ hàng
  for (let i = 0; i < 6; i++)
    b.box(M.metal, 0.06, 2.3, 0.14, x0 + 0.5 + i * 1.08, PAVE_Y + 1.45, fz(s, 0.08));
  const fascia = signMaterial("Oii Express", { bg: "#0f5b4f", fg: "#ffe9a8", border: "#f6c64a", glowMax: 1 });
  b.add(fascia, new THREE.PlaneGeometry(w - 0.4, 0.85), x, 3.05, fz(s, 0.12), 0, Math.PI);
  windowFrame(b, x - 2.4, 5.0, s, 1.1, 1.45, true);
  windowFrame(b, x, 5.0, s, 1.1, 1.45, false);
  windowFrame(b, x + 2.4, 5.0, s, 1.1, 1.45, true);
  roof(b, x, w, H, s);
  // A-board
  const { x: ax, z: az } = OII_STREET.aBoard;
  const aSign = signMaterial("", {
    bg: "#111",
    fg: "#ffe14a",
    width: 256,
    height: 320,
    lines: ["YELLOW", "STICKER", "từ 25p"],
    glowMax: 0.6,
  });
  for (const dir of [-1, 1]) {
    b.box(M.wood, 0.62, 0.95, 0.04, ax, PAVE_Y + 0.48, az + dir * 0.17, dir * 0.2);
    b.add(
      aSign,
      new THREE.PlaneGeometry(0.52, 0.72),
      ax,
      PAVE_Y + 0.52,
      az + dir * 0.2,
      dir * 0.2,
      dir > 0 ? 0 : Math.PI,
    );
  }
  // thùng hoa quả
  const { x: fx, z: fz2 } = OII_STREET.fruitCrates;
  const rnd = mulberry32(5);
  const fruit = [M.fruitOrange, M.fruitGreen, M.fruitRed];
  for (let i = 0; i < 3; i++) {
    const cx = fx - 0.6 + i * 0.6;
    b.box(M.wood, 0.55, 0.5, 0.6, cx, PAVE_Y + 0.45, fz2);
    b.box(M.wood, 0.55, 0.3, 0.6, cx, PAVE_Y + 0.15, fz2);
    for (let k = 0; k < 7; k++) {
      b.sphere(
        fruit[i]!,
        0.075,
        cx - 0.18 + rnd() * 0.36,
        PAVE_Y + 0.74 + rnd() * 0.04,
        fz2 - 0.2 + rnd() * 0.4,
      );
    }
  }
}

function pub(b: B) {
  const { x0, x1 } = OII_STREET.pub;
  const x = (x0 + x1) / 2;
  const w = x1 - x0;
  const height = 10.4;
  const s = 1;
  b.box(M.brick0, w, height, 8, x, height / 2, 11);
  b.box(M.pubGreen, w, 3.6, 0.2, x, 1.8, fz(s, 0.05));
  b.box(M.gold, w, 0.08, 0.24, x, 3.65, fz(s, 0.06));
  b.box(M.gold, w, 0.08, 0.24, x, 2.6, fz(s, 0.06));
  const fascia = signMaterial("THE OII ARMS", {
    bg: "#173b2e",
    fg: "#e8c25a",
    font: 'bold 72px Georgia, "Times New Roman", serif',
    glowMax: 0.9,
  });
  b.add(fascia, new THREE.PlaneGeometry(w - 1, 0.85), x, 3.12, fz(s, 0.17), 0, Math.PI);
  // cửa sổ pub vàng ấm + cửa
  for (const wx of [x0 + 1.8, x0 + 4.6, x0 + 7.4]) {
    b.box(M.pubGlass, 2.2, 1.7, 0.1, wx, PAVE_Y + 1.25, fz(s, 0.16));
    b.box(M.gold, 0.06, 1.7, 0.14, wx, PAVE_Y + 1.25, fz(s, 0.18));
  }
  b.box(M.pubGlass, 1.1, 2.1, 0.1, 26, PAVE_Y + 1.05, fz(s, 0.16));
  b.box(M.gold, 1.2, 0.08, 0.14, 26, PAVE_Y + 2.15, fz(s, 0.18));
  // tầng trên
  for (let i = 0; i < 4; i++) {
    const wx = x0 + 1.8 + i * 3.1;
    windowFrame(b, wx, 5.3, s, 1.2, 1.6, i % 2 === 0);
    windowFrame(b, wx, 8.4, s, 1.2, 1.4, i === 1);
    // giỏ hoa dưới cửa sổ tầng 1
    b.box(M.basket, 1.3, 0.25, 0.35, wx, 4.3, fz(s, 0.25));
    for (let k = 0; k < 5; k++) b.sphere(M.flowers, 0.1, wx - 0.5 + k * 0.25, 4.5, fz(s, 0.3));
  }
  roof(b, x, w, height, s);
  // biển treo
  b.box(M.black, 1.3, 0.06, 0.06, x0 + 0.6, 4.6, fz(s, 0.7), 0, Math.PI / 2);
  const hanging = signMaterial("", {
    bg: "#173b2e",
    fg: "#e8c25a",
    width: 256,
    height: 320,
    border: "#e8c25a",
    lines: ["THE", "OII", "ARMS", "🍺"],
    glowMax: 0.8,
  });
  for (const side of [-1, 1]) {
    b.add(
      hanging,
      new THREE.PlaneGeometry(0.85, 1.05),
      x0 + 0.6 + side * 0.03,
      3.95,
      fz(s, 1.0),
      0,
      side * (Math.PI / 2),
    );
  }
  // giỏ hoa treo hai bên cửa
  for (const hx of [x0 + 0.4, x1 - 0.4]) {
    b.sphere(M.basket, 0.3, hx, 3.1, fz(s, 0.5), 0.8);
    for (let k = 0; k < 6; k++)
      b.sphere(M.flowers, 0.09, hx - 0.2 + (k % 3) * 0.2, 3.3, fz(s, 0.45 + Math.floor(k / 3) * 0.15));
  }
  // bàn picnic
  for (const t of OII_STREET.picnicTables) {
    b.box(M.wood, 1.9, 0.07, 0.75, t.x, PAVE_Y + 0.75, t.z);
    for (const dz of [-0.75, 0.75]) b.box(M.wood, 1.9, 0.06, 0.3, t.x, PAVE_Y + 0.45, t.z + dz);
    for (const dx of [-0.75, 0.75]) {
      b.box(M.wood, 0.08, 0.85, 0.08, t.x + dx, PAVE_Y + 0.38, t.z - 0.45, 0.6);
      b.box(M.wood, 0.08, 0.85, 0.08, t.x + dx, PAVE_Y + 0.38, t.z + 0.45, -0.6);
      b.box(M.wood, 0.08, 0.06, 2.0, t.x + dx, PAVE_Y + 0.3, t.z);
    }
  }
}

function roadAndPavements(b: B) {
  const L = 170;
  b.flat(M.road, L, 8, 0, 0, 0);
  for (const s of [-1, 1]) {
    b.box(M.pavement, L, PAVE_Y, 3, 0, PAVE_Y / 2, s * 5.5);
    b.box(M.kerb, L, PAVE_Y + 0.02, 0.22, 0, (PAVE_Y + 0.02) / 2, s * 4.05);
    // vạch vàng đôi (ngắt ở zebra)
    for (const dz of [0.2, 0.36]) {
      const z = s * (4 - dz);
      b.flat(M.lineYellow, OII_STREET.zebraX - 3 + 85, 0.1, (-85 + OII_STREET.zebraX - 3) / 2, 0.006, z);
      b.flat(M.lineYellow, 85 - (OII_STREET.zebraX + 3), 0.1, (85 + OII_STREET.zebraX + 3) / 2, 0.006, z);
    }
    // phía xa ngoài phố: nền nhà
    b.box(M.pavement, L, 0.1, 30, 0, 0.05, s * 22);
  }
  // vạch trắng đứt giữa đường
  for (let x = -84; x < 84; x += 6) {
    if (Math.abs(x - OII_STREET.zebraX) < 4) continue;
    b.flat(M.lineWhite, 3, 0.12, x, 0.007, 0);
  }
  // zebra: vạch song song chiều xe chạy
  for (let z = -3.5; z <= 3.6; z += 1) b.flat(M.lineWhite, 3, 0.5, OII_STREET.zebraX, 0.008, z);
  // vũng nước
  for (const p of OII_STREET.puddles) {
    const y = Math.abs(p.z) > 4 ? PAVE_Y + 0.004 : 0.01;
    b.add(
      M.puddle,
      new THREE.CircleGeometry(1, 14),
      p.x,
      y,
      p.z,
      -Math.PI / 2,
      0,
      0,
      p.r * 1.3,
      p.r * 0.8,
      1,
    );
  }
  // lá vàng tháng 11
  const rnd = mulberry32(11);
  for (let i = 0; i < 260; i++) {
    const nearTree = OII_STREET.trees[i % OII_STREET.trees.length]!;
    const spread = i % 3 === 0 ? 30 : 4;
    const x = nearTree.x + (rnd() - 0.5) * spread;
    const z = i % 3 === 0 ? (rnd() < 0.5 ? -1 : 1) * (3.6 + rnd() * 3.2) : nearTree.z + (rnd() - 0.5) * 4;
    const y = Math.abs(z) > 4 ? PAVE_Y + 0.005 : 0.012;
    b.flat(
      rnd() < 0.5 ? M.leaf0 : M.leaf1,
      0.16,
      0.11,
      x,
      y,
      Math.max(-6.9, Math.min(6.9, z)),
      rnd() * Math.PI,
    );
  }
}

function belishaPoles(b: B) {
  const x = OII_STREET.zebraX - 2.2;
  for (const z of [-4.6, 4.6]) {
    for (let i = 0; i < 8; i++) b.cyl(i % 2 ? M.white : M.black, 0.07, 0.36, x, PAVE_Y + 0.18 + i * 0.36, z);
  }
}

function phoneBox(b: B) {
  const { x, z } = OII_STREET.phoneBox;
  b.box(M.red, 1.0, 2.5, 1.0, x, PAVE_Y + 1.25, z);
  b.box(M.red, 1.1, 0.12, 1.1, x, PAVE_Y + 0.06, z);
  b.box(M.red, 1.1, 0.25, 1.1, x, PAVE_Y + 2.6, z);
  b.cyl(M.red, 0.5, 0.2, x, PAVE_Y + 2.8, z, 0, 0, Math.PI / 2);
  b.box(M.red, 0.2, 0.15, 0.2, x, PAVE_Y + 2.95, z);
  const label = signMaterial("TELEPHONE", { bg: "#111", fg: "#fff", width: 512, height: 64, glowMax: 1 });
  for (const [dx, dz, ry] of [
    [0, -0.56, Math.PI],
    [0, 0.56, 0],
    [-0.56, 0, -Math.PI / 2],
    [0.56, 0, Math.PI / 2],
  ] as const) {
    b.add(label, new THREE.PlaneGeometry(0.8, 0.12), x + dx, PAVE_Y + 2.35, z + dz, 0, ry);
    // ô kính 3×6
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 3; c++) {
        const ox = ry === Math.PI || ry === 0 ? (c - 1) * 0.24 : 0;
        const oz = ry === Math.PI || ry === 0 ? 0 : (c - 1) * 0.24;
        b.box(
          M.glassLit,
          ox ? 0.2 : 0.04,
          0.24,
          oz ? 0.2 : 0.04,
          x + dx * 0.95 + ox,
          PAVE_Y + 0.85 + r * 0.25,
          z + dz * 0.95 + oz,
        );
      }
    }
  }
}

function postbox(b: B) {
  const { x, z } = OII_STREET.postbox;
  b.cyl(M.red, 0.26, 1.15, x, PAVE_Y + 0.58, z);
  b.sphere(M.red, 0.27, x, PAVE_Y + 1.15, z, 0.45);
  b.cyl(M.black, 0.28, 0.12, x, PAVE_Y + 0.06, z);
  b.box(M.black, 0.26, 0.04, 0.05, x, PAVE_Y + 0.95, z - 0.25);
  b.box(M.gold, 0.12, 0.08, 0.03, x, PAVE_Y + 0.75, z - 0.26);
}

function busStop(b: B) {
  const { x0, x1, z } = OII_STREET.busShelter;
  const cx = (x0 + x1) / 2;
  const w = x1 - x0;
  for (const px of [x0, x1]) {
    for (const pz of [z - 0.65, z + 0.65]) b.box(M.metal, 0.08, 2.5, 0.08, px, PAVE_Y + 1.25, pz);
  }
  b.box(M.metal, w + 0.3, 0.1, 1.6, cx, PAVE_Y + 2.55, z);
  b.box(M.shelterGlass, w, 2.0, 0.04, cx, PAVE_Y + 1.25, z + 0.65);
  b.box(M.shelterGlass, 0.04, 2.0, 1.3, x0, PAVE_Y + 1.25, z);
  b.box(M.shelterGlass, 0.04, 2.0, 1.3, x1, PAVE_Y + 1.25, z);
  // ghế
  b.box(M.wood, 4.4, 0.06, 0.4, cx - 0.5, PAVE_Y + 0.45, z + 0.15);
  for (const lx of [cx - 2.5, cx + 1.5]) b.box(M.metal, 0.06, 0.45, 0.3, lx, PAVE_Y + 0.22, z + 0.15);
  // poster OiiMate (vách đông)
  const poster = signMaterial("", {
    bg: "#1d4ed8",
    fg: "#fff",
    width: 256,
    height: 384,
    lines: ["OiiMate", "có người", "để nói", "chuyện 💬"],
    glowMax: 1.1,
  });
  b.add(poster, new THREE.PlaneGeometry(1.0, 1.5), x1 + 0.04, PAVE_Y + 1.35, z, 0, Math.PI / 2);
  // bảng nhiệm vụ (vách tây)
  const quests = signMaterial("", {
    bg: "#f3ead2",
    fg: "#3b2a1a",
    width: 256,
    height: 384,
    border: "#7a5434",
    lines: ["BẢNG", "NHIỆM VỤ", "tuần này", "🛂 sắp có"],
    glowMax: 0.7,
  });
  b.add(quests, new THREE.PlaneGeometry(1.0, 1.5), x0 - 0.04, PAVE_Y + 1.35, z, 0, -Math.PI / 2);
  b.add(quests, new THREE.PlaneGeometry(1.0, 1.5), x0 + 0.04, PAVE_Y + 1.35, z, 0, Math.PI / 2);
  // cột biển tròn N29
  const { x: px, z: pz } = OII_STREET.busPole;
  b.cyl(M.metal, 0.05, 3.0, px, PAVE_Y + 1.5, pz);
  const roundel = signMaterial("", {
    bg: "#fff",
    fg: "#c8102e",
    width: 256,
    height: 256,
    border: "#c8102e",
    lines: ["N29", "· OII ·"],
    glowMax: 0.9,
  });
  for (const ry of [0, Math.PI]) {
    b.add(roundel, new THREE.CircleGeometry(0.38, 20), px, PAVE_Y + 2.85, pz + (ry ? -0.03 : 0.03), 0, ry);
  }
}

function trees(b: B) {
  const rnd = mulberry32(3);
  for (const t of OII_STREET.trees) {
    b.cyl(M.bark, 0.2, 4.4, t.x, PAVE_Y + 2.2, t.z);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + rnd();
      b.cyl(
        M.bark,
        0.07,
        2.2,
        t.x + Math.cos(a) * 0.55,
        PAVE_Y + 5,
        t.z + Math.sin(a) * 0.55,
        Math.sin(a) * 0.6,
        0,
        -Math.cos(a) * 0.6,
      );
    }
    for (let i = 0; i < 9; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 0.6 + rnd() * 1.4;
      const fx = t.x + Math.cos(a) * r;
      const fzz = Math.max(-6.4, Math.min(6.4, t.z + Math.sin(a) * r * 0.8));
      b.sphere(
        rnd() < 0.5 ? M.foliage0 : M.foliage1,
        0.55 + rnd() * 0.5,
        fx,
        PAVE_Y + 5.4 + rnd() * 1.6,
        fzz,
        0.75,
      );
    }
    b.box(M.metal, 1.2, 0.04, 1.2, t.x, PAVE_Y + 0.02, t.z);
  }
}

function lamps(b: B) {
  for (const l of OII_STREET.lamps) {
    const s = Math.sign(l.z);
    b.cyl(M.black, 0.1, 0.6, l.x, PAVE_Y + 0.3, l.z);
    b.cyl(M.black, 0.06, 4.6, l.x, PAVE_Y + 2.6, l.z);
    b.box(M.black, 0.06, 0.06, 0.8, l.x, PAVE_Y + 4.75, l.z - s * 0.35);
    const hz = l.z - s * 0.7;
    b.box(M.black, 0.42, 0.08, 0.42, l.x, PAVE_Y + 4.72, hz);
    b.box(M.lampGlass, 0.32, 0.42, 0.32, l.x, PAVE_Y + 4.45, hz);
    b.box(M.black, 0.36, 0.06, 0.36, l.x, PAVE_Y + 4.22, hz);
  }
}

function cab(b: B) {
  const { x, z } = OII_STREET.cab;
  b.box(M.black, 4.4, 0.8, 1.75, x, 0.65, z);
  b.box(M.black, 2.6, 0.7, 1.6, x - 0.2, 1.38, z);
  b.box(M.busGlass, 2.4, 0.5, 1.62, x - 0.2, 1.4, z);
  b.box(M.taxiSign, 0.4, 0.14, 0.2, x + 0.5, 1.82, z);
  for (const wx of [x - 1.4, x + 1.4]) {
    for (const wz of [z - 0.85, z + 0.85]) b.cyl(M.tyre, 0.36, 0.25, wx, 0.36, wz, Math.PI / 2);
  }
  for (const wz of [z - 0.6, z + 0.6]) {
    b.sphere(M.headlight, 0.12, x + 2.2, 0.8, wz);
    b.box(M.red, 0.05, 0.12, 0.2, x - 2.21, 0.8, wz);
  }
}

/** Nhà ngoài phạm vi đi được (chỉ để phố không bị "cụt" trong sương). */
function outerHouses(b: B) {
  const rnd = mulberry32(99);
  const colors = ["#1f3a5f", "#7a1f2b", "#111111", "#2f6b8a"];
  for (const s of [-1, 1]) {
    for (const [from, to] of [
      [-80, -36],
      [36, 80],
    ] as const) {
      for (let x = from + 2.25; x < to; x += 4.5) {
        house(
          b,
          {
            x,
            width: 4.5,
            number: 0,
            doorColor: colors[Math.floor(rnd() * colors.length)]!,
            brick: Math.floor(rnd() * 3) as 0 | 1 | 2,
            lit: [rnd() < 0.4, rnd() < 0.3, rnd() < 0.3],
          },
          s,
        );
      }
    }
  }
}

export function buildStreet(): THREE.Object3D {
  const b = new StaticBuilder();
  roadAndPavements(b);
  for (const h of OII_STREET.houses) house(b, h, h.side === "north" ? -1 : 1);
  outerHouses(b);
  shop(b);
  pub(b);
  belishaPoles(b);
  phoneBox(b);
  postbox(b);
  busStop(b);
  trees(b);
  lamps(b);
  cab(b);

  // biển số nhà 17
  const h17 = OII_STREET.houses.find((h) => h.side === "north" && h.number === 17)!;
  const plate = signMaterial("17", {
    bg: "#f2efe6",
    fg: "#1f7a3a",
    width: 128,
    height: 128,
    border: "#1f7a3a",
  });
  b.add(plate, new THREE.PlaneGeometry(0.32, 0.32), h17.x - h17.width / 2 + 1.85, PAVE_Y + 1.8, -6.9);

  const group = new THREE.Group();
  group.name = "oii-street-static";
  for (const mesh of b.build()) group.add(mesh);
  return group;
}

/** Mesh bus (toạ độ cục bộ, đầu xe ở −x). */
export function buildBus(): THREE.Object3D {
  const b = new StaticBuilder();
  const L = 11;
  const W = 2.5;
  b.box(M.red, L, 1.9, W, 0, 1.25, 0);
  b.box(M.red, L, 0.25, W, 0, 2.3, 0);
  b.box(M.red, L, 0.5, W, 0, 3.0, 0);
  b.box(M.red, L, 0.25, W, 0, 4.25, 0);
  b.box(M.redDark, L - 0.1, 0.06, W - 0.1, 0, 4.4, 0);
  // kính tầng dưới + tầng trên (trong suốt một phần để thấy người ngồi)
  b.box(M.busGlass, L - 0.6, 0.85, W + 0.02, 0.2, 1.75, 0);
  b.box(M.busGlass, L - 0.4, 0.85, W + 0.02, 0, 3.7, 0);
  // kính đầu xe + bảng điểm đến
  b.box(M.busGlass, 0.04, 1.1, W - 0.3, -L / 2 - 0.01, 1.7, 0);
  b.box(M.busGlass, 0.04, 0.85, W - 0.3, -L / 2 - 0.01, 3.7, 0);
  const blind = signMaterial("N29  OII STREET", {
    bg: "#111",
    fg: "#ffb000",
    width: 512,
    height: 64,
    glowMax: 1.2,
  });
  b.add(blind, new THREE.PlaneGeometry(W - 0.4, 0.3), -L / 2 - 0.03, 3.05, 0, 0, -Math.PI / 2);
  // cửa (phía lề, +z, gần đầu xe)
  b.box(M.busGlass, 1.1, 1.9, 0.04, -4, 1.25, W / 2 + 0.01);
  // quảng cáo OiiMate hai bên
  const ad = signMaterial("", {
    bg: "#ffffff",
    fg: "#1d4ed8",
    width: 1024,
    height: 160,
    lines: ["OiiMate · có người để nói chuyện"],
    glowMax: 0.5,
  });
  b.add(ad, new THREE.PlaneGeometry(6.4, 0.42), 1.4, 3.0, W / 2 + 0.01, 0, 0);
  b.add(ad, new THREE.PlaneGeometry(6.4, 0.42), 1.4, 3.0, -W / 2 - 0.01, 0, Math.PI);
  // bánh xe
  for (const wx of [-3.4, 3.2]) {
    for (const wz of [-W / 2, W / 2]) b.cyl(M.tyre, 0.5, 0.3, wx, 0.5, wz, Math.PI / 2);
  }
  for (const wz of [-0.9, 0.9]) b.sphere(M.headlight, 0.14, -L / 2 - 0.02, 0.75, wz);
  // ghế tầng trên
  for (let i = 0; i < 5; i++) b.box(M.redDark, 0.5, 0.5, W - 0.5, -3.5 + i * 1.8, 2.75, 0);
  const g = new THREE.Group();
  for (const mesh of b.build()) g.add(mesh);
  return g;
}
