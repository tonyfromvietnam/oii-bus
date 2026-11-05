import { box, type AABB } from "./coords";

/**
 * Hai không gian của Oii-Bus (bản vẽ lại sau review M1):
 *  - "bus": tầng trên mui trần của chiếc bus hai tầng siêu to chạy vòng London. Mặc định, mọi người ở đây.
 *    Tầng thượng còn là nơi tìm người cùng thành phố và rủ nhau lên kế hoạch đi chơi.
 *  - "library": tầng giữa là thư viện yên lặng, nghe lofi, không chat chữ.
 *  - "temple": tầng dưới cùng là "Chùa Cầu Duyên": thắp hương, tụng kinh, công đức, xin se duyên 1:1.
 *
 * Toạ độ cục bộ mỗi scene, sàn y = 0. Bus: đầu xe ở +x, camera nhìn từ phía +z.
 */

export type SceneId = "street" | "bus" | "library" | "temple";

export type SpotKind =
  | "seat"
  | "photo"
  | "bubble-tea"
  | "karaoke"
  | "meal-deal"
  | "quest-board"
  | "umbrella"
  | "to-library"
  | "to-bus"
  | "bookshelf"
  | "cat"
  | "radio"
  | "meetup-board"
  | "to-temple"
  | "incense"
  | "donate"
  | "wish-tree"
  | "matchmaker"
  | "bell"
  | "place";

export interface Spot {
  id: string;
  kind: SpotKind;
  x: number;
  z: number;
  radius: number;
  seatId?: string;
  /** Với kind "place": mã địa điểm ở Phố Tân Sinh Viên. */
  placeId?: PlaceId;
}

export interface Seat {
  id: string;
  x: number;
  z: number;
  /** Hướng nhìn khi ngồi (radian quanh y; 0 = nhìn về +z). */
  ry: number;
  /** Ghế học ở thư viện: ngồi vào thì bật được hẹn giờ tập trung. */
  desk?: boolean;
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
  /** Thư viện: server không nhận chat chữ, chỉ biểu cảm yên lặng. */
  quiet: boolean;
}

const seatSpots = (seats: Seat[]): Spot[] =>
  seats.map((s) => ({ id: `seat:${s.id}`, kind: "seat", x: s.x, z: s.z, radius: 0.85, seatId: s.id }));

// ---------------------------------------------------------------- BUS ----
const BUS_HALF_L = 16;
const BUS_HALF_W = 3.5;

export const BUS_PROPS = {
  photo: { x: 14.3, z: 0 },
  frontBenches: [
    { x: 11, z: -2.1 },
    { x: 11, z: 2.1 },
  ],
  teaCart: { x: 6.5, z: -2.75 },
  karaoke: { x: 6.5, z: 2.7 },
  sideBenches: [
    { x: -0.5, z: -3.0 },
    { x: 2.7, z: -3.0 },
  ],
  vending: { x: -4.2, z: -3.05 },
  hotpot: { x: -8, z: 0 },
  questBoard: { x: -12, z: -3.25 },
  stairs: { x: -14.4, z: 2.3 },
  umbrellas: { x: -11.6, z: 3.1 },
  meetupBoard: { x: 9.4, z: 3.3 },
} as const;

const P = BUS_PROPS;

const busSeats: Seat[] = [
  ...P.frontBenches.flatMap((b, i) =>
    [-0.55, 0.55].map((dz, k) => ({ id: `front-${i}-${k}`, x: b.x, z: b.z + dz, ry: Math.PI / 2 })),
  ),
  ...P.sideBenches.flatMap((b, i) =>
    [-0.6, 0.6].map((dx, k) => ({ id: `side-${i}-${k}`, x: b.x + dx, z: b.z + 0.1, ry: 0 })),
  ),
  ...[0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    return {
      id: `hotpot-${i}`,
      x: P.hotpot.x + Math.cos(a) * 1.35,
      z: P.hotpot.z + Math.sin(a) * 1.35,
      ry: Math.atan2(-Math.cos(a), -Math.sin(a)),
    };
  }),
];

/** Vị trí 5 chú vịt cao su (quest). Nằm trong vùng đi được, cạnh đồ vật cho "khó tìm" một chút. */
export const DUCKS: { id: string; x: number; z: number }[] = [
  { id: "duck-front", x: 15.3, z: 3.0 },
  { id: "duck-tea", x: 8.0, z: -3.0 },
  { id: "duck-hotpot", x: -9.6, z: 1.6 },
  { id: "duck-back", x: -15.3, z: -3.0 },
  { id: "duck-middle", x: 1.2, z: 3.0 },
];

export const BUS_SCENE: SceneDef = {
  id: "bus",
  bounds: { minX: -BUS_HALF_L, maxX: BUS_HALF_L, minZ: -BUS_HALF_W, maxZ: BUS_HALF_W },
  colliders: [
    ...P.frontBenches.map((b) => box(b.x + 0.25, b.z, 0.5, 1.9)),
    ...P.sideBenches.map((b) => box(b.x, b.z - 0.2, 1.9, 0.5)),
    box(P.teaCart.x, P.teaCart.z, 1.6, 0.9),
    box(P.karaoke.x, P.karaoke.z, 0.7, 0.6),
    box(P.vending.x, P.vending.z, 1.1, 0.8),
    box(P.hotpot.x, P.hotpot.z, 1.5, 1.5),
    box(P.questBoard.x, P.questBoard.z, 1.4, 0.3),
    box(P.stairs.x, P.stairs.z, 2.6, 1.8),
    box(P.umbrellas.x, P.umbrellas.z, 0.5, 0.5),
    box(P.meetupBoard.x, P.meetupBoard.z, 1.6, 0.3),
  ],
  seats: busSeats,
  spots: [
    { id: "photo", kind: "photo", x: P.photo.x, z: P.photo.z, radius: 1.5 },
    { id: "bubble-tea", kind: "bubble-tea", x: P.teaCart.x, z: P.teaCart.z + 0.9, radius: 1.5 },
    { id: "karaoke", kind: "karaoke", x: P.karaoke.x, z: P.karaoke.z - 0.8, radius: 1.3 },
    { id: "meal-deal", kind: "meal-deal", x: P.vending.x, z: P.vending.z + 0.8, radius: 1.3 },
    { id: "quest-board", kind: "quest-board", x: P.questBoard.x, z: P.questBoard.z + 0.6, radius: 1.4 },
    { id: "umbrella", kind: "umbrella", x: P.umbrellas.x, z: P.umbrellas.z - 0.6, radius: 1.1 },
    { id: "to-library", kind: "to-library", x: P.stairs.x + 1.9, z: P.stairs.z, radius: 1.3 },
    { id: "meetup-board", kind: "meetup-board", x: P.meetupBoard.x, z: P.meetupBoard.z - 0.65, radius: 1.4 },
    ...seatSpots(busSeats),
  ],
  spawn: { x: 3, z: 0.6, ry: 0 },
  quiet: false,
};

// ------------------------------------------------------------ LIBRARY ----
export const LIBRARY_PROPS = {
  desks: [
    { x: -3.4, z: -2.2 },
    { x: 3.4, z: -2.2 },
    { x: -3.4, z: 1.3 },
    { x: 3.4, z: 1.3 },
  ],
  stairs: { x: -7.6, z: 4.4 },
  nook: { x: 6.2, z: 4.3 },
  cat: { x: 6.9, z: 3.6 },
  radio: { x: 0, z: -5.4 },
  shelvesWest: { x: -8.6 },
  shelvesEast: { x: 8.6 },
  downStairs: { x: 1.8, z: 4.9 },
} as const;

const L = LIBRARY_PROPS;

const libSeats: Seat[] = [
  ...L.desks.flatMap((d, i) =>
    [-0.8, 0.8].map((dx, k) => ({
      id: `desk-${i}-${k}`,
      x: d.x + dx,
      z: d.z + 0.85,
      ry: Math.PI,
      desk: true,
    })),
  ),
  { id: "armchair-0", x: L.nook.x - 1.1, z: L.nook.z, ry: Math.PI / 2 },
  { id: "armchair-1", x: L.nook.x + 1.3, z: L.nook.z - 0.2, ry: -Math.PI / 2 },
];

export const LIBRARY_SCENE: SceneDef = {
  id: "library",
  bounds: { minX: -9, maxX: 9, minZ: -6, maxZ: 6 },
  colliders: [
    ...L.desks.map((d) => box(d.x, d.z, 3.0, 0.9)),
    box(L.shelvesWest.x, -1, 0.8, 8),
    box(L.shelvesEast.x, -1.6, 0.8, 7),
    box(L.stairs.x, L.stairs.z + 0.4, 2.2, 1.6),
    box(L.radio.x, L.radio.z, 1.2, 0.5),
    box(L.nook.x, L.nook.z + 0.2, 1.2, 0.8), // bàn trà nhỏ giữa hai ghế
    box(L.downStairs.x, L.downStairs.z, 2.2, 1.4),
  ],
  seats: libSeats,
  spots: [
    { id: "to-bus", kind: "to-bus", x: L.stairs.x + 1.6, z: L.stairs.z - 0.2, radius: 1.3 },
    { id: "bookshelf-w", kind: "bookshelf", x: L.shelvesWest.x + 0.9, z: -1, radius: 1.4 },
    { id: "bookshelf-e", kind: "bookshelf", x: L.shelvesEast.x - 0.9, z: -2.5, radius: 1.4 },
    { id: "cat", kind: "cat", x: L.cat.x, z: L.cat.z - 0.5, radius: 1.1 },
    { id: "radio", kind: "radio", x: L.radio.x, z: L.radio.z + 0.7, radius: 1.3 },
    { id: "to-temple", kind: "to-temple", x: L.downStairs.x, z: L.downStairs.z - 1.25, radius: 1.1 },
    ...seatSpots(libSeats),
  ],
  spawn: { x: -4.2, z: 3.4, ry: 0 },
  quiet: true,
};

// -------------------------------------------------------------- TEMPLE ----
/**
 * Chùa Cầu Duyên: sân chùa lát đá, chính điện mái cong phía sau, lư hương giữa sân,
 * miếu Ông Tơ Bà Nguyệt (xin se duyên), cây duyên buộc chỉ đỏ, hòm công đức, góc tụng kinh,
 * đèn lồng hoa sen kiểu chùa Hàn treo khắp sân, tháp đá, hồ cá koi.
 */
export const TEMPLE_PROPS = {
  incense: { x: 0, z: -1.6 },
  matchmaker: { x: -7.6, z: -4.6 },
  wishTree: { x: 7.8, z: -3.6 },
  donate: { x: 3.6, z: -5.2 },
  bell: { x: -3.6, z: -5.2 },
  chantAltar: { x: -5.4, z: 1.6 },
  pond: { x: 7.4, z: 3.4 },
  pagoda: { x: -10.4, z: 1.8 },
  stairs: { x: -10.2, z: 5.6 },
} as const;

const TP = TEMPLE_PROPS;

const templeSeats: Seat[] = [-1.6, -0.4, 0.8].flatMap((dx, i) =>
  [1, 0].map((row) => ({
    id: `cushion-${i}-${row}`,
    x: TP.chantAltar.x + dx * 1.2 + 0.4,
    z: TP.chantAltar.z + 1.6 + row * 1.3,
    ry: Math.PI,
    chant: true,
  })),
);

export const TEMPLE_SCENE: SceneDef = {
  id: "temple",
  bounds: { minX: -12, maxX: 12, minZ: -7, maxZ: 7 },
  colliders: [
    box(TP.incense.x, TP.incense.z, 1.6, 1.6),
    box(TP.matchmaker.x, TP.matchmaker.z - 0.4, 3.2, 1.6),
    box(TP.wishTree.x, TP.wishTree.z, 1.4, 1.4),
    box(TP.donate.x, TP.donate.z, 1.2, 0.8),
    box(TP.bell.x, TP.bell.z, 1.2, 1.2),
    box(TP.chantAltar.x, TP.chantAltar.z, 3.4, 0.8),
    box(TP.pond.x, TP.pond.z, 4.4, 3.0),
    box(TP.pagoda.x, TP.pagoda.z, 1.6, 1.6),
    box(TP.stairs.x, TP.stairs.z + 0.4, 2.4, 1.4),
  ],
  seats: templeSeats,
  spots: [
    { id: "incense", kind: "incense", x: TP.incense.x, z: TP.incense.z + 1.4, radius: 1.5 },
    { id: "matchmaker", kind: "matchmaker", x: TP.matchmaker.x, z: TP.matchmaker.z + 1.1, radius: 1.6 },
    { id: "wish-tree", kind: "wish-tree", x: TP.wishTree.x - 1.3, z: TP.wishTree.z + 0.6, radius: 1.4 },
    { id: "donate", kind: "donate", x: TP.donate.x, z: TP.donate.z + 1.0, radius: 1.3 },
    { id: "bell", kind: "bell", x: TP.bell.x, z: TP.bell.z + 1.1, radius: 1.3 },
    { id: "to-library", kind: "to-library", x: TP.stairs.x + 1.8, z: TP.stairs.z - 0.4, radius: 1.3 },
    ...seatSpots(templeSeats),
  ],
  spawn: { x: -6.8, z: 5.2, ry: Math.PI },
  quiet: false,
};

// -------------------------------------------------------------- STREET ----
/**
 * Phố Tân Sinh Viên: nơi Oii-Bus thả người mới xuống. Một dãy cửa hàng low-poly phía xa (z âm)
 * và vài quầy thấp phía gần, mỗi nơi là một chặng trong Cẩm nang tân sinh viên.
 */
export type PlaceId =
  | "arrivals"
  | "bank"
  | "letting"
  | "gp"
  | "pharmacy"
  | "supermarket"
  | "asian"
  | "laundrette"
  | "cafe"
  | "station"
  | "freshers"
  | "busstop";

export interface Place {
  id: PlaceId;
  x: number;
  z: number;
  /** "shop": mặt tiền phía xa; "kiosk": quầy thấp trên phố. */
  kind: "shop" | "kiosk";
}

const SHOP_IDS: PlaceId[] = [
  "arrivals",
  "bank",
  "letting",
  "gp",
  "pharmacy",
  "supermarket",
  "asian",
  "laundrette",
  "cafe",
  "station",
];
export const SHOP_WIDTH = 5;

export const STREET_PLACES: Place[] = [
  ...SHOP_IDS.map((id, i) => ({ id, x: -22.5 + i * SHOP_WIDTH, z: -6.4, kind: "shop" as const })),
  { id: "freshers", x: -9, z: 3.6, kind: "kiosk" },
  { id: "busstop", x: 15, z: 3.8, kind: "kiosk" },
];

export const STREET_SCENE: SceneDef = {
  id: "street",
  bounds: { minX: -25, maxX: 25, minZ: -5.4, maxZ: 5.6 },
  colliders: [
    box(-9, 4.4, 3.2, 1.4), // gian Freshers
    box(15, 4.6, 2.8, 1.0), // mái chờ bus
    ...[-17, -3, 9, 21].map((x) => box(x, 2.2, 0.5, 0.5)), // cột đèn / cây
  ],
  seats: [],
  spots: STREET_PLACES.map((p) => ({
    id: `place:${p.id}`,
    kind: "place" as const,
    x: p.x,
    z: p.kind === "shop" ? -4.6 : p.z - 1.3,
    radius: 1.6,
    placeId: p.id,
  })),
  spawn: { x: -20, z: 0.5, ry: 0 },
  quiet: false,
};

export function placeSpot(id: PlaceId): Spot {
  return STREET_SCENE.spots.find((s) => s.placeId === id)!;
}

export const SCENES: Record<SceneId, SceneDef> = {
  street: STREET_SCENE,
  bus: BUS_SCENE,
  library: LIBRARY_SCENE,
  temple: TEMPLE_SCENE,
};

export function seatById(scene: SceneId, id: string): Seat | undefined {
  return SCENES[scene].seats.find((s) => s.id === id);
}
