import { describe, expect, it } from "vitest";
import { chapterState, chaptersCompleted } from "../src";

const CH = [
  ["a1", "a2", "a3"],
  ["b1", "b2", "b3"],
  ["c1", "c2", "c3"],
];

describe("cẩm nang: mở chương theo ngày", () => {
  it("bắt đầu ở chương 1", () => {
    expect(chapterState(CH, { done: [], chapterDoneOn: [] }, "2026-11-05")).toEqual({
      kind: "active",
      chapter: 0,
    });
  });
  it("xong chương 1 hôm nay thì chương 2 đợi tới mai", () => {
    const p = { done: ["a1", "a2", "a3"], chapterDoneOn: ["2026-11-05"] };
    expect(chapterState(CH, p, "2026-11-05")).toEqual({ kind: "waiting", chapter: 1, opensOn: "2026-11-06" });
    expect(chapterState(CH, p, "2026-11-06")).toEqual({ kind: "active", chapter: 1 });
  });
  it("qua cuối tháng vẫn tính đúng ngày mai", () => {
    const p = { done: ["a1", "a2", "a3"], chapterDoneOn: ["2026-11-30"] };
    expect(chapterState(CH, p, "2026-11-30")).toMatchObject({ opensOn: "2026-12-01" });
  });
  it("làm dở chương vẫn là chương đang mở", () => {
    const p = { done: ["a1", "a2", "a3", "b1"], chapterDoneOn: ["2026-11-05"] };
    expect(chapterState(CH, p, "2026-11-07")).toEqual({ kind: "active", chapter: 1 });
  });
  it("xong hết thì kết thúc", () => {
    const all = CH.flat();
    expect(chapterState(CH, { done: all, chapterDoneOn: ["d1", "d2", "d3"] }, "2026-12-01")).toEqual({
      kind: "finished",
    });
    expect(chaptersCompleted(CH, all)).toBe(3);
    expect(chaptersCompleted(CH, ["a1", "a2", "a3", "b1"])).toBe(1);
  });
});
