import { describe, expect, it } from "vitest";
import {
  REFERRAL_RE,
  ZONES,
  checkIn,
  checkInXp,
  levelFor,
  levelNumber,
  xpForLevel,
  londonDayKey,
  pickForDay,
  referralCode,
  zoneLabel,
} from "../src";

describe("cấp theo zone", () => {
  it("bắt đầu ở Zone 6 và tiến dần vào trung tâm", () => {
    expect(levelFor(0).zone.zone).toBe(6);
    expect(levelFor(299).zone.zone).toBe(6);
    expect(levelFor(300).zone.zone).toBe(5);
    expect(levelFor(20_000).zone.zone).toBe(1);
    expect(zoneLabel(levelFor(100000).zone)).toBe("Zone VIP");
  });
  it("tính tiến độ trong cấp và XP còn thiếu", () => {
    const l = levelFor(650);
    expect(l.zone.zone).toBe(5);
    expect(l.progress).toBeCloseTo(0.5);
    expect(l.xpToNext).toBe(350);
    expect(levelFor(60_000).next).toBeNull();
  });
  it("cấp số tăng mãi, mốc khớp với xpForLevel", () => {
    expect(levelNumber(0)).toBe(1);
    expect(levelNumber(19)).toBe(1);
    expect(levelNumber(20)).toBe(2);
    for (const lv of [2, 5, 30]) {
      expect(levelNumber(xpForLevel(lv))).toBe(lv);
      expect(levelNumber(xpForLevel(lv) - 1)).toBe(lv - 1);
    }
  });
  it("các mốc XP tăng dần", () => {
    for (let i = 1; i < ZONES.length; i++) expect(ZONES[i]!.minXp).toBeGreaterThan(ZONES[i - 1]!.minXp);
  });
});

describe("chuỗi ngày (giờ London)", () => {
  it("ngày theo giờ London, không theo UTC", () => {
    // 23:30 UTC ngày 1/7 là 00:30 ngày 2/7 ở London (BST)
    expect(londonDayKey(new Date("2026-07-01T23:30:00Z"))).toBe("2026-07-02");
    expect(londonDayKey(new Date("2026-12-01T23:30:00Z"))).toBe("2026-12-01");
  });
  it("lần đầu là 1 ngày; hôm sau +1; cùng ngày không đổi", () => {
    let s = checkIn({ lastDay: null, days: 0, best: 0 }, "2026-11-05");
    expect(s.state.days).toBe(1);
    s = checkIn(s.state, "2026-11-05");
    expect(s.isNewDay).toBe(false);
    s = checkIn(s.state, "2026-11-06");
    expect(s.state.days).toBe(2);
    expect(s.isNewDay).toBe(true);
  });
  it("bỏ một ngày thì chuỗi bắt đầu lại nhưng giữ kỷ lục", () => {
    const s = checkIn({ lastDay: "2026-11-01", days: 5, best: 5 }, "2026-11-03");
    expect(s.state.days).toBe(1);
    expect(s.state.best).toBe(5);
    expect(s.broke).toBe(true);
  });
  it("qua đêm đổi giờ cuối tháng 10 vẫn tính là hôm sau", () => {
    expect(checkIn({ lastDay: "2026-10-24", days: 3, best: 3 }, "2026-10-25").state.days).toBe(4);
  });
  it("thưởng lên xe tăng theo chuỗi, có trần", () => {
    expect(checkInXp(1)).toBe(10);
    expect(checkInXp(4)).toBe(16);
    expect(checkInXp(100)).toBe(30);
  });
});

describe("câu mỗi ngày & mã mời", () => {
  it("cùng ngày cùng câu", () => {
    const items = ["a", "b", "c", "d", "e"];
    expect(pickForDay(items, "2026-11-05")).toBe(pickForDay(items, "2026-11-05"));
  });
  it("mã mời ổn định, đúng định dạng", () => {
    const a = referralCode("Bánh Bao#123");
    expect(a).toBe(referralCode("Bánh Bao#123"));
    expect(a).toMatch(REFERRAL_RE);
    expect(referralCode("khác")).not.toBe(a);
  });
});
