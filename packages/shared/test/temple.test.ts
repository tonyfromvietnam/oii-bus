import { describe, expect, it } from "vitest";
import {
  MERIT_RULES,
  PlanCreateSchema,
  applyMerit,
  awardMerit,
  compatible,
  emptyLedger,
  luckPercent,
  matchQueue,
  matchWeight,
  pickMatch,
  type MatchCandidate,
} from "../src";

const c = (id: string, gender: "male" | "female", extra: Partial<MatchCandidate> = {}): MatchCandidate => ({
  id,
  gender,
  seeking: "opposite",
  merit: 0,
  waitSec: 0,
  blocked: [],
  recent: [],
  ...extra,
});

describe("se duyên", () => {
  it("mặc định chỉ ghép khác giới", () => {
    expect(compatible(c("a", "male"), c("b", "female"))).toBe(true);
    expect(compatible(c("a", "male"), c("b", "male"))).toBe(false);
  });
  it("'ai cũng được' chỉ ghép khi cả hai bên đều chấp nhận", () => {
    expect(compatible(c("a", "male", { seeking: "any" }), c("b", "male", { seeking: "any" }))).toBe(true);
    expect(compatible(c("a", "male", { seeking: "any" }), c("b", "male"))).toBe(false);
  });
  it("không ghép người đã chặn nhau hoặc vừa ghép", () => {
    expect(compatible(c("a", "male", { blocked: ["b"] }), c("b", "female"))).toBe(false);
    expect(compatible(c("a", "male"), c("b", "female", { blocked: ["a"] }))).toBe(false);
    expect(compatible(c("a", "male", { recent: ["b"] }), c("b", "female"))).toBe(false);
  });
  it("phúc đức tăng cơ hội nhưng có trần", () => {
    expect(matchWeight(0)).toBe(1);
    expect(matchWeight(20)).toBeCloseTo(2);
    expect(matchWeight(100000)).toBe(3);
    expect(luckPercent(20)).toBe(100);
  });
  it("người nhiều phúc đức được chọn thường hơn", () => {
    const seeker = c("me", "male");
    const pool = [c("low", "female"), c("high", "female", { merit: 60 })];
    let seed = 1;
    const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let high = 0;
    for (let i = 0; i < 2000; i++) if (pickMatch(seeker, pool, rng)?.id === "high") high++;
    expect(high / 2000).toBeGreaterThan(0.62);
    expect(high / 2000).toBeLessThan(0.82);
  });
  it("ghép cả hàng đợi, mỗi người tối đa một cặp", () => {
    const q = [
      c("m1", "male"),
      c("m2", "male"),
      c("f1", "female"),
      c("f2", "female", { merit: 50 }),
      c("m3", "male"),
    ];
    const pairs = matchQueue(q, () => 0.5);
    expect(pairs).toHaveLength(2);
    const ids = pairs.flat().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [a, b] of pairs) expect(a.gender).not.toBe(b.gender);
  });
});

describe("phúc đức", () => {
  it("thắp hương có cooldown", () => {
    let ledger = emptyLedger();
    const r1 = awardMerit("incense", ledger, 0);
    expect(r1).toEqual({ ok: true, points: 3, capped: false });
    ledger = applyMerit(ledger, "incense", 3, 0);
    expect(awardMerit("incense", ledger, 30_000)).toEqual({ ok: false, reason: "cooldown", waitSec: 30 });
    expect(awardMerit("incense", ledger, 61_000).ok).toBe(true);
  });
  it("công đức có trần mỗi ngày", () => {
    let ledger = emptyLedger();
    const r = awardMerit("donate", ledger, 0, 20);
    expect(r).toEqual({ ok: true, points: MERIT_RULES.donate.dailyCap, capped: true });
    ledger = applyMerit(ledger, "donate", MERIT_RULES.donate.dailyCap, 0);
    expect(awardMerit("donate", ledger, 1000, 1)).toEqual({ ok: false, reason: "cap" });
  });
});

describe("kế hoạch đi chơi", () => {
  it("validate kế hoạch", () => {
    const ok = PlanCreateSchema.safeParse({
      title: "Đi ăn phở Chinatown",
      city: "manchester",
      date: "2026-11-14",
      time: "18:30",
      maxPeople: 6,
    });
    expect(ok.success).toBe(true);
    expect(
      PlanCreateSchema.safeParse({ title: "x", city: "paris", date: "14/11", time: "25:00", maxPeople: 50 })
        .success,
    ).toBe(false);
  });
});
