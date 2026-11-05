import { useFrame } from "@react-three/fiber";
import {
  BUS_SCENE,
  DECK,
  DECK_HALF_L,
  DECK_HALF_W,
  DECK_ZONES,
  STATION_SPOTS,
  type ZoneId,
} from "@oii-bus/world";
import { STATION_IDS } from "@oii-bus/shared";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFarm } from "../game/farm";
import { GROUND } from "./landmarks";
import { C, cel, glow, mat, metal, shiny, texMat } from "./materials";
import { BRAND, floorLogoMaterial, logoMaterial } from "./oiiLogo";
import { signMaterial } from "./signs";
import { StaticBuilder } from "./StaticBuilder";

/**
 * Tầng thượng duy nhất của Oii-Bus: một sàn siêu to chia thành các khu, mỗi khu có biển logo OiiMate.
 * Toàn bộ đồ tĩnh gộp vào một StaticBuilder (ít draw call, máy yếu vẫn chạy).
 */

export const HALF_L = DECK_HALF_L + 0.6;
export const HALF_W = DECK_HALF_W + 0.4;
const G = GROUND;
const D = DECK;

const RED = "#b8322f";
const RED_DARK = "#8f2522";
const ROOF = "#3f6b5c";
const ROOF_EDGE = "#2f5448";
const WALL = "#f2d98b";
const GOLD = "#e3b23c";
const BRONZE = "#8a6a3b";

type B = StaticBuilder;

/** Sàn riêng cho từng khu để nhìn là biết đang ở đâu. */
const ZONE_FLOORS: Record<ZoneId, () => THREE.Material> = {
  temple: () => texMat("flagstone", "#ddd5c4", 6, 9),
  deadline: () => mat("#dcefe6"),
  nails: () => texMat("flagstone", "#fbe3ea", 6, 9),
  plaza: () => texMat("planks", C.deck, 6, 10),
  viet: () => texMat("flagstone", "#f6ead2", 8, 9),
  tea: () => mat("#e5f3f5"),
  front: () => texMat("planks", C.deck, 6, 10),
};

function sign(b: B, m: THREE.Material, w: number, h: number, x: number, y: number, z: number, ry = 0) {
  b.add(m, new THREE.PlaneGeometry(w, h), x, y, z, 0, ry, 0);
}

/** Biển logo lớn treo trên khung ở phía sau mỗi khu. */
function shopSign(b: B, x: number, z: number, title: string, sub: string, accent: string = BRAND.teal) {
  const post = metal(C.ink);
  for (const dx of [-3.4, 3.4]) b.cyl(post, 0.08, 4.4, x + dx, 2.2, z);
  b.box(mat(accent), 7.2, 1.9, 0.12, x, 4.1, z - 0.04);
  sign(b, logoMaterial({ title, sub, accent }), 7, 1.75, x, 4.1, z + 0.04);
}

/** Mái cong kiểu chùa Việt: hai mái dốc, bờ nóc, đầu đao cong ở bốn góc. */
function curvedRoof(b: B, x: number, y: number, z: number, w: number, d: number, h: number) {
  const roof = mat(ROOF, 0.7);
  const edge = mat(ROOF_EDGE, 0.7);
  const half = d / 2;
  const slope = Math.atan2(h, half);
  const len = Math.hypot(h, half) + 0.4;
  for (const s of [-1, 1]) {
    b.box(roof, w, 0.22, len, x, y + h / 2, z + s * (half / 2), s * slope);
    b.box(edge, w + 0.2, 0.18, 0.3, x, y - 0.05, z + s * (half + 0.15));
  }
  b.box(edge, w + 0.6, 0.35, 0.45, x, y + h + 0.1, z);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1])
      b.add(
        edge,
        new THREE.ConeGeometry(0.16, 1.4, 6),
        x + sx * (w / 2 + 0.35),
        y + 0.45,
        z + sz * (half + 0.1),
        sz * -0.5,
        0,
        sx * -0.9,
      );
  }
  b.sphere(mat(GOLD, 0.4, 0.4), 0.35, x, y + h + 0.65, z);
}

function buildBody(b: B) {
  const body = mat(C.bus);
  b.box(body, HALF_L * 2, -G - 0.9, HALF_W * 2, 0, (G + 0.9) / 2, 0);
  b.box(mat(C.cream), HALF_L * 2 + 0.02, 0.35, HALF_W * 2 + 0.02, 0, G + 2.0, 0);
  b.box(mat(C.busDark), HALF_L * 2 + 0.04, 0.3, HALF_W * 2 + 0.04, 0, G + 0.95, 0);
  for (let x = -HALF_L + 2; x < HALF_L - 2; x += 2.6)
    for (const s of [-1, 1])
      b.box(glow("#ffe2a8", 0.45, 1.1), 2.0, 1.2, 0.06, x + 1, G + 3.1, s * (HALF_W + 0.01));
  // kính chắn gió + bảng điểm đến
  b.box(shiny(C.glass), 0.08, 1.8, HALF_W * 2 - 2, HALF_L + 0.01, G + 3.0, 0);
  sign(
    b,
    signMaterial("", { bg: BRAND.navy, fg: BRAND.yellow, lines: ["Oii-Bus · VÒNG QUANH UK"] }),
    7,
    1.1,
    HALF_L + 0.05,
    G + 4.1,
    0,
    Math.PI / 2,
  );
  for (const z of [-HALF_W + 1.5, HALF_W - 1.5])
    b.sphere(glow("#fff6d6", 0.5, 1.2), 0.5, HALF_L + 0.05, G + 1.5, z);
  // logo OiiMate dọc thân xe, cả hai bên
  for (const s of [-1, 1])
    for (const x of [-30, -10, 10, 30])
      sign(
        b,
        logoMaterial({ title: "Oii-Bus", sub: "by OiiMate" }),
        9,
        2.25,
        x,
        G + 2.3,
        s * (HALF_W + 0.05),
        s < 0 ? Math.PI : 0,
      );

  // sàn từng khu
  b.box(mat(C.deck), HALF_L * 2, 0.2, HALF_W * 2, 0, -0.1, 0);
  for (const [id, z] of Object.entries(DECK_ZONES) as [ZoneId, { minX: number; maxX: number }][]) {
    const minX = id === "temple" ? -HALF_L : z.minX;
    const maxX = id === "front" ? HALF_L : z.maxX;
    b.box(ZONE_FLOORS[id](), maxX - minX, 0.02, HALF_W * 2 - 0.3, (minX + maxX) / 2, 0.01, 0);
    // vạch ranh giới giữa các khu
    if (id !== "temple") b.box(mat(BRAND.teal), 0.12, 0.025, HALF_W * 2 - 0.3, minX, 0.015, 0);
  }

  // lan can thấp quanh sàn
  const rail = metal(C.rail);
  const wall = mat(C.bus);
  for (const s of [-1, 1]) {
    b.box(rail, HALF_L * 2, 0.12, 0.12, 0, 0.95, s * HALF_W);
    b.box(wall, HALF_L * 2, 0.5, 0.12, 0, 0.25, s * HALF_W);
    for (let x = -HALF_L; x <= HALF_L; x += 2) b.cyl(rail, 0.05, 0.95, x, 0.47, s * HALF_W);
    b.box(rail, 0.12, 0.12, HALF_W * 2, s * HALF_L, 0.95, 0);
    b.box(wall, 0.12, 0.5, HALF_W * 2, s * HALF_L, 0.25, 0);
  }
  // cờ logo OiiMate phía xa + đèn dây
  for (let x = -HALF_L + 4; x < HALF_L - 2; x += 8) {
    b.cyl(metal(C.ink), 0.05, 3.2, x, 1.6, -HALF_W);
    sign(b, logoMaterial({ badge: true }), 1.3, 1.3, x + 0.7, 2.6, -HALF_W + 0.02);
  }
  const bulb = glow("#fff3b0", 0.3, 1.4);
  for (let x = -HALF_L + 0.5; x < HALF_L; x += 1.4) b.sphere(bulb, 0.06, x, 2.3, -HALF_W);
  b.box(mat(C.ink), HALF_L * 2, 0.02, 0.02, 0, 2.35, -HALF_W);
  // chậu cây dọc phía gần (thấp, không che)
  for (let x = -HALF_L + 3; x < HALF_L - 2; x += 7) {
    b.cyl(mat(C.peach), 0.3, 0.45, x, 0.22, HALF_W - 0.6);
    b.sphere(mat(C.leaf), 0.4, x, 0.66, HALF_W - 0.6);
  }
}

function buildFront(b: B) {
  // khung ảnh ở mũi xe
  const fx = D.photo.x + 1.4;
  b.box(mat(C.white), 0.15, 2.8, 3.4, fx, 1.6, 0);
  b.box(mat(C.lemon), 0.18, 2.2, 2.8, fx - 0.01, 1.7, 0);
  sign(
    b,
    logoMaterial({ title: "📸 Chụp ảnh", sub: "với địa danh UK" }),
    2.6,
    0.65,
    fx - 0.11,
    1.75,
    0,
    -Math.PI / 2,
  );
  // karaoke
  const k = D.karaoke;
  b.box(mat(C.oiiBlue), 0.8, 1.0, 0.6, k.x, 0.5, k.z);
  b.cyl(mat("#6b5b7b"), 0.22, 0.02, k.x, 0.65, k.z - 0.31, Math.PI / 2);
  b.cyl(mat(C.ink), 0.03, 1.3, k.x - 0.8, 0.65, k.z - 0.3);
  b.sphere(mat("#c0c0d0"), 0.08, k.x - 0.8, 1.33, k.z - 0.3);
  sign(
    b,
    signMaterial("🎤 Karaoke", { bg: "#b77cff", fg: "#ffffff" }),
    1.2,
    0.3,
    k.x,
    1.2,
    k.z - 0.32,
    Math.PI,
  );
  // bảng "Cùng thành phố"
  const m = D.meetupBoard;
  b.box(mat(C.woodDark), 2, 1.4, 0.14, m.x, 1.5, m.z);
  for (const dx of [-0.8, 0.8]) b.cyl(mat(C.woodDark), 0.05, 0.9, m.x + dx, 0.45, m.z);
  sign(
    b,
    signMaterial("", { bg: "#fff4e0", fg: C.ink, lines: ["🏙️ Cùng thành phố", "rủ nhau đi chơi"] }),
    1.8,
    1.1,
    m.x,
    1.5,
    m.z + 0.08,
  );
}

function buildTea(b: B) {
  const t = D.teaBar;
  b.box(mat(BRAND.teal), t.w, 1.0, t.d, t.x, 0.5, t.z);
  b.box(mat(C.white), t.w + 0.1, 0.08, t.d + 0.1, t.x, 1.04, t.z);
  b.box(mat("#d9ecf2"), t.w + 1, 3, 0.3, t.x, 1.5, t.z - 1.3);
  const cups = ["#f3d9b1", "#d9b8ff", "#ffc7d1", "#bfe8d6", "#fde3a0"];
  for (let i = 0; i < 10; i++) {
    const x = t.x - t.w / 2 + 0.5 + i * 0.65;
    b.cyl(mat(cups[i % cups.length]!), 0.12, 0.3, x, 1.23, t.z + 0.3);
    b.cyl(mat(C.ink), 0.015, 0.25, x + 0.03, 1.48, t.z + 0.3);
  }
  // cốc trà sữa khổng lồ trên nóc quầy
  b.cyl(shiny("#f3d9b1"), 0.7, 1.8, t.x + 2.6, 2.0, t.z - 1);
  b.cyl(mat("#3b2a22"), 0.65, 0.3, t.x + 2.6, 1.25, t.z - 1);
  b.cyl(mat(C.white), 0.75, 0.15, t.x + 2.6, 2.95, t.z - 1);
  b.cyl(mat("#ff8fab"), 0.08, 1.4, t.x + 2.8, 3.5, t.z - 1, 0, 0, 0.2);
  shopSign(b, t.x - 0.6, t.z - 1.6, "Oii Tea", "Trà sữa trân châu · £3.80", "#ff8fab");
  for (const dx of [-2.4, 0, 2.4]) {
    b.cyl(mat(C.ink), 0.05, 0.7, t.x + dx, 0.35, t.z + 2.4);
    b.cyl(mat("#ff8fab"), 0.3, 0.08, t.x + dx, 0.72, t.z + 2.4);
  }
}

function buildViet(b: B) {
  const k = D.phoCounter;
  b.box(mat("#c7553f"), k.w, 1.0, k.d, k.x, 0.5, k.z);
  b.box(mat(BRAND.yellow), k.w + 0.1, 0.08, k.d + 0.1, k.x, 1.04, k.z);
  // tường bếp + thực đơn
  b.box(mat("#fff4e0"), k.w + 1.5, 3.2, 0.3, k.x, 1.6, k.z - 1.3);
  const menu = signMaterial("", {
    bg: BRAND.navy,
    fg: BRAND.yellow,
    width: 512,
    height: 384,
    lines: ["THỰC ĐƠN", "Phở bò  £9.50", "Bún chả  £10", "Bánh mì  £6"],
  });
  for (const dx of [-3.8, 3.8]) sign(b, menu, 2.2, 1.65, k.x + dx, 1.9, k.z - 1.13);
  // nồi phở to + chồng bát
  for (const dx of [-2.6, -1.2]) {
    b.cyl(metal("#c0c4cc"), 0.5, 0.7, k.x + dx, 1.43, k.z);
    b.cyl(mat("#c98a4b"), 0.46, 0.02, k.x + dx, 1.79, k.z);
  }
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4 + (i % 2); j++)
      b.cyl(mat(C.white), 0.22, 0.1, k.x + 1 + i * 0.6, 1.13 + j * 0.11, k.z + 0.1);
  b.box(mat("#7fb069"), 0.6, 0.15, 0.4, k.x + 3.9, 1.15, k.z); // rau thơm
  shopSign(b, k.x, k.z - 1.5, "Oii Viet", "Phở · Bún · Bánh mì", "#c7553f");
  // đèn lồng vàng
  for (let x = k.x - 5; x <= k.x + 5; x += 2.5) {
    b.cyl(mat(C.ink), 0.01, 0.6, x, 3.0, k.z + 1.2);
    b.sphere(glow("#ffcf5a", 0.5, 1.2), 0.28, x, 2.6, k.z + 1.2, 1.2);
  }
  // bàn ăn + ghế nhựa đỏ huyền thoại
  for (const t of D.phoTables) {
    b.box(mat(C.wood), 1.2, 0.08, 1.2, t.x, 0.75, t.z);
    b.cyl(mat(C.woodDark), 0.08, 0.75, t.x, 0.37, t.z);
    b.cyl(mat(C.white), 0.18, 0.08, t.x, 0.82, t.z);
  }
  for (const s of BUS_SCENE.seats.filter((s) => s.id.startsWith("table"))) {
    b.box(mat("#e0453a"), 0.45, 0.4, 0.45, s.x, 0.2, s.z);
  }
  // nồi lẩu chung
  const h = D.hotpot;
  b.cyl(mat(C.wood), 0.9, 0.08, h.x, 0.72, h.z);
  b.cyl(mat(C.woodDark), 0.12, 0.7, h.x, 0.35, h.z);
  b.cyl(metal("#c0c4cc"), 0.42, 0.25, h.x, 0.88, h.z);
  b.cyl(mat("#ff8a5c"), 0.38, 0.02, h.x, 1.0, h.z);
  for (const s of BUS_SCENE.seats.filter((s) => s.id.startsWith("hotpot")))
    b.cyl(mat("#e0453a"), 0.25, 0.42, s.x, 0.21, s.z);
  sign(
    b,
    signMaterial("🍲 Lẩu chung", { bg: BRAND.yellow, fg: BRAND.navy }),
    1.4,
    0.35,
    h.x,
    0.5,
    h.z + 0.92,
  );
}

function buildPlaza(b: B) {
  b.flat(floorLogoMaterial(), 8, 8, 0, 0.03, 0.5);
  const s = D.statue;
  // bệ "Máy farm công đức"
  b.box(mat(BRAND.teal), 2.6, 0.9, 2.2, s.x, 0.45, s.z);
  b.box(mat(BRAND.mint), 2.8, 0.12, 2.4, s.x, 0.95, s.z);
  sign(
    b,
    signMaterial("", {
      bg: BRAND.navy,
      fg: BRAND.yellow,
      lines: ["⚙️ Máy farm công đức", "treo máy · vẫn lên cấp"],
    }),
    2.4,
    0.7,
    s.x,
    0.48,
    s.z + 1.12,
  );
  // đèn quanh bệ
  for (const dx of [-1.6, 1.6]) {
    b.cyl(metal(C.ink), 0.06, 2.4, s.x + dx, 1.2, s.z + 1.3);
    b.sphere(glow(BRAND.yellow, 0.5, 1.3), 0.25, s.x + dx, 2.5, s.z + 1.3);
  }
  // ghế đá quanh quảng trường
  for (const [x, z] of [
    [-4.5, 4.5],
    [4.5, 4.5],
  ] as const) {
    b.box(mat(C.stone), 2, 0.45, 0.6, x, 0.22, z);
  }
}

function buildNails(b: B) {
  const n = D.nailBar;
  const sh = D.nailShelf;
  b.box(mat("#f6b3c2"), n.w, 0.9, n.d, n.x, 0.45, n.z);
  b.box(mat(C.white), n.w + 0.1, 0.08, n.d + 0.1, n.x, 0.94, n.z);
  // kệ sơn móng: hàng trăm lọ nhiều màu
  b.box(mat(C.white), sh.w, 3, sh.d, sh.x, 1.5, sh.z);
  const polish = [
    "#e85d6a",
    "#f6b3c2",
    "#b77cff",
    "#a8d3d9",
    "#fde3a0",
    "#4e9297",
    "#1f2d4d",
    "#ff8a5c",
    "#c5e3b0",
  ];
  for (let r = 0; r < 4; r++) {
    b.box(mat("#f3e6ef"), sh.w - 0.2, 0.05, 0.4, sh.x, 0.7 + r * 0.6, sh.z + 0.3);
    for (let i = 0; i < 22; i++) {
      const x = sh.x - sh.w / 2 + 0.4 + i * 0.52;
      b.cyl(shiny(polish[(i + r * 3) % polish.length]!), 0.07, 0.22, x, 0.84 + r * 0.6, sh.z + 0.35);
    }
  }
  // 3 máy hơ gel phát sáng tím + tay mẫu
  for (const dx of [-3, 0, 3]) {
    b.box(glow("#d6a8ff", 0.6, 1.2), 0.6, 0.25, 0.4, n.x + dx, 1.1, n.z - 0.2);
    b.sphere(cel(C.skin), 0.16, n.x + dx + 0.6, 1.05, n.z + 0.1, 0.5);
    b.box(mat("#ffffff"), 0.5, 0.03, 0.35, n.x + dx + 0.6, 0.99, n.z + 0.1);
  }
  // ghế khách hồng
  for (const dx of [-3, 0, 3]) {
    b.cyl(metal("#d0d4dc"), 0.05, 0.4, n.x + dx, 0.2, n.z + 2.6);
    b.cyl(mat("#f6b3c2"), 0.32, 0.12, n.x + dx, 0.45, n.z + 2.6);
  }
  shopSign(b, n.x, sh.z + 0.6, "OiiNails", "Nails · Mi · Gội đầu", "#e86a92");
}

function buildDeadline(b: B) {
  const d = D.studyDesk;
  const sh = D.shelves;
  b.box(mat(C.wood), d.w, 0.08, d.d, d.x, 0.78, d.z);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.cyl(mat(C.woodDark), 0.05, 0.78, d.x + sx * (d.w / 2 - 0.2), 0.39, d.z + sz * 0.5);
  // laptop sáng màn hình + cốc cà phê + chồng sách
  for (const dx of [-2.2, 0, 2.2]) {
    b.box(mat("#c9ced6"), 0.7, 0.03, 0.5, d.x + dx, 0.83, d.z + 0.1);
    b.box(glow("#bfe3ff", 0.6, 1.1), 0.7, 0.45, 0.03, d.x + dx, 1.06, d.z - 0.15, -0.2);
    b.cyl(mat(C.white), 0.08, 0.14, d.x + dx + 0.55, 0.89, d.z + 0.15);
  }
  for (let i = 0; i < 5; i++)
    b.box(
      mat(["#a8d3d9", "#fde3a0", "#f6b3c2", "#1f2d4d", "#dcefe6"][i]!),
      0.5,
      0.1,
      0.35,
      d.x - 3,
      0.88 + i * 0.1,
      d.z,
      0,
      i * 0.2,
    );
  // kệ sách
  b.box(mat(C.woodDark), sh.w, 3, sh.d, sh.x, 1.5, sh.z);
  const books = ["#a8d3d9", "#fde3a0", "#4e9297", "#dcefe6", "#1f2d4d", "#f6c6cf", "#ffd2b5"];
  for (let r = 0; r < 4; r++)
    for (let i = 0; i < 26; i++)
      b.box(
        mat(books[(i * 3 + r) % books.length]!),
        0.24,
        0.45 + ((i * 7) % 3) * 0.06,
        0.4,
        sh.x - sh.w / 2 + 0.4 + i * 0.32,
        0.55 + r * 0.66,
        sh.z + 0.2,
      );
  // đồng hồ 23:59
  sign(b, signMaterial("⏰ 23:59", { bg: BRAND.navy, fg: "#ff8a8a" }), 1.6, 0.4, d.x, 3.1, sh.z + 0.42);
  shopSign(b, d.x, sh.z + 0.6, "Góc Deadline", "Essay nộp lúc 23:59", BRAND.navy);
  // đèn bàn
  for (const dx of [-3.4, 3.4]) {
    b.cyl(metal(C.ink), 0.03, 0.5, d.x + dx, 1.07, d.z - 0.3);
    b.add(glow("#fff1c4", 0.6, 1.2), new THREE.ConeGeometry(0.18, 0.2, 8), d.x + dx, 1.35, d.z - 0.3);
  }
}

function buildTemple(b: B) {
  const h = D.hall;
  b.box(mat("#cdbf9f"), h.w + 1, 0.5, h.d + 1, h.x, 0.25, h.z);
  b.box(mat(WALL), h.w, 3.4, h.d, h.x, 2.2, h.z);
  for (let i = 0; i < 6; i++)
    b.cyl(mat(RED, 0.5), 0.22, 3.6, h.x - h.w / 2 + 0.6 + i * ((h.w - 1.2) / 5), 2.1, h.z + h.d / 2 + 0.1);
  for (const dx of [-3, 0, 3]) {
    b.box(mat(RED, 0.55), 1.8, 2.4, 0.15, h.x + dx, 1.7, h.z + h.d / 2 + 0.02);
    b.box(glow("#ffcf7a", 0.6, 1.1), 1.3, 1.9, 0.1, h.x + dx, 1.7, h.z + h.d / 2 + 0.08);
  }
  curvedRoof(b, h.x, 4, h.z, h.w + 1.6, h.d + 2, 1.6);
  sign(
    b,
    signMaterial("", {
      bg: RED_DARK,
      fg: "#f2c14e",
      border: "#f2c14e",
      lines: ["CHÙA CẦU DUYÊN"],
      font: 'bold 64px "Nunito", serif',
    }),
    4.4,
    0.8,
    h.x,
    3.45,
    h.z + h.d / 2 + 0.25,
  );
  // mõ gỗ to
  const m = D.moStand;
  b.box(mat(RED, 0.5), m.w, 0.7, m.d, m.x, 0.35, m.z);
  b.box(mat(GOLD, 0.4, 0.4), m.w + 0.1, 0.06, m.d + 0.1, m.x, 0.72, m.z);
  b.sphere(mat("#9a5b2e", 0.5), 0.55, m.x, 1.15, m.z, 0.75);
  b.box(mat("#5a3416"), 0.6, 0.06, 0.12, m.x, 1.38, m.z + 0.3);
  sign(
    b,
    signMaterial("🪵 Gõ mõ", { bg: RED_DARK, fg: "#f2c14e" }),
    1.2,
    0.3,
    m.x,
    0.4,
    m.z + m.d / 2 + 0.02,
  );
  // lư hương
  const ic = D.incense;
  b.cyl(mat(BRONZE, 0.45, 0.5), 0.75, 0.75, ic.x, 0.9, ic.z);
  b.cyl(mat(BRONZE, 0.45, 0.5), 0.3, 0.55, ic.x, 0.28, ic.z);
  b.cyl(mat("#cbbd9f"), 0.68, 0.04, ic.x, 1.28, ic.z);
  for (let i = 0; i < 7; i++)
    b.cyl(mat("#c4473a"), 0.015, 0.6, ic.x - 0.3 + i * 0.1, 1.58, ic.z + Math.sin(i) * 0.15);
  // miếu Ông Tơ Bà Nguyệt
  const mm = D.matchmaker;
  b.box(mat(RED, 0.5), 2.6, 1.0, 1.4, mm.x, 0.5, mm.z);
  b.box(mat(WALL), 1.8, 1.4, 1.0, mm.x, 1.7, mm.z - 0.1);
  curvedRoof(b, mm.x, 2.5, mm.z - 0.1, 2.4, 1.6, 0.6);
  sign(
    b,
    signMaterial("", { bg: RED_DARK, fg: "#ffd7d7", lines: ["💞 Ông Tơ Bà Nguyệt", "xin quẻ se duyên"] }),
    1.7,
    0.6,
    mm.x,
    1.75,
    mm.z + 0.42,
  );
  // chuông
  const bl = D.bell;
  for (const dx of [-0.55, 0.55]) b.box(mat(RED_DARK), 0.14, 2.6, 0.14, bl.x + dx, 1.3, bl.z);
  b.box(mat(RED_DARK), 1.4, 0.16, 0.2, bl.x, 2.6, bl.z);
  b.add(mat(BRONZE, 0.4, 0.6), new THREE.CylinderGeometry(0.32, 0.48, 1, 14), bl.x, 1.95, bl.z);
  // hòm công đức
  const dn = D.donate;
  b.box(mat(RED, 0.5), 1.0, 0.8, 0.7, dn.x, 0.4, dn.z);
  b.box(mat(GOLD, 0.4, 0.4), 0.5, 0.04, 0.08, dn.x, 0.81, dn.z);
  sign(b, signMaterial("Công đức", { bg: RED_DARK, fg: "#f2c14e" }), 0.9, 0.25, dn.x, 0.45, dn.z + 0.36);
  // cây duyên buộc chỉ đỏ
  const wt = D.wishTree;
  b.cyl(mat(C.woodDark), 0.25, 2.2, wt.x, 1.1, wt.z);
  b.sphere(mat("#6fbf73"), 1.4, wt.x, 2.8, wt.z, 0.8);
  for (let i = 0; i < 12; i++) {
    const a = i * 2.1;
    b.box(mat("#e03b3b"), 0.04, 0.5, 0.04, wt.x + Math.cos(a) * 1.1, 2.0, wt.z + Math.sin(a) * 1.1);
  }
  // đèn lồng hoa sen treo phía trên sân chùa
  const lantern = ["#f7a8c0", "#fde3a0", "#a8d3d9", "#c5e3b0", "#f6c6cf"];
  let k = 0;
  for (const z of [-4.2, -2]) {
    b.box(metal("#5a4636"), 12.4, 0.015, 0.015, -37.5, 3.75, z);
    for (let x = -43.5; x <= -31.5; x += 1.2) {
      const sag = Math.cos(((x + 37.5) / 6) * (Math.PI / 2)) * 0.35;
      b.sphere(glow(lantern[k++ % lantern.length]!, 0.45, 1.1), 0.15, x, 3.6 - sag, z, 1.15);
    }
  }
  // bồ đoàn tụng kinh
  for (const x of D.cushions.xs) b.cyl(mat(GOLD, 0.7), 0.4, 0.18, x, 0.09, D.cushions.z);
}

function buildDeck(): THREE.Group {
  const b = new StaticBuilder();
  buildBody(b);
  buildFront(b);
  buildTea(b);
  buildViet(b);
  buildPlaza(b);
  buildNails(b);
  buildDeadline(b);
  buildTemple(b);
  const g = new THREE.Group();
  for (const m of b.build()) {
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  }
  return g;
}

/** Hơi nước / khói bay lên (nồi phở, lẩu, lư hương). */
function Puffs({
  x,
  y,
  z,
  color = "#ffffff",
  n = 4,
  rise = 1.2,
  speed = 0.5,
}: {
  x: number;
  y: number;
  z: number;
  color?: string;
  n?: number;
  rise?: number;
  speed?: number;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const t = (clock.elapsedTime * speed + i / n) % 1;
      m.position.set(x + Math.sin(i * 2 + t * 3) * 0.15, y + t * rise, z);
      m.scale.setScalar(0.1 + t * 0.25);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - t);
    });
  });
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} ref={(el) => void (refs.current[i] = el)}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

/** Tượng mascot OiiMate trên "Máy farm công đức": nhún nhảy, quay chậm. */
function Statue() {
  const ref = useRef<THREE.Group>(null);
  const afk = useFarm((s) => s.afk);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!ref.current) return;
    ref.current.position.y = 1.9 + Math.sin(t * (afk ? 6 : 2)) * 0.12;
    ref.current.rotation.y = Math.sin(t * 0.6) * 0.5;
  });
  const s = D.statue;
  return (
    <group position={[s.x, 1.9, s.z]} ref={ref}>
      <mesh material={cel(BRAND.blue)} position={[-0.45, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.85, 24, 18]} />
      </mesh>
      <mesh material={cel(BRAND.yellow)} position={[0.55, 0, 0.25]} castShadow>
        <sphereGeometry args={[0.72, 24, 18]} />
      </mesh>
      {[
        [-0.7, 0.35, 0.78],
        [-0.25, 0.35, 0.8],
        [0.35, 0.1, 0.93],
        [0.75, 0.1, 0.9],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x!, y!, z!]} material={cel(BRAND.navy)}>
          <sphereGeometry args={[0.08, 10, 8]} />
        </mesh>
      ))}
    </group>
  );
}

const HELPER_COLORS = [BRAND.blue, BRAND.yellow, "#f6b3c2", "#dcefe6"];
const MAX_HELPERS_SHOWN = 4;
const helperBody = new THREE.SphereGeometry(0.4, 14, 10);
const helperEye = new THREE.SphereGeometry(0.05, 6, 4);

/**
 * Người giúp (đã thuê) đứng sau quầy và nhún nhảy làm việc: nhìn là thấy "máy" đang chạy.
 * Vẽ bằng InstancedMesh (2 draw call cho tất cả) để máy yếu vẫn mượt.
 */
function Helpers() {
  const helpers = useFarm((s) => s.farm.helpers);
  const afk = useFarm((s) => s.afk);
  const bodies = useRef<THREE.InstancedMesh>(null);
  const eyes = useRef<THREE.InstancedMesh>(null);
  const list = useMemo(
    () =>
      STATION_IDS.flatMap((id) => {
        const n = Math.min(MAX_HELPERS_SHOWN, helpers[id]);
        const sp = STATION_SPOTS[id];
        return Array.from({ length: n }, (_, i) =>
          id === "mo"
            ? { x: sp.x + 1.8 + i * 0.5, z: sp.z - 0.6 + i * 0.9, c: i }
            : { x: sp.x + (i - (n - 1) / 2) * 1.4, z: sp.z - 3.1, c: i + 1 },
        );
      }),
    [helpers],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * (afk ? 2 : 1);
    const b = bodies.current;
    const e = eyes.current;
    if (!b || !e) return;
    list.forEach((h, i) => {
      const y = 0.55 + Math.abs(Math.sin(t * 5 + i * 1.3)) * 0.18;
      dummy.position.set(h.x, y, h.z);
      dummy.rotation.set(0, 0, Math.sin(t * 5 + i) * 0.12);
      dummy.updateMatrix();
      b.setMatrixAt(i, dummy.matrix);
      b.setColorAt(i, color.set(HELPER_COLORS[h.c % HELPER_COLORS.length]!));
      for (const s of [0, 1]) {
        dummy.position.set(h.x + (s ? 0.13 : -0.13), y + 0.06, h.z + 0.37);
        dummy.updateMatrix();
        e.setMatrixAt(i * 2 + s, dummy.matrix);
      }
    });
    b.count = list.length;
    e.count = list.length * 2;
    b.instanceMatrix.needsUpdate = true;
    e.instanceMatrix.needsUpdate = true;
    if (b.instanceColor) b.instanceColor.needsUpdate = true;
  });
  const max = STATION_IDS.length * MAX_HELPERS_SHOWN;
  return (
    <>
      <instancedMesh ref={bodies} args={[helperBody, cel("#ffffff"), max]} frustumCulled={false} castShadow />
      <instancedMesh ref={eyes} args={[helperEye, cel(BRAND.navy), max * 2]} frustumCulled={false} />
    </>
  );
}

export function Deck() {
  const deck = useMemo(() => buildDeck(), []);
  const k = D.phoCounter;
  return (
    <>
      <primitive object={deck} />
      <Statue />
      <Helpers />
      <Puffs x={k.x - 1.9} y={1.8} z={k.z} n={3} />
      <Puffs x={D.hotpot.x} y={1.1} z={D.hotpot.z} n={3} />
      <Puffs x={D.incense.x} y={1.9} z={D.incense.z} color="#f4f1ea" n={4} rise={2.4} speed={0.25} />
      <pointLight
        position={[D.incense.x, 2.4, D.incense.z]}
        color="#ffb060"
        intensity={4}
        distance={7}
        decay={1.6}
      />
    </>
  );
}
