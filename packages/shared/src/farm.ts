/**
 * "Máy farm": mỗi quầy trên Oii-Bus là một việc làm thêm quen thuộc của du học sinh.
 * Bấm một lần = làm một việc (bê một bát phở, làm một bộ nails, gõ một tiếng mõ...).
 * Thuê thêm người giúp thì quầy tự chạy, kể cả khi tắt app (tính bù theo thời gian, có trần).
 *
 * Logic thuần, không phụ thuộc trình duyệt: client dùng cho bản thử, server dùng để kiểm tra (M3).
 */

export const STATION_IDS = ["pho", "nails", "tea", "essay", "mo"] as const;
export type StationId = (typeof STATION_IDS)[number];

export interface StationDef {
  id: StationId;
  /** £ tiền tip mỗi việc. */
  pay: number;
  /** XP mỗi việc. */
  xp: number;
  /** Công đức mỗi việc (chỉ gõ mõ). */
  merit: number;
  /** Giá người giúp đầu tiên (£). */
  helperBase: number;
  /** Số việc mỗi giây của một người giúp. */
  helperRate: number;
}

export const STATIONS: Record<StationId, StationDef> = {
  pho: { id: "pho", pay: 1, xp: 1, merit: 0, helperBase: 15, helperRate: 0.5 },
  nails: { id: "nails", pay: 2, xp: 1, merit: 0, helperBase: 30, helperRate: 0.3 },
  tea: { id: "tea", pay: 0.5, xp: 1, merit: 0, helperBase: 8, helperRate: 0.8 },
  essay: { id: "essay", pay: 0, xp: 3, merit: 0, helperBase: 20, helperRate: 0.25 },
  mo: { id: "mo", pay: 0, xp: 1, merit: 1, helperBase: 10, helperRate: 1 },
};

/** Mốc khoe: "bê 100 bát phở", "làm 1.000 bộ nails"... */
export const MILESTONES = [100, 500, 1_000, 5_000, 10_000, 50_000, 100_000] as const;

/** Tắt app tối đa bấy nhiêu vẫn được tính bù. */
export const OFFLINE_CAP_MS = 12 * 60 * 60_000;
/** Treo máy (mở app, bật chế độ treo máy): người giúp làm nhanh gấp đôi. */
export const AFK_MULT = 2;
/** Chống spam: tối đa bấy nhiêu lần bấm mỗi giây được tính. */
export const MAX_TAPS_PER_SECOND = 15;
const HELPER_GROWTH = 1.55;

export type Counts = Record<StationId, number>;

export interface FarmState {
  /** Số việc đã làm (có phần lẻ do người giúp làm dần). */
  counts: Counts;
  helpers: Counts;
  lastTick: number;
}

export const zeroCounts = (): Counts => ({ pho: 0, nails: 0, tea: 0, essay: 0, mo: 0 });

export const newFarm = (now: number): FarmState => ({
  counts: zeroCounts(),
  helpers: zeroCounts(),
  lastTick: now,
});

export interface Reward {
  pay: number;
  xp: number;
  merit: number;
}

/** Phần thưởng cho `items` việc ở một quầy. */
export function rewardFor(id: StationId, items: number): Reward {
  const d = STATIONS[id];
  return { pay: Math.round(items * d.pay * 100) / 100, xp: items * d.xp, merit: items * d.merit };
}

export function helperCost(id: StationId, owned: number): number {
  return Math.ceil(STATIONS[id].helperBase * HELPER_GROWTH ** owned);
}

/** Việc mỗi giây ở một quầy. */
export function autoRate(s: FarmState, id: StationId, mult = 1): number {
  return s.helpers[id] * STATIONS[id].helperRate * mult;
}

export function totalRate(s: FarmState, mult = 1): number {
  return STATION_IDS.reduce((a, id) => a + autoRate(s, id, mult), 0);
}

/** Số việc trọn vẹn tăng thêm khi đi từ `a` lên `b`. */
const whole = (a: number, b: number) => Math.floor(b) - Math.floor(a);

export interface Step {
  state: FarmState;
  /** Số việc trọn vẹn làm thêm ở từng quầy. */
  gained: Counts;
  /** Thời gian thật được tính (ms), sau khi áp trần. */
  elapsedMs: number;
}

/**
 * Cho thời gian trôi tới `now`. Dùng cho cả vòng lặp mỗi giây lẫn tính bù khi mở lại app.
 * Đồng hồ lùi (đổi giờ máy) thì không cộng gì.
 */
export function advance(s: FarmState, now: number, mult = 1, capMs = OFFLINE_CAP_MS): Step {
  const elapsedMs = Math.min(Math.max(0, now - s.lastTick), capMs);
  const counts = { ...s.counts };
  const gained = zeroCounts();
  for (const id of STATION_IDS) {
    const before = counts[id];
    counts[id] = before + (autoRate(s, id, mult) * elapsedMs) / 1000;
    gained[id] = whole(before, counts[id]);
  }
  return { state: { ...s, counts, lastTick: Math.max(s.lastTick, now) }, gained, elapsedMs };
}

/** Tự tay làm `n` việc. */
export function tap(s: FarmState, id: StationId, n = 1): Step {
  const counts = { ...s.counts, [id]: s.counts[id] + n };
  const gained = zeroCounts();
  gained[id] = whole(s.counts[id], counts[id]);
  return { state: { ...s, counts }, gained, elapsedMs: 0 };
}

/** Thuê thêm một người giúp nếu đủ tiền. Trả về giá phải trả, hoặc null nếu không đủ. */
export function buyHelper(
  s: FarmState,
  id: StationId,
  wallet: number,
): { state: FarmState; cost: number } | null {
  const cost = helperCost(id, s.helpers[id]);
  if (wallet + 1e-9 < cost) return null;
  return { state: { ...s, helpers: { ...s.helpers, [id]: s.helpers[id] + 1 } }, cost };
}

/** Mốc lớn nhất vừa vượt qua (để khoe), hoặc null. */
export function milestoneCrossed(before: number, after: number): number | null {
  let hit: number | null = null;
  for (const m of MILESTONES) if (before < m && after >= m) hit = m;
  return hit;
}

/** Mốc tiếp theo cần đạt. */
export function nextMilestone(count: number): number {
  return MILESTONES.find((m) => m > count) ?? Math.ceil((count + 1) / 100_000) * 100_000;
}

export function sumReward(gained: Counts): Reward {
  const r: Reward = { pay: 0, xp: 0, merit: 0 };
  for (const id of STATION_IDS) {
    if (!gained[id]) continue;
    const x = rewardFor(id, gained[id]);
    r.pay += x.pay;
    r.xp += x.xp;
    r.merit += x.merit;
  }
  r.pay = Math.round(r.pay * 100) / 100;
  return r;
}

/** Đọc dữ liệu đã lưu (localStorage) một cách an toàn: thiếu hay hỏng thì về mặc định. */
export function parseFarm(raw: unknown, now: number): FarmState {
  const base = newFarm(now);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<FarmState>;
  const num = (v: unknown, max: number) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.min(v, max) : 0;
  for (const id of STATION_IDS) {
    base.counts[id] = num(r.counts?.[id], 1e12);
    base.helpers[id] = Math.floor(num(r.helpers?.[id], 500));
  }
  const last = num(r.lastTick, now);
  base.lastTick = last > 0 ? last : now;
  return base;
}
