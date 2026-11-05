import {
  AFK_MULT,
  MAX_TAPS_PER_SECOND,
  STATION_IDS,
  XP,
  advance,
  buyHelper,
  helperCost,
  milestoneCrossed,
  parseFarm,
  sumReward,
  tap,
  zeroCounts,
  type Counts,
  type FarmState,
  type Reward,
  type StationId,
} from "@oii-bus/shared";
import { create } from "zustand";
import { chime, mo } from "../audio/sfx";
import { viFarm } from "../copy/farm";
import { bump, gainXp } from "./progress";
import { game } from "./state";
import { ui } from "./ui";

/**
 * "Máy farm công đức" (bản thử: lưu trong trình duyệt).
 * - Bấm ở quầy = tự tay làm một việc.
 * - Người giúp đã thuê làm đều mỗi giây, kể cả khi tab bị ẩn hay app đóng (tính bù theo giờ thật, trần 12 tiếng).
 * - Treo máy: người giúp làm nhanh gấp đôi, bạn tự làm thêm 1 việc/giây ở quầy gần nhất.
 * Từ M3 server giữ FarmState và tính lại bằng cùng hàm trong @oii-bus/shared (không tin client).
 */

const KEY = "oii-bus:farm";
const TICK_MS = 1000;
/** Vắng lâu hơn bấy nhiêu thì hiện bảng "Trong lúc bạn đi vắng". */
const AWAY_NOTICE_MS = 90_000;

export interface AwaySummary {
  ms: number;
  gained: Counts;
  reward: Reward;
}

export interface FarmUi {
  farm: FarmState;
  /** Tổng £, XP, công đức đã nhận từ farm (để hiện thống kê). */
  merit: number;
  afk: boolean;
  /** Quầy đang mở bảng làm việc. */
  open: StationId | null;
  /** Quầy làm gần nhất (treo máy sẽ tự làm ở đây). */
  last: StationId;
  away: AwaySummary | null;
  /** Số việc làm được từ lúc bật treo máy. */
  session: Counts;
  /** Chữ "+1" bay lên khi bấm. */
  pop: { id: number; text: string } | null;
  set: (p: Partial<FarmUi>) => void;
}

interface Saved {
  farm: unknown;
  wallet?: number;
  merit?: number;
  last?: StationId;
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

const saved = load();
const now0 = Date.now();

export const useFarm = create<FarmUi>((set) => ({
  farm: parseFarm(saved?.farm, now0),
  merit: typeof saved?.merit === "number" && saved.merit >= 0 ? saved.merit : 0,
  afk: false,
  open: null,
  last: saved?.last && STATION_IDS.includes(saved.last) ? saved.last : "pho",
  away: null,
  session: zeroCounts(),
  pop: null,
  set: (p) => set(p),
}));

const get = () => useFarm.getState();

if (typeof saved?.wallet === "number" && Number.isFinite(saved.wallet) && saved.wallet >= 0) {
  ui().set({ wallet: Math.min(saved.wallet, 1e9) });
}

let lastSave = 0;
function save(force = false) {
  const t = Date.now();
  if (!force && t - lastSave < 5000) return;
  lastSave = t;
  try {
    const s = get();
    localStorage.setItem(
      KEY,
      JSON.stringify({ farm: s.farm, wallet: ui().wallet, merit: s.merit, last: s.last }),
    );
  } catch {
    /* ẩn danh / bị chặn: vẫn chơi, chỉ không nhớ */
  }
}

/** Công đức từ gõ mõ, cộng vào phúc đức để xin quẻ se duyên (hệ số may mắn vẫn có trần). */
export const farmMerit = () => get().merit;

let popSeq = 0;

/** Cộng phần thưởng cho số việc vừa làm; báo mốc nếu vượt. */
function apply(before: FarmState, after: FarmState, gained: Counts, showMilestone = true) {
  const r = sumReward(gained);
  const u = ui();
  if (r.pay) u.set({ wallet: Math.round((u.wallet + r.pay) * 100) / 100 });
  const items = STATION_IDS.reduce((a, id) => a + gained[id], 0);
  let bonus = 0;
  if (showMilestone) {
    for (const id of STATION_IDS) {
      const m = milestoneCrossed(Math.floor(before.counts[id]), Math.floor(after.counts[id]));
      if (m) {
        bonus += XP.milestone;
        chime();
        u.showToast(viFarm.milestone(m, viFarm.stations[id].unit));
      }
    }
  }
  gainXp(r.xp + bonus);
  if (items) bump("work", items);
  if (r.merit) {
    bump("merit", r.merit);
    get().set({ merit: get().merit + r.merit });
    u.set({ merit: u.merit + r.merit });
  }
  return r;
}

/** Một nhịp đồng hồ: người giúp làm việc theo thời gian thật đã trôi. */
export function tick(now = Date.now()) {
  const s = get();
  const before = s.farm;
  const step = advance(before, now, s.afk ? AFK_MULT : 1);
  let next = step.state;
  const gained = { ...step.gained };
  if (s.afk && step.elapsedMs >= 500 && !document.hidden) {
    // treo máy: tự tay làm thêm ở quầy gần nhất, mỗi giây một việc
    const self = Math.max(1, Math.round(step.elapsedMs / TICK_MS));
    const t = tap(next, s.last, self);
    next = t.state;
    gained[s.last] += t.gained[s.last];
  }
  get().set({ farm: next });
  const r = apply(before, next, gained);
  if (s.afk) {
    const session = { ...get().session };
    for (const id of STATION_IDS) session[id] += gained[id];
    get().set({ session });
  }
  if (step.elapsedMs >= AWAY_NOTICE_MS && (r.pay || r.xp || r.merit)) {
    get().set({ away: { ms: step.elapsedMs, gained, reward: r } });
  }
  save();
}

let tapTimes: number[] = [];

/** Tự tay làm một việc ở quầy. Trả về false nếu bấm quá nhanh. */
export function tapStation(id: StationId): boolean {
  const t = performance.now();
  tapTimes = tapTimes.filter((x) => t - x < 1000);
  if (tapTimes.length >= MAX_TAPS_PER_SECOND) return false;
  tapTimes.push(t);
  const before = get().farm;
  const step = tap(before, id);
  get().set({ farm: step.state, last: id });
  const r = apply(before, step.state, step.gained);
  if (id === "mo") mo();
  const p = game.player;
  p.gesture = { id: id === "mo" ? "sorry" : "cheers", until: game.time + 0.35 };
  const reward = r.merit ? `+${r.merit} 🪷` : r.pay ? `+£${r.pay}` : `+${r.xp} XP`;
  get().set({ pop: { id: ++popSeq, text: reward } });
  // thỉnh thoảng nhân vật nói một câu cho vui
  if (Math.random() < 0.08) {
    const lines = viFarm.stations[id].lines;
    p.bubble = { text: lines[Math.floor(Math.random() * lines.length)]!, until: game.time + 2.5 };
  }
  save();
  return true;
}

/** Thuê thêm người giúp ở quầy. */
export function hire(id: StationId) {
  const u = ui();
  const r = buyHelper(get().farm, id, u.wallet);
  const st = viFarm.stations[id];
  if (!r) {
    u.showToast(viFarm.broke(helperPrice(id)));
    return;
  }
  u.spend(r.cost);
  get().set({ farm: r.state, last: id });
  chime();
  u.showToast(viFarm.hired(st.helper));
  save(true);
}

export const helperPrice = (id: StationId) => helperCost(id, get().farm.helpers[id]);

// --- khoá màn hình sáng khi treo máy (nếu trình duyệt hỗ trợ) ---
type WakeLock = { release: () => Promise<void> };
let wake: WakeLock | null = null;

export async function setAfk(on: boolean) {
  tick();
  get().set({ afk: on, session: zeroCounts(), open: null });
  try {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLock> } };
    if (on && nav.wakeLock) wake = await nav.wakeLock.request("screen");
    if (!on && wake) {
      await wake.release();
      wake = null;
    }
  } catch {
    /* không hỗ trợ hoặc bị từ chối: vẫn treo máy bình thường */
  }
}

let started = false;

/** Bật đồng hồ farm (gọi một lần khi vào thế giới). Tính bù luôn thời gian app bị đóng. */
export function startFarm() {
  if (started) return;
  started = true;
  ui().set({ merit: ui().merit + get().merit });
  tick();
  setInterval(() => tick(), TICK_MS);
  document.addEventListener("visibilitychange", () => {
    tick();
    if (document.hidden) save(true);
  });
  window.addEventListener("pagehide", () => save(true));
}
