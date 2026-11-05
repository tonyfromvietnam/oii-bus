import { describe, expect, it } from "vitest";
import {
  AFK_MULT,
  OFFLINE_CAP_MS,
  advance,
  autoRate,
  buyHelper,
  helperCost,
  milestoneCrossed,
  newFarm,
  nextMilestone,
  parseFarm,
  rewardFor,
  sumReward,
  tap,
} from "../src";

const T0 = 1_700_000_000_000;

describe("máy farm", () => {
  it("bấm tay: mỗi lần một việc, có tiền tip và XP", () => {
    const s = tap(newFarm(T0), "pho", 3);
    expect(s.state.counts.pho).toBe(3);
    expect(s.gained.pho).toBe(3);
    expect(rewardFor("pho", 3)).toEqual({ pay: 3, xp: 3, merit: 0 });
    expect(rewardFor("mo", 10).merit).toBe(10);
  });

  it("chưa thuê ai thì thời gian trôi không cộng gì", () => {
    const r = advance(newFarm(T0), T0 + 60_000);
    expect(sumReward(r.gained)).toEqual({ pay: 0, xp: 0, merit: 0 });
  });

  it("thuê người giúp: giá tăng dần, không đủ tiền thì không thuê được", () => {
    expect(helperCost("pho", 1)).toBeGreaterThan(helperCost("pho", 0));
    expect(buyHelper(newFarm(T0), "pho", 1)).toBeNull();
    const b = buyHelper(newFarm(T0), "pho", 100)!;
    expect(b.cost).toBe(helperCost("pho", 0));
    expect(b.state.helpers.pho).toBe(1);
  });

  it("người giúp làm dần theo thời gian, cộng dồn phần lẻ", () => {
    let s = buyHelper(newFarm(T0), "pho", 100)!.state; // 0.5 bát/giây
    const a = advance(s, T0 + 1_000);
    expect(a.gained.pho).toBe(0);
    s = a.state;
    const b = advance(s, T0 + 2_000);
    expect(b.gained.pho).toBe(1);
    expect(b.state.counts.pho).toBeCloseTo(1);
  });

  it("tắt app: tính bù nhưng có trần 12 tiếng; treo máy nhanh gấp đôi", () => {
    const s = buyHelper(newFarm(T0), "mo", 100)!.state; // 1 tiếng mõ/giây
    const off = advance(s, T0 + 3 * OFFLINE_CAP_MS);
    expect(off.elapsedMs).toBe(OFFLINE_CAP_MS);
    expect(off.gained.mo).toBe(OFFLINE_CAP_MS / 1000);
    expect(autoRate(s, "mo", AFK_MULT)).toBe(2);
    expect(advance(s, T0 + 10_000, AFK_MULT).gained.mo).toBe(20);
  });

  it("đồng hồ lùi thì không cộng, không lùi lastTick", () => {
    const s = buyHelper(newFarm(T0), "mo", 100)!.state;
    const r = advance(s, T0 - 50_000);
    expect(r.gained.mo).toBe(0);
    expect(r.state.lastTick).toBe(T0);
  });

  it("mốc khoe", () => {
    expect(milestoneCrossed(99, 100)).toBe(100);
    expect(milestoneCrossed(100, 101)).toBeNull();
    expect(milestoneCrossed(90, 1200)).toBe(1000);
    expect(nextMilestone(0)).toBe(100);
    expect(nextMilestone(100)).toBe(500);
  });

  it("dữ liệu lưu bị hỏng thì về mặc định an toàn", () => {
    expect(parseFarm("rác", T0)).toEqual(newFarm(T0));
    const p = parseFarm({ counts: { pho: 12, nails: -4, tea: "x" }, helpers: { mo: 2.7 }, lastTick: 5 }, T0);
    expect(p.counts.pho).toBe(12);
    expect(p.counts.nails).toBe(0);
    expect(p.helpers.mo).toBe(2);
    expect(p.lastTick).toBe(5);
  });
});
