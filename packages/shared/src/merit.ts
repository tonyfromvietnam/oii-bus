/**
 * "Phúc đức" ở Chùa Cầu Duyên: thắp hương, tụng kinh, công đức, buộc chỉ đỏ, thỉnh chuông.
 * Có cooldown và trần mỗi ngày để không ai "cày" được: làm đều đặn quan trọng hơn làm nhiều.
 * Điểm reset mỗi tuần (khi Oii-Bus đóng cửa tối Chủ nhật).
 */
export const MERIT_KINDS = ["incense", "chant", "donate", "wish", "bell"] as const;
export type MeritKind = (typeof MERIT_KINDS)[number];

export interface MeritRule {
  /** Điểm cho một lần (với "donate": cho mỗi £1 ảo; với "chant": cho mỗi `chantSeconds`). */
  points: number;
  cooldownSec: number;
  dailyCap: number;
}

export const MERIT_RULES: Record<MeritKind, MeritRule> = {
  incense: { points: 3, cooldownSec: 60, dailyCap: 15 },
  chant: { points: 1, cooldownSec: 0, dailyCap: 30 },
  donate: { points: 2, cooldownSec: 0, dailyCap: 30 },
  wish: { points: 5, cooldownSec: 0, dailyCap: 5 },
  bell: { points: 1, cooldownSec: 30, dailyCap: 5 },
};

/** Tụng kinh: mỗi bao nhiêu giây ngồi trên bồ đoàn thì được 1 điểm. */
export const CHANT_SECONDS = 10;

export interface MeritLedger {
  /** Điểm đã nhận hôm nay theo từng loại. */
  today: Partial<Record<MeritKind, number>>;
  /** Lần cuối làm (ms) theo từng loại, để tính cooldown. */
  lastAt: Partial<Record<MeritKind, number>>;
}

export type MeritResult =
  | { ok: true; points: number; capped: boolean }
  | { ok: false; reason: "cooldown"; waitSec: number }
  | { ok: false; reason: "cap" };

/**
 * Tính điểm được cộng cho một hành động. Server là nơi gọi hàm này (client chỉ hiển thị).
 * `units`: số £ khi công đức, số lần đủ `CHANT_SECONDS` khi tụng kinh; còn lại là 1.
 */
export function awardMerit(kind: MeritKind, ledger: MeritLedger, nowMs: number, units = 1): MeritResult {
  const rule = MERIT_RULES[kind];
  const last = ledger.lastAt[kind];
  if (rule.cooldownSec > 0 && last !== undefined) {
    const wait = rule.cooldownSec - (nowMs - last) / 1000;
    if (wait > 0) return { ok: false, reason: "cooldown", waitSec: Math.ceil(wait) };
  }
  const used = ledger.today[kind] ?? 0;
  const room = rule.dailyCap - used;
  if (room <= 0) return { ok: false, reason: "cap" };
  const wanted = Math.max(0, Math.floor(units)) * rule.points;
  const points = Math.min(wanted, room);
  return { ok: true, points, capped: points < wanted };
}

/** Ghi kết quả vào sổ (trả về sổ mới, không sửa sổ cũ). */
export function applyMerit(ledger: MeritLedger, kind: MeritKind, points: number, nowMs: number): MeritLedger {
  return {
    today: { ...ledger.today, [kind]: (ledger.today[kind] ?? 0) + points },
    lastAt: { ...ledger.lastAt, [kind]: nowMs },
  };
}

export const emptyLedger = (): MeritLedger => ({ today: {}, lastAt: {} });
