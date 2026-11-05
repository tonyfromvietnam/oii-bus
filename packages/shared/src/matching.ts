/**
 * Se duyên 1:1 ở Chùa Cầu Duyên. Ghép ngẫu nhiên, ẩn danh, mặc định với người khác giới;
 * phúc đức càng nhiều thì càng dễ được ghép (nhưng có trần, và không bao giờ là bảo đảm).
 * Hàm thuần: server gọi với hàng đợi lấy từ Redis.
 */
export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];
export const SEEKING = ["opposite", "any"] as const;
export type Seeking = (typeof SEEKING)[number];

export interface MatchCandidate {
  id: string;
  gender: Gender;
  seeking: Seeking;
  merit: number;
  /** Đã vào hàng đợi được bao lâu (giây). */
  waitSec: number;
  /** Người này đã chặn ai. */
  blocked: readonly string[];
  /** Những người đã ghép gần đây (không ghép lại ngay). */
  recent: readonly string[];
}

/** Hệ số may mắn từ phúc đức: 1 → tối đa 3, tăng chậm dần (log). */
export function matchWeight(merit: number): number {
  return Math.min(3, 1 + Math.log2(1 + Math.max(0, merit) / 20));
}

/** "Cơ hội ghép" hiển thị cho người dùng, ví dụ +45%. */
export function luckPercent(merit: number): number {
  return Math.round((matchWeight(merit) - 1) * 100);
}

function accepts(a: MatchCandidate, b: MatchCandidate): boolean {
  return a.seeking === "any" || a.gender !== b.gender;
}

/** Hai người ghép được với nhau: cả hai chấp nhận nhau, không ai chặn ai, chưa ghép gần đây. */
export function compatible(a: MatchCandidate, b: MatchCandidate): boolean {
  if (a.id === b.id) return false;
  if (!accepts(a, b) || !accepts(b, a)) return false;
  if (a.blocked.includes(b.id) || b.blocked.includes(a.id)) return false;
  if (a.recent.includes(b.id) || b.recent.includes(a.id)) return false;
  return true;
}

/** Thứ tự ưu tiên trong hàng đợi: chờ lâu + phúc đức. Phúc đức chỉ "cộng thêm" tối đa ~40 giây chờ. */
export function queuePriority(c: MatchCandidate): number {
  return c.waitSec + (matchWeight(c.merit) - 1) * 20;
}

/**
 * Chọn người cho `seeker` từ `pool`, ngẫu nhiên có trọng số theo phúc đức của người được chọn.
 * `rng` trả về [0, 1). Trả về null nếu chưa có ai hợp.
 */
export function pickMatch(
  seeker: MatchCandidate,
  pool: readonly MatchCandidate[],
  rng: () => number,
): MatchCandidate | null {
  const ok = pool.filter((c) => compatible(seeker, c));
  if (ok.length === 0) return null;
  const weights = ok.map((c) => matchWeight(c.merit));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < ok.length; i++) {
    r -= weights[i]!;
    if (r < 0) return ok[i]!;
  }
  return ok[ok.length - 1]!;
}

/** Ghép cả hàng đợi một lượt: người ưu tiên cao chọn trước. Trả về các cặp. */
export function matchQueue(
  queue: readonly MatchCandidate[],
  rng: () => number,
): [MatchCandidate, MatchCandidate][] {
  const waiting = [...queue].sort((a, b) => queuePriority(b) - queuePriority(a));
  const taken = new Set<string>();
  const pairs: [MatchCandidate, MatchCandidate][] = [];
  for (const seeker of waiting) {
    if (taken.has(seeker.id)) continue;
    const pool = waiting.filter((c) => !taken.has(c.id) && c.id !== seeker.id);
    const m = pickMatch(seeker, pool, rng);
    if (m) {
      taken.add(seeker.id).add(m.id);
      pairs.push([seeker, m]);
    }
  }
  return pairs;
}

/** Một phiên trò chuyện se duyên kéo dài bao lâu trước khi hỏi "trò chuyện tiếp không?". */
export const MATCH_SESSION_MINUTES = 10;
