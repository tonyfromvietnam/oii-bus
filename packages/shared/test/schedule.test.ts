import { describe, expect, it } from "vitest";
import { closingAt, fromLondonWallTime, isStreetOpen, londonParts, nextOpeningAt } from "../src/schedule";

describe("giờ mở cửa (Europe/London)", () => {
  it("đóng Thứ 6 18:59, mở Thứ 6 19:00 (giờ mùa đông, GMT)", () => {
    // 6/11/2026 là Thứ 6
    expect(isStreetOpen(new Date("2026-11-06T18:59:00Z"))).toBe(false);
    expect(isStreetOpen(new Date("2026-11-06T19:00:00Z"))).toBe(true);
  });

  it("tôn trọng BST: Thứ 6 19:00 London = 18:00 UTC vào mùa hè", () => {
    // 5/6/2026 là Thứ 6, đang BST (UTC+1)
    expect(isStreetOpen(new Date("2026-06-05T17:59:00Z"))).toBe(false);
    expect(isStreetOpen(new Date("2026-06-05T18:00:00Z"))).toBe(true);
  });

  it("mở cả Thứ 7, mở tới CN 23:59, đóng Thứ 2 00:00", () => {
    expect(isStreetOpen(new Date("2026-11-07T03:00:00Z"))).toBe(true);
    expect(isStreetOpen(new Date("2026-11-08T23:59:59Z"))).toBe(true);
    expect(isStreetOpen(new Date("2026-11-09T00:00:00Z"))).toBe(false);
  });

  it("đóng giữa tuần, trừ khi có OPEN_OVERRIDE", () => {
    const wed = new Date("2026-11-04T20:00:00Z");
    expect(isStreetOpen(wed)).toBe(false);
    expect(isStreetOpen(wed, true)).toBe(true);
  });

  it("nextOpeningAt trả về Thứ 6 19:00 London kế tiếp", () => {
    expect(nextOpeningAt(new Date("2026-11-04T20:00:00Z")).toISOString()).toBe("2026-11-06T19:00:00.000Z");
    expect(nextOpeningAt(new Date("2026-11-06T10:00:00Z")).toISOString()).toBe("2026-11-06T19:00:00.000Z");
    // Đang mở → tuần sau
    expect(nextOpeningAt(new Date("2026-11-07T10:00:00Z")).toISOString()).toBe("2026-11-13T19:00:00.000Z");
    // Qua mốc đổi giờ cuối tháng 3: Thứ 6 3/4/2026 đã là BST
    expect(nextOpeningAt(new Date("2026-03-30T12:00:00Z")).toISOString()).toBe("2026-04-03T18:00:00.000Z");
  });

  it("closingAt là Thứ 2 00:00 London khi đang mở, null khi đóng", () => {
    expect(closingAt(new Date("2026-11-07T10:00:00Z"))?.toISOString()).toBe("2026-11-09T00:00:00.000Z");
    expect(closingAt(new Date("2026-11-04T10:00:00Z"))).toBeNull();
  });

  it("fromLondonWallTime ↔ londonParts khứ hồi", () => {
    const d = fromLondonWallTime(2026, 7, 10, 21, 30);
    expect(d.toISOString()).toBe("2026-07-10T20:30:00.000Z");
    const p = londonParts(d);
    expect([p.hour, p.minute, p.weekday]).toEqual([21, 30, 5]);
  });
});
