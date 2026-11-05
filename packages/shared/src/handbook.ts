/**
 * Cẩm nang tân sinh viên: chiến dịch theo ngày. Mỗi chương có đúng 3 nhiệm vụ bắt buộc;
 * xong chương thì chương kế tiếp mở vào NGÀY HÔM SAU (giờ London). Hàm thuần, server dùng lại ở M3.
 */
export const QUESTS_PER_CHAPTER = 3;

export interface HandbookProgress {
  /** Mã nhiệm vụ đã xong. */
  done: readonly string[];
  /** Ngày (YYYY-MM-DD, London) hoàn thành từng chương, theo thứ tự chương. */
  chapterDoneOn: readonly string[];
}

export type ChapterState =
  | { kind: "active"; chapter: number }
  | { kind: "waiting"; chapter: number; opensOn: string }
  | { kind: "finished" };

function addDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, m - 1, d + 1));
  return t.toISOString().slice(0, 10);
}

/**
 * Chương hiện tại. `chapters`: danh sách mã nhiệm vụ của từng chương.
 * Chương n (n ≥ 1) chỉ mở khi chương n−1 xong VÀ đã sang ngày sau ngày hoàn thành chương n−1.
 */
export function chapterState(
  chapters: readonly (readonly string[])[],
  p: HandbookProgress,
  todayKey: string,
): ChapterState {
  const done = new Set(p.done);
  for (let i = 0; i < chapters.length; i++) {
    const complete = chapters[i]!.every((q) => done.has(q));
    if (!complete) {
      if (i === 0) return { kind: "active", chapter: 0 };
      const prevDay = p.chapterDoneOn[i - 1];
      const opensOn = prevDay ? addDay(prevDay) : todayKey;
      return todayKey >= opensOn ? { kind: "active", chapter: i } : { kind: "waiting", chapter: i, opensOn };
    }
  }
  return { kind: "finished" };
}

/** Số chương đã hoàn thành (liên tiếp từ đầu). */
export function chaptersCompleted(chapters: readonly (readonly string[])[], done: readonly string[]): number {
  const set = new Set(done);
  let n = 0;
  while (n < chapters.length && chapters[n]!.every((q) => set.has(q))) n++;
  return n;
}
