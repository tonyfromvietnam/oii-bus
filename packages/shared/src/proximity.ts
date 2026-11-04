import { CLEAR_RADIUS, HEAR_RADIUS } from "./constants";

export type DistanceBand = "clear" | "far" | "out";

export interface Vec2 {
  x: number;
  z: number;
}

export function distance2D(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

/** clear: ≤ CLEAR_RADIUS · far: ≤ HEAR_RADIUS · out: xa hơn (chỉ nhận "· · ·", không có nội dung). */
export function distanceBand(d: number): DistanceBand {
  if (d <= CLEAR_RADIUS) return "clear";
  if (d <= HEAR_RADIUS) return "far";
  return "out";
}

/** Gain voice: 1 khi ≤ CLEAR_RADIUS, giảm tuyến tính về 0 tại HEAR_RADIUS (brief §10). */
export function voiceGain(d: number): number {
  if (d <= CLEAR_RADIUS) return 1;
  if (d >= HEAR_RADIUS) return 0;
  return 1 - (d - CLEAR_RADIUS) / (HEAR_RADIUS - CLEAR_RADIUS);
}
