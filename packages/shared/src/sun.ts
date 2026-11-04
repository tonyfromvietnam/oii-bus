import { londonParts } from "./schedule";

/**
 * Giờ mặt trời mọc/lặn trung bình ở London theo tháng (giờ treo tường, đã tính BST).
 * Đủ chính xác cho ánh sáng của phố; không cần thiên văn học.
 */
export const LONDON_SUN_TABLE: ReadonlyArray<{ rise: number; set: number }> = [
  { rise: 8.0, set: 16.25 }, // Th1
  { rise: 7.33, set: 17.17 }, // Th2
  { rise: 6.25, set: 18.0 }, // Th3
  { rise: 6.25, set: 19.83 }, // Th4 (BST)
  { rise: 5.25, set: 20.67 }, // Th5
  { rise: 4.75, set: 21.33 }, // Th6
  { rise: 5.0, set: 21.17 }, // Th7
  { rise: 5.75, set: 20.33 }, // Th8
  { rise: 6.58, set: 19.25 }, // Th9
  { rise: 7.42, set: 18.17 }, // Th10
  { rise: 7.25, set: 16.25 }, // Th11 (GMT)
  { rise: 8.0, set: 15.92 }, // Th12
];

/** Hoàng hôn kéo dài bao lâu mỗi phía (giờ). */
export const TWILIGHT_HOURS = 0.75;

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

/** Độ tối 0 (giữa ngày) → 1 (đêm hẳn) cho một giờ treo tường (số thực) trong tháng. */
export function darknessAt(month: number, hourOfDay: number): number {
  const sun = LONDON_SUN_TABLE[(month - 1 + 12) % 12]!;
  const h = hourOfDay;
  const afterSet = smooth((h - (sun.set - TWILIGHT_HOURS)) / (2 * TWILIGHT_HOURS));
  const beforeRise = 1 - smooth((h - (sun.rise - TWILIGHT_HOURS)) / (2 * TWILIGHT_HOURS));
  return Math.max(afterSet, beforeRise);
}

/** Độ tối theo giờ London thật. */
export function londonDarkness(now: Date = new Date()): number {
  const p = londonParts(now);
  return darknessAt(p.month, p.hour + p.minute / 60 + p.second / 3600);
}
