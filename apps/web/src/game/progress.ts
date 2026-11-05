import {
  REFERRAL_RE,
  XP,
  checkIn,
  checkInXp,
  levelFor,
  londonDayKey,
  referralCode,
  zoneLabel,
  type StreakState,
} from "@oii-bus/shared";
import { create } from "zustand";
import { viDaily } from "../copy/daily";
import { ui } from "./ui";

/**
 * Tiến độ người chơi (bản thử: lưu trong trình duyệt). Từ M3 server giữ và tự cộng XP;
 * logic tính cấp/chuỗi ngày dùng chung trong @oii-bus/shared.
 */
export interface DayStats {
  day: string;
  focusMinutes: number;
  incense: number;
  done: number;
}

export interface ProgressState {
  xp: number;
  streak: StreakState;
  today: DayStats;
  newcomer: Record<string, true>;
  refCode: string;
  invitedBy: string | null;
  open: boolean;
  tab: "today" | "newcomer";
  set: (p: Partial<ProgressState>) => void;
}

const KEY = "oii-bus:progress";
const emptyDay = (day: string): DayStats => ({ day, focusMinutes: 0, incense: 0, done: 0 });

type Saved = Pick<ProgressState, "xp" | "streak" | "today" | "newcomer" | "refCode" | "invitedBy">;

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function save(s: ProgressState) {
  try {
    const { xp, streak, today, newcomer, refCode, invitedBy } = s;
    localStorage.setItem(KEY, JSON.stringify({ xp, streak, today, newcomer, refCode, invitedBy }));
  } catch {
    /* chế độ ẩn danh / bị chặn: chơi tiếp, chỉ không nhớ */
  }
}

const saved = load();
const todayKey = londonDayKey();

export const useProgress = create<ProgressState>((set) => ({
  xp: saved?.xp ?? 0,
  streak: saved?.streak ?? { lastDay: null, days: 0, best: 0 },
  today: saved?.today?.day === todayKey ? saved.today : emptyDay(todayKey),
  newcomer: saved?.newcomer ?? {},
  refCode: saved?.refCode ?? referralCode(`${Date.now()}-${Math.random()}`),
  invitedBy: saved?.invitedBy ?? null,
  open: false,
  tab: "today",
  set: (p) => set(p),
}));

useProgress.subscribe((s) => save(s));

const get = () => useProgress.getState();

/** Cộng XP; báo lên cấp nếu qua mốc. */
export function gainXp(amount: number) {
  if (amount <= 0) return;
  const before = levelFor(get().xp).zone;
  const xp = get().xp + amount;
  get().set({ xp });
  const after = levelFor(xp).zone;
  if (after.zone !== before.zone) {
    setTimeout(() => ui().showToast(viDaily.levelUp(zoneLabel(after), after.title)), 900);
  }
}

/** Tăng một số liệu của hôm nay (tự sang ngày mới theo giờ London). */
export function bump(stat: keyof Omit<DayStats, "day">, by = 1) {
  const day = londonDayKey();
  const cur = get().today.day === day ? get().today : emptyDay(day);
  get().set({ today: { ...cur, [stat]: cur[stat] + by } });
}

/** Gọi khi người chơi lên xe (sau khi tạo nhân vật / mỗi lần mở app). */
export function dailyCheckIn() {
  const r = checkIn(get().streak, londonDayKey());
  if (!r.isNewDay) return;
  get().set({ streak: r.state });
  const xp = checkInXp(r.state.days);
  gainXp(xp);
  ui().showToast(
    r.broke
      ? viDaily.streakBroke
      : r.state.days === 1
        ? viDaily.firstDay(xp)
        : viDaily.welcomeBack(r.state.days, xp),
  );
}

export function toggleNewcomer(id: string) {
  const cur = { ...get().newcomer };
  if (cur[id]) {
    delete cur[id];
    get().set({ newcomer: cur });
    return;
  }
  cur[id] = true;
  get().set({ newcomer: cur });
  gainXp(XP.newcomerTask);
  bump("done");
}

/** Đọc ?ref=… khi mở link mời (bản thật: server ghi nhận và thưởng cả hai). */
export function readReferral() {
  try {
    const code = new URLSearchParams(location.search).get("ref");
    if (code && REFERRAL_RE.test(code) && code !== get().refCode && !get().invitedBy) {
      get().set({ invitedBy: code });
      setTimeout(() => ui().showToast(viDaily.invitedBy(code)), 1500);
    }
  } catch {
    /* bỏ qua */
  }
}

/** Link mời: trang hiện tại (nếu là web thật) hoặc link prototype công khai. */
export function inviteUrl(): string {
  const base =
    typeof location !== "undefined" &&
    location.protocol.startsWith("http") &&
    !location.hostname.endsWith("claude.ai")
      ? `${location.origin}${location.pathname}`
      : "https://tonyfromvietnam.github.io/oii-bus/";
  return `${base}?ref=${get().refCode}`;
}
