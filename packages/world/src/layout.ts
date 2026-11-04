import type { AABB } from "./coords";

/**
 * Oii Street (brief §7). Dữ liệu thuần, dùng chung client (render + dự đoán) và server (validate).
 * Phía nam (z > 0) từ tây sang đông: nhà · Oii Express · zebra · bốt điện thoại · bến bus · hòm thư · pub · nhà.
 * Phía bắc (z < 0): dãy terraced, nhà số 17 cửa xanh lá.
 */

export type SpotKind =
  | "phone-box"
  | "postbox"
  | "shop"
  | "npc-dave"
  | "door-17"
  | "pub-door"
  | "quest-board"
  | "seat"
  | "bus-door";

export interface Spot {
  id: string;
  kind: SpotKind;
  x: number;
  z: number;
  /** Bán kính bấm E được. */
  radius: number;
  seatId?: string;
}

export interface Seat {
  id: string;
  x: number;
  z: number;
  /** Hướng nhìn khi ngồi (radian quanh y; 0 = nhìn về +z). */
  ry: number;
  y: number;
}

export interface House {
  side: "north" | "south";
  x: number;
  width: number;
  number: number;
  doorColor: string;
  brick: 0 | 1 | 2;
  /** Ô cửa sổ sáng đèn: [tầng trệt, tầng 1 trái, tầng 1 phải]. */
  lit: [boolean, boolean, boolean];
}

export interface Lamp {
  x: number;
  z: number;
  /** Có PointLight thật (tối đa 6–8 đèn cho cả phố). */
  light: boolean;
}

export interface Range {
  x0: number;
  x1: number;
}

export interface WorldLayout {
  houses: House[];
  shop: Range;
  pub: Range;
  zebraX: number;
  phoneBox: { x: number; z: number };
  postbox: { x: number; z: number };
  busShelter: Range & { z: number };
  busPole: { x: number; z: number };
  busStopX: number;
  picnicTables: { x: number; z: number }[];
  trees: { x: number; z: number }[];
  lamps: Lamp[];
  cab: { x: number; z: number; ry: number };
  dave: { x: number; z: number };
  aBoard: { x: number; z: number };
  fruitCrates: { x: number; z: number };
  puddles: { x: number; z: number; r: number }[];
  colliders: AABB[];
  spots: Spot[];
  seats: Seat[];
  spawn: { x: number; z: number; ry: number };
}

const box = (cx: number, cz: number, w: number, d: number): AABB => ({
  minX: cx - w / 2,
  maxX: cx + w / 2,
  minZ: cz - d / 2,
  maxZ: cz + d / 2,
});

/** PRNG tất định để client và server sinh cùng một phố. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DOOR_COLORS = ["#1f3a5f", "#7a1f2b", "#111111", "#d9a521", "#2f6b8a", "#5b2a6e", "#e6e0d0", "#b5462f"];
const HOUSE_W = 4.5;

function buildHouses(): House[] {
  const rnd = mulberry32(17);
  const houses: House[] = [];
  const pick = () => DOOR_COLORS[Math.floor(rnd() * DOOR_COLORS.length)]!;
  const lit = (): [boolean, boolean, boolean] => [rnd() < 0.5, rnd() < 0.4, rnd() < 0.4];
  const brick = () => Math.floor(rnd() * 3) as 0 | 1 | 2;

  // Bắc: số lẻ từ tây sang đông. Nhà 17 nằm ở x ≈ -9.75.
  let n = 1;
  for (let x = -36 + HOUSE_W / 2; x < 36; x += HOUSE_W) {
    const number = n;
    houses.push({
      side: "north",
      x,
      width: HOUSE_W,
      number,
      doorColor: number === 17 ? "#1f7a3a" : pick(),
      brick: brick(),
      lit: number === 17 ? [true, true, false] : lit(),
    });
    n += 2;
  }
  // Nam: chỉ ở hai đầu phố (giữa là cửa hàng, bến bus, pub).
  let m = 2;
  for (const [x0, x1] of [
    [-36, -22],
    [28, 36],
  ] as const) {
    const count = Math.round((x1 - x0) / HOUSE_W);
    const w = (x1 - x0) / count;
    for (let i = 0; i < count; i++) {
      houses.push({
        side: "south",
        x: x0 + w * (i + 0.5),
        width: w,
        number: m,
        doorColor: pick(),
        brick: brick(),
        lit: lit(),
      });
      m += 2;
    }
  }
  return houses;
}

const houses = buildHouses();
const house17 = houses.find((h) => h.side === "north" && h.number === 17)!;

const shop: Range = { x0: -22, x1: -14 };
const pub: Range = { x0: 15, x1: 28 };
const zebraX = -10;
const phoneBox = { x: -5, z: 6.2 };
const busShelter = { x0: 1.5, x1: 7.5, z: 6.3 };
const busPole = { x: 9, z: 4.6 };
const busStopX = 5;
const postbox = { x: 12, z: 4.7 };
const picnicTables = [
  { x: 18.5, z: 5.7 },
  { x: 23.5, z: 5.7 },
];
const trees = [
  { x: -27, z: -5.4 },
  { x: -1.5, z: -5.4 },
  { x: 23, z: -5.4 },
  { x: 32, z: 5.4 },
];
const lamps: Lamp[] = [
  { x: -32, z: -4.45, light: false },
  { x: -16, z: -4.45, light: true },
  { x: 0, z: -4.45, light: true },
  { x: 16, z: -4.45, light: true },
  { x: 32, z: -4.45, light: false },
  { x: -29, z: 4.45, light: false },
  { x: -12.5, z: 4.45, light: true },
  { x: 13.8, z: 4.45, light: true },
  { x: 30, z: 4.45, light: false },
];
const dave = { x: 21, z: 6.6 };
const aBoard = { x: -15.6, z: 5.2 };
const fruitCrates = { x: -20.8, z: 6.5 };
const cab = { x: 19, z: -2.4, ry: Math.PI / 2 };

const seats: Seat[] = [
  ...[3, 4.5, 6].map((x, i) => ({ id: `bus-bench-${i}`, x, z: 6.45, ry: Math.PI, y: 0.45 })),
  ...picnicTables.flatMap((t, ti) =>
    [-0.5, 0.5].flatMap((dx, si) => [
      { id: `picnic-${ti}-n${si}`, x: t.x + dx, z: t.z - 0.75, ry: 0, y: 0.45 },
      { id: `picnic-${ti}-s${si}`, x: t.x + dx, z: t.z + 0.75, ry: Math.PI, y: 0.45 },
    ]),
  ),
];

const spots: Spot[] = [
  { id: "phone-box", kind: "phone-box", x: phoneBox.x, z: phoneBox.z - 0.9, radius: 1.4 },
  { id: "postbox", kind: "postbox", x: postbox.x, z: postbox.z - 0.5, radius: 1.3 },
  { id: "shop", kind: "shop", x: (shop.x0 + shop.x1) / 2, z: 6.4, radius: 2.2 },
  { id: "dave", kind: "npc-dave", x: dave.x, z: dave.z, radius: 2 },
  { id: "door-17", kind: "door-17", x: house17.x - 0.9, z: -6.6, radius: 1.4 },
  { id: "pub-door", kind: "pub-door", x: 26, z: 6.6, radius: 1.4 },
  { id: "quest-board", kind: "quest-board", x: busShelter.x0 + 0.1, z: 5.6, radius: 1.3 },
  ...seats.map((s) => ({
    id: `seat:${s.id}`,
    kind: "seat" as const,
    x: s.x,
    z: s.z,
    radius: 0.9,
    seatId: s.id,
  })),
];

const colliders: AABB[] = [
  box(phoneBox.x, phoneBox.z, 1.1, 1.1),
  box(postbox.x, postbox.z, 0.55, 0.55),
  box(busPole.x, busPole.z, 0.2, 0.2),
  box((busShelter.x0 + busShelter.x1) / 2, 6.95, busShelter.x1 - busShelter.x0, 0.15), // vách sau
  box(busShelter.x0, 6.3, 0.1, 1.3), // vách hông tây
  box(busShelter.x1, 6.3, 0.1, 1.3), // vách hông đông
  ...trees.map((t) => box(t.x, t.z, 0.5, 0.5)),
  ...lamps.map((l) => box(l.x, l.z, 0.22, 0.22)),
  ...[-4.6, 4.6].map((z) => box(zebraX - 2.2, z, 0.2, 0.2)), // cột Belisha
  ...picnicTables.map((t) => box(t.x, t.z, 1.9, 0.75)),
  box(aBoard.x, aBoard.z, 0.6, 0.4),
  box(fruitCrates.x, fruitCrates.z, 1.8, 0.7),
  box(dave.x, dave.z, 0.5, 0.5),
  box(cab.x, cab.z, 4.4, 1.8),
];

export const OII_STREET: WorldLayout = {
  houses,
  shop,
  pub,
  zebraX,
  phoneBox,
  postbox,
  busShelter,
  busPole,
  busStopX,
  picnicTables,
  trees,
  lamps,
  cab,
  dave,
  aBoard,
  fruitCrates,
  puddles: [
    { x: -24, z: 2.6, r: 1.1 },
    { x: -6, z: -3.2, r: 0.8 },
    { x: 9, z: 3.4, r: 1.3 },
    { x: 27, z: -1.2, r: 0.9 },
    { x: -3, z: 5.6, r: 0.6 },
    { x: 14, z: -5.9, r: 0.7 },
  ],
  colliders,
  spots,
  seats,
  spawn: { x: -7, z: 4.9, ry: -Math.PI / 2 },
};

export function seatById(id: string): Seat | undefined {
  return seats.find((s) => s.id === id);
}
