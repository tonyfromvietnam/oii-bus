import { LONDON_TZ } from "./constants";

/**
 * Vòng lặp hằng ngày của Oii-Bus: điểm kinh nghiệm (XP) → cấp theo zone Oyster, chuỗi ngày lên xe,
 * câu nói mỗi ngày, mã mời bạn. Hàm thuần: client hiển thị, server (từ M3) mới là nơi cộng điểm thật.
 */

export interface Zone {
  /** 6 = mới lên xe … 1 = trung tâm; 0 = cấp cao nhất. */
  zone: number;
  /** XP cần để đạt cấp này. */
  minXp: number;
  title: string;
}

/** Cấp theo zone tàu điện London: đi từ ngoài vào trung tâm. */
export const ZONES: readonly Zone[] = [
  { zone: 6, minXp: 0, title: "Mới lên xe" },
  { zone: 5, minXp: 300, title: "Đã quen đường" },
  { zone: 4, minXp: 1_000, title: "Thạo meal deal" },
  { zone: 3, minXp: 3_000, title: "Dân Railcard" },
  { zone: 2, minXp: 8_000, title: "Người quen của cả xe" },
  { zone: 1, minXp: 20_000, title: "Dân London chính hiệu" },
  { zone: 0, minXp: 50_000, title: "Tiền bối Oii-Bus" },
];

export interface LevelInfo {
  zone: Zone;
  next: Zone | null;
  /** 0..1 trong cấp hiện tại. */
  progress: number;
  xpToNext: number;
}

export function levelFor(xp: number): LevelInfo {
  const x = Math.max(0, Math.floor(xp));
  let i = 0;
  while (i + 1 < ZONES.length && x >= ZONES[i + 1]!.minXp) i++;
  const zone = ZONES[i]!;
  const next = ZONES[i + 1] ?? null;
  if (!next) return { zone, next: null, progress: 1, xpToNext: 0 };
  return { zone, next, progress: (x - zone.minXp) / (next.minXp - zone.minXp), xpToNext: next.minXp - x };
}

/** Cấp số (không giới hạn) để lúc nào cũng có cấp tiếp theo mà cày: Lv 1, 2, 3... */
export function levelNumber(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 20)) + 1;
}

/** XP cần để lên cấp số `lv`. */
export const xpForLevel = (lv: number) => (lv - 1) ** 2 * 20;

/** "Zone 4" hoặc "Zone VIP" cho cấp cao nhất. */
export const zoneLabel = (z: Zone) => (z.zone === 0 ? "Zone VIP" : `Zone ${z.zone}`);

/** XP cho từng hành động (một chỗ để cân bằng game). */
export const XP = {
  dailyCheckIn: 10,
  streakBonusPerDay: 2,
  streakBonusMax: 20,
  incense: 5,
  chantTick: 1,
  focusMinute: 2,
  focusSession: 20,
  stamp: 15,
  photo: 5,
  plan: 10,
  wave: 1,
  milestone: 50,
} as const;

const dayFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: LONDON_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Ngày theo giờ London, dạng YYYY-MM-DD (en-CA cho đúng định dạng này). */
export function londonDayKey(date: Date = new Date()): string {
  return dayFmt.format(date);
}

function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

export interface StreakState {
  /** Ngày cuối cùng có lên xe (YYYY-MM-DD, giờ London). */
  lastDay: string | null;
  days: number;
  best: number;
}

export type CheckIn = { state: StreakState; isNewDay: boolean; broke: boolean };

/** Ghi nhận một lần lên xe hôm nay. Cùng ngày: không đổi; hôm qua: +1; cách xa hơn: chuỗi bắt đầu lại. */
export function checkIn(prev: StreakState, todayKey: string): CheckIn {
  if (prev.lastDay === todayKey) return { state: prev, isNewDay: false, broke: false };
  const gap = prev.lastDay ? dayNumber(todayKey) - dayNumber(prev.lastDay) : Infinity;
  const days = gap === 1 ? prev.days + 1 : 1;
  return {
    state: { lastDay: todayKey, days, best: Math.max(prev.best, days) },
    isNewDay: true,
    broke: prev.days > 1 && gap > 1,
  };
}

/** XP thưởng khi lên xe ngày đầu tiên trong ngày (có thưởng thêm theo chuỗi, có trần). */
export function checkInXp(streakDays: number): number {
  return XP.dailyCheckIn + Math.min(XP.streakBonusMax, (streakDays - 1) * XP.streakBonusPerDay);
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Chọn một phần tử theo ngày: ai mở trong cùng một ngày cũng thấy cùng một câu. */
export function pickForDay<T>(items: readonly T[], dayKey: string): T {
  return items[hash(dayKey) % items.length]!;
}

const REF_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** Mã mời ngắn, cố định theo một chuỗi hạt giống (bản thật: theo user id ở server). */
export function referralCode(seed: string): string {
  let h = hash(seed);
  let out = "";
  for (let i = 0; i < 7; i++) {
    out += REF_ALPHABET[h % REF_ALPHABET.length];
    h = (Math.floor(h / REF_ALPHABET.length) ^ hash(out + seed)) >>> 0;
  }
  return out;
}

export const REFERRAL_RE = /^[a-hjkmnp-z2-9]{7}$/;
