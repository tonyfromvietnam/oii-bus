import { wrapCentered } from "./util";

/**
 * Tuyến bus vòng London. Bus đứng yên trong toạ độ của nó; cảnh vật trôi qua.
 * Vị trí trên tuyến tính từ giờ thật (ms) → mọi người, mọi instance thấy cùng một địa danh cùng lúc,
 * không cần server đồng bộ thêm gì.
 */
export const ROUTE_LENGTH = 720;
/** m/s */
export const BUS_SPEED = 4.5;

export type LandmarkId =
  "big-ben" | "london-eye" | "tower-bridge" | "st-pauls" | "shard" | "buckingham" | "gherkin" | "chinatown";

export interface Landmark {
  id: LandmarkId;
  /** Vị trí dọc tuyến (m). */
  at: number;
}

export const LANDMARKS: Landmark[] = [
  { id: "big-ben", at: 0 },
  { id: "london-eye", at: 90 },
  { id: "tower-bridge", at: 180 },
  { id: "st-pauls", at: 270 },
  { id: "shard", at: 360 },
  { id: "buckingham", at: 450 },
  { id: "gherkin", at: 540 },
  { id: "chinatown", at: 630 },
];

/** Quãng đường bus đã đi trong vòng hiện tại. */
export function routeOffset(nowMs: number): number {
  return ((((nowMs / 1000) * BUS_SPEED) % ROUTE_LENGTH) + ROUTE_LENGTH) % ROUTE_LENGTH;
}

/** Toạ độ x (trong hệ của bus) của một điểm trên tuyến. Bus ở x = 0, cảnh trôi về −x. */
export function routeToLocalX(at: number, offset: number): number {
  return wrapCentered(at - offset, ROUTE_LENGTH);
}

/** Địa danh đang ở ngang bus (|x| < 40 m) và địa danh kế tiếp. */
export function landmarkStatus(offset: number): {
  current: Landmark | null;
  next: Landmark;
  metersToNext: number;
} {
  let current: Landmark | null = null;
  let next = LANDMARKS[0]!;
  let best = Infinity;
  for (const lm of LANDMARKS) {
    const x = routeToLocalX(lm.at, offset);
    if (Math.abs(x) < 40) current = lm;
    if (x > 40 && x < best) {
      best = x;
      next = lm;
    }
  }
  if (best === Infinity) {
    // địa danh kế tiếp nằm ở vòng sau
    next = LANDMARKS.reduce((a, b) => (routeToLocalX(b.at, offset) < routeToLocalX(a.at, offset) ? b : a));
    best = routeToLocalX(next.at, offset) + ROUTE_LENGTH;
  }
  return { current, next, metersToNext: best - 40 };
}
