import type { CityId } from "@oii-bus/shared";
import { wrapCentered } from "./util";

/**
 * Tuyến Oii-Bus vòng quanh UK. Bus đứng yên trong toạ độ của nó; cảnh vật trôi qua.
 * Vị trí trên tuyến tính từ giờ thật (ms) → mọi người, mọi instance thấy cùng một địa danh cùng lúc,
 * không cần server đồng bộ thêm gì.
 */
export const LANDMARK_SPACING = 80;
/** m/s */
export const BUS_SPEED = 4.5;

export type LandmarkId =
  | "big-ben"
  | "london-eye"
  | "tower-bridge"
  | "st-pauls"
  | "shard"
  | "buckingham"
  | "windsor"
  | "brighton-pier"
  | "white-cliffs"
  | "stonehenge"
  | "bath"
  | "cardiff"
  | "snowdon"
  | "oxford"
  | "cotswolds"
  | "cambridge"
  | "birmingham"
  | "old-trafford"
  | "liverpool"
  | "blackpool"
  | "lake-district"
  | "york"
  | "angel-north"
  | "hadrians-wall"
  | "edinburgh"
  | "forth-bridge"
  | "loch-ness"
  | "giants-causeway";

/** Kiểu cảnh dọc đường quanh mỗi địa danh. */
export type Terrain = "city" | "country" | "coast" | "river";
/** Vật liệu nhà dọc đường: gạch London pastel, đá vàng Bath, gạch đỏ miền Bắc, đá xám Scotland. */
export type HouseStyle = "london" | "bath" | "brick" | "stone";

export interface Landmark {
  id: LandmarkId;
  /** Vị trí dọc tuyến (m). */
  at: number;
  terrain: Terrain;
  houses: HouseStyle;
  /** Thành phố gần nhất (để gợi ý người cùng thành phố khi bus đi qua). */
  city: CityId;
}

const ORDER: [LandmarkId, Terrain, HouseStyle, CityId][] = [
  ["big-ben", "city", "london", "london"],
  ["london-eye", "river", "london", "london"],
  ["tower-bridge", "river", "london", "london"],
  ["st-pauls", "city", "london", "london"],
  ["shard", "city", "london", "london"],
  ["buckingham", "city", "london", "london"],
  ["windsor", "country", "brick", "london"],
  ["brighton-pier", "coast", "london", "brighton"],
  ["white-cliffs", "coast", "london", "canterbury"],
  ["stonehenge", "country", "stone", "southampton"],
  ["bath", "city", "bath", "bath"],
  ["cardiff", "city", "stone", "cardiff"],
  ["snowdon", "country", "stone", "bangor"],
  ["oxford", "city", "bath", "oxford"],
  ["cotswolds", "country", "bath", "oxford"],
  ["cambridge", "city", "bath", "cambridge"],
  ["birmingham", "city", "brick", "birmingham"],
  ["old-trafford", "city", "brick", "manchester"],
  ["liverpool", "river", "brick", "liverpool"],
  ["blackpool", "coast", "brick", "lancaster"],
  ["lake-district", "country", "stone", "lancaster"],
  ["york", "city", "stone", "york"],
  ["angel-north", "country", "stone", "newcastle"],
  ["hadrians-wall", "country", "stone", "newcastle"],
  ["edinburgh", "city", "stone", "edinburgh"],
  ["forth-bridge", "river", "stone", "edinburgh"],
  ["loch-ness", "country", "stone", "glasgow"],
  ["giants-causeway", "coast", "stone", "belfast"],
];

export const LANDMARKS: Landmark[] = ORDER.map(([id, terrain, houses, city], i) => ({
  id,
  at: i * LANDMARK_SPACING,
  terrain,
  houses,
  city,
}));

export const ROUTE_LENGTH = LANDMARKS.length * LANDMARK_SPACING;

/** Quãng đường bus đã đi trong vòng hiện tại. */
export function routeOffset(nowMs: number): number {
  return ((((nowMs / 1000) * BUS_SPEED) % ROUTE_LENGTH) + ROUTE_LENGTH) % ROUTE_LENGTH;
}

/** Toạ độ x (trong hệ của bus) của một điểm trên tuyến. Bus ở x = 0, cảnh trôi về −x. */
export function routeToLocalX(at: number, offset: number): number {
  return wrapCentered(at - offset, ROUTE_LENGTH);
}

/** Địa danh gần nhất với một điểm trên tuyến (để chọn kiểu cảnh dọc đường). */
export function nearestLandmark(at: number): Landmark {
  let best = LANDMARKS[0]!;
  let bestD = Infinity;
  for (const lm of LANDMARKS) {
    const d = Math.abs(wrapCentered(at - lm.at, ROUTE_LENGTH));
    if (d < bestD) {
      bestD = d;
      best = lm;
    }
  }
  return best;
}

/** Địa danh đang ở ngang bus (|x| < 32 m) và địa danh kế tiếp. */
export function landmarkStatus(offset: number): {
  current: Landmark | null;
  next: Landmark;
  metersToNext: number;
} {
  const WINDOW = 32;
  let current: Landmark | null = null;
  let next: Landmark | null = null;
  let best = Infinity;
  for (const lm of LANDMARKS) {
    const x = routeToLocalX(lm.at, offset);
    if (Math.abs(x) < WINDOW) current = lm;
    if (x > WINDOW && x < best) {
      best = x;
      next = lm;
    }
  }
  if (!next) {
    next = LANDMARKS.reduce((a, b) => (routeToLocalX(b.at, offset) < routeToLocalX(a.at, offset) ? b : a));
    best = routeToLocalX(next.at, offset) + ROUTE_LENGTH;
  }
  return { current, next, metersToNext: best - WINDOW };
}
