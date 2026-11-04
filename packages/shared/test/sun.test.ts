import { describe, expect, it } from "vitest";
import { darknessAt, londonDarkness } from "../src/sun";

describe("ánh sáng theo giờ London", () => {
  it("5 giờ chiều tháng 11 đã tối, trưa thì sáng", () => {
    expect(darknessAt(11, 17)).toBeGreaterThan(0.8);
    expect(darknessAt(11, 12)).toBe(0);
    expect(darknessAt(11, 2)).toBe(1);
  });
  it("5 giờ chiều tháng 6 vẫn sáng", () => {
    expect(darknessAt(6, 17)).toBe(0);
    expect(darknessAt(6, 23)).toBe(1);
  });
  it("tăng dần qua hoàng hôn", () => {
    const a = darknessAt(11, 15.8);
    const b = darknessAt(11, 16.25);
    const c = darknessAt(11, 16.7);
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
  });
  it("londonDarkness đọc đúng múi giờ", () => {
    expect(londonDarkness(new Date("2026-11-06T17:00:00Z"))).toBeGreaterThan(0.8);
    expect(londonDarkness(new Date("2026-06-05T12:00:00Z"))).toBe(0);
  });
});
