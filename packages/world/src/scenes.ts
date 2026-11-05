import type { StationId } from "@oii-bus/shared";
import { box, type AABB } from "./coords";

/**
 * Oii-Bus chỉ còn MỘT tầng: tầng thượng mui trần siêu to (88 × 22 m) chạy vòng quanh UK.
 * Mọi người ở chung một chỗ, giống một chánh điện online: đi qua lại giữa các khu,
 * làm việc vặt quen thuộc của du học sinh để cày XP, treo máy vẫn lên cấp.
 *
 * Từ đuôi xe (-x) tới đầu xe (+x):
 *   Chùa Cầu Duyên · Góc Deadline · OiiNails · Quảng trường OiiMate · Oii Viet · Oii Tea · Mũi xe
 *
 * Toạ độ: sàn y = 0, đầu xe ở +x, camera nhìn từ phía +z (z âm là phía xa, đặt đồ cao ở đó).
 */

export type SceneId = "bus";

export type SpotKind =
  | "seat"
  | "work"
  | "photo"
  | "karaoke"
  | "meetup-board"
  | "statue"
  | "incense"
  | "donate"
  | "wish-tree"
  | "matchmaker"
  | "bell";

export interface Spot {
  id: string;
  kind: SpotKind;
  x: number;
  z: number;
  radius: number;
  seatId?: string;
  /** Spot "work": quầy làm việc nào. */
  station?: StationId;
}

export interface Seat {
  id: string;
  x: number;
  z: number;
  /** Hướng nhìn khi ngồi (radian quanh y; 0 = nhìn về +z). */
  ry: number;
  /** Bồ đoàn ở chùa: ngồi vào là tụng kinh, tích đức theo thời gian. */
  chant?: boolean;
}

export interface SceneDef {
  id: SceneId;
  bounds: AABB;
  colliders: AABB[];
  seats: Seat[];
  spots: Spot[];
  spawn: { x: number; z: number; ry: number };
  /** Không cho chat chữ (giữ cho tương lai, hiện không khu nào bật). */
  quiet: boolean;
}

const seatSpots = (seats: Seat[]): Spot[] =>
  seats.map((s) => ({ id: `seat:${s.id}`, kind: "seat", x: s.x, z: s.z, radius: 0.85, seatId: s.id }));

export const DECK_HALF_L = 44;
export const DECK_HALF_W = 11;

/** Các khu trên tầng thượng, dùng cho cả HUD (biển "Bạn đang ở...") và đồ hoạ. */
export const ZONE_IDS = ["temple", "deadline", "nails", "plaza", "viet", "tea", "front"] as const;
export type ZoneId = (typeof ZONE_IDS)[number];
export const DECK_ZONES: Record<ZoneId, { minX: number; maxX: number }> = {
  temple: { minX: -44, maxX: -31 },
  deadline: { minX: -31, maxX: -21 },
  nails: { minX: -21, maxX: -6 },
  plaza: { minX: -6, maxX: 7 },
  viet: { minX: 7, maxX: 23 },
  tea: { minX: 23, maxX: 32 },
  front: { minX: 32, maxX: 44 },
};

export function zoneAt(x: number): ZoneId {
  return ZONE_IDS.find((z) => x < DECK_ZONES[z].maxX) ?? "front";
}

/** Vị trí đồ vật chính (đồ hoạ dùng chung để khớp va chạm). */
export const DECK = {
  // mũi xe
  photo: { x: 42.4, z: 0 },
  karaoke: { x: 37, z: 8.6 },
  meetupBoard: { x: 37, z: -9.6 },
  // Oii Tea
  teaBar: { x: 27.5, z: -9.2, w: 7, d: 1.4 },
  // Oii Viet
  phoCounter: { x: 15, z: -9.2, w: 11, d: 1.4 },
  phoTables: [
    { x: 10.5, z: -2.5 },
    { x: 19.5, z: -2.5 },
  ],
  hotpot: { x: 15, z: 3.6 },
  // quảng trường
  statue: { x: 0, z: -8.4 },
  // OiiNails
  nailBar: { x: -13.5, z: -7.6, w: 9, d: 1.3 },
  nailShelf: { x: -13.5, z: -10.2, w: 12, d: 0.6 },
  // Góc Deadline
  studyDesk: { x: -26, z: -7.4, w: 6.5, d: 1.4 },
  shelves: { x: -26, z: -10.2, w: 9, d: 0.6 },
  // chùa
  hall: { x: -37.5, z: -9.3, w: 11, d: 3 },
  moStand: { x: -37.5, z: -6.4, w: 1.6, d: 1 },
  incense: { x: -37.5, z: -1.4 },
  matchmaker: { x: -42.2, z: -6.2 },
  bell: { x: -33.2, z: -6.2 },
  donate: { x: -33.6, z: 4.4 },
  wishTree: { x: -42.2, z: 4.2 },
  cushions: { z: 2.8, xs: [-38.9, -37.5, -36.1] },
} as const;

const D = DECK;

/** Quầy làm việc: đứng trước quầy, bấm E (hoặc chạm) để mở bảng làm việc. */
export const STATION_SPOTS: Record<StationId, { x: number; z: number }> = {
  pho: { x: D.phoCounter.x, z: D.phoCounter.z + 1.6 },
  tea: { x: D.teaBar.x, z: D.teaBar.z + 1.6 },
  nails: { x: D.nailBar.x, z: D.nailBar.z + 1.5 },
  essay: { x: D.studyDesk.x, z: D.studyDesk.z + 1.6 },
  mo: { x: D.moStand.x, z: D.moStand.z + 1.3 },
};

const seats: Seat[] = [
  ...D.phoTables.flatMap((t, i) =>
    [-1, 1].map((s, k) => ({ id: `table-${i}-${k}`, x: t.x + s * 1.05, z: t.z, ry: (-s * Math.PI) / 2 })),
  ),
  ...[0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    return {
      id: `hotpot-${i}`,
      x: D.hotpot.x + Math.cos(a) * 1.4,
      z: D.hotpot.z + Math.sin(a) * 1.4,
      ry: Math.atan2(-Math.cos(a), -Math.sin(a)),
    };
  }),
  ...D.cushions.xs.map((x, i) => ({ id: `cushion-${i}`, x, z: D.cushions.z, ry: Math.PI, chant: true })),
];

const big = (p: { x: number; z: number; w: number; d: number }) => box(p.x, p.z, p.w, p.d);

export const BUS_SCENE: SceneDef = {
  id: "bus",
  bounds: { minX: -DECK_HALF_L, maxX: DECK_HALF_L, minZ: -DECK_HALF_W + 0.4, maxZ: DECK_HALF_W - 0.4 },
  colliders: [
    box(D.karaoke.x, D.karaoke.z, 0.8, 0.7),
    box(D.meetupBoard.x, D.meetupBoard.z, 2, 0.4),
    big(D.teaBar),
    big(D.phoCounter),
    ...D.phoTables.map((t) => box(t.x, t.z, 1.2, 1.2)),
    box(D.hotpot.x, D.hotpot.z, 1.6, 1.6),
    box(D.statue.x, D.statue.z, 2.6, 2.2),
    big(D.nailBar),
    big(D.nailShelf),
    big(D.studyDesk),
    big(D.shelves),
    big(D.hall),
    big(D.moStand),
    box(D.incense.x, D.incense.z, 1.6, 1.6),
    box(D.matchmaker.x, D.matchmaker.z, 2.6, 1.4),
    box(D.bell.x, D.bell.z, 1.3, 1.3),
    box(D.donate.x, D.donate.z, 1.1, 0.8),
    box(D.wishTree.x, D.wishTree.z, 1.5, 1.5),
  ],
  seats,
  spots: [
    ...(Object.entries(STATION_SPOTS) as [StationId, { x: number; z: number }][]).map(([station, p]) => ({
      id: `work:${station}`,
      kind: "work" as const,
      station,
      x: p.x,
      z: p.z,
      radius: 2,
    })),
    { id: "photo", kind: "photo", x: D.photo.x, z: D.photo.z, radius: 1.8 },
    { id: "karaoke", kind: "karaoke", x: D.karaoke.x, z: D.karaoke.z - 1, radius: 1.5 },
    { id: "meetup-board", kind: "meetup-board", x: D.meetupBoard.x, z: D.meetupBoard.z + 1, radius: 1.6 },
    { id: "statue", kind: "statue", x: D.statue.x, z: D.statue.z + 1.8, radius: 1.6 },
    { id: "incense", kind: "incense", x: D.incense.x, z: D.incense.z + 1.4, radius: 1.5 },
    { id: "matchmaker", kind: "matchmaker", x: D.matchmaker.x, z: D.matchmaker.z + 1.3, radius: 1.6 },
    { id: "bell", kind: "bell", x: D.bell.x, z: D.bell.z + 1.2, radius: 1.4 },
    { id: "donate", kind: "donate", x: D.donate.x, z: D.donate.z + 0.9, radius: 1.3 },
    { id: "wish-tree", kind: "wish-tree", x: D.wishTree.x + 1.4, z: D.wishTree.z + 0.4, radius: 1.4 },
    ...seatSpots(seats),
  ],
  spawn: { x: 0, z: 2.5, ry: 0 },
  quiet: false,
};

export const SCENES: Record<SceneId, SceneDef> = { bus: BUS_SCENE };

export function seatById(_scene: SceneId, id: string): Seat | undefined {
  return BUS_SCENE.seats.find((s) => s.id === id);
}
