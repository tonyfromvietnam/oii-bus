import { LONDON_TZ } from "./constants";

/**
 * Giờ mở cửa: Thứ 6 19:00 → Chủ nhật 23:59:59, giờ Europe/London (theo OiiMate).
 * Mọi phép tính dùng Intl nên tự xử lý BST/GMT.
 */

export interface LondonParts {
  year: number;
  month: number; // 1–12
  day: number;
  /** 0 = Chủ nhật … 6 = Thứ 7 */
  weekday: number;
  hour: number;
  minute: number;
  second: number;
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: LONDON_TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

export function londonParts(date: Date): LondonParts {
  const p: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) p[part.type] = part.value;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    weekday: WEEKDAYS[p.weekday ?? "Sun"] ?? 0,
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
  };
}

/** Chuyển giờ "treo tường" ở London sang thời điểm UTC. */
export function fromLondonWallTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): Date {
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  let guess = wallAsUtc;
  // Hai vòng là đủ để hội tụ quanh các mốc đổi giờ.
  for (let i = 0; i < 2; i++) {
    const p = londonParts(new Date(guess));
    const shown = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    guess += wallAsUtc - shown;
  }
  return new Date(guess);
}

export function isStreetOpen(now: Date = new Date(), override = false): boolean {
  if (override) return true;
  const { weekday, hour } = londonParts(now);
  if (weekday === 5) return hour >= 19;
  return weekday === 6 || weekday === 0;
}

function addLondonDays(p: LondonParts, days: number): { year: number; month: number; day: number } {
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** Lần mở cửa kế tiếp (Thứ 6 19:00 London). Nếu đang mở, trả về lần mở của tuần sau. */
export function nextOpeningAt(now: Date = new Date()): Date {
  const p = londonParts(now);
  const untilFriday = (5 - p.weekday + 7) % 7;
  // Đang mở (T6 tối, T7, CN) → Thứ 6 tuần sau. Đang đóng → Thứ 6 gần nhất (có thể là hôm nay).
  const delta = isStreetOpen(now) ? untilFriday || 7 : untilFriday;
  const d = addLondonDays(p, delta);
  return fromLondonWallTime(d.year, d.month, d.day, 19);
}

/** Thời điểm đóng cửa của đợt đang mở (đầu Thứ 2 00:00 London). `null` nếu đang đóng. */
export function closingAt(now: Date = new Date()): Date | null {
  if (!isStreetOpen(now)) return null;
  const p = londonParts(now);
  const delta = (1 - p.weekday + 7) % 7;
  const d = addLondonDays(p, delta);
  return fromLondonWallTime(d.year, d.month, d.day, 0);
}

/** Giờ chung (brief §11). */
export const SCHEDULED_EVENTS = [
  { id: "open-market", weekday: 5, hour: 19, minute: 0 },
  { id: "hotpot", weekday: 6, hour: 21, minute: 0 },
  { id: "sunday-scaries", weekday: 0, hour: 21, minute: 30 },
] as const;
export type ScheduledEventId = (typeof SCHEDULED_EVENTS)[number]["id"];
