import { describe, expect, it } from "vitest";
import { AVATAR_RADIUS } from "@xom-oii/shared";
import { OII_STREET, WALKABLE, circleIntersectsBox, clampToWalkable, resolveCollisions } from "../src";

describe("va chạm", () => {
  it("giữ avatar trong phố", () => {
    const p = clampToWalkable({ x: 100, z: -100 });
    expect(p.x).toBeCloseTo(WALKABLE.maxX - AVATAR_RADIUS);
    expect(p.z).toBeCloseTo(WALKABLE.minZ + AVATAR_RADIUS);
  });

  it("đẩy avatar ra khỏi vật cản", () => {
    const box = { minX: -1, maxX: 1, minZ: -1, maxZ: 1 };
    const out = resolveCollisions({ x: 0.9, z: 0 }, [box]);
    expect(circleIntersectsBox(out, AVATAR_RADIUS, box)).toBe(false);
    expect(out.x).toBeGreaterThan(1);
  });

  it("tất định (client và server ra cùng kết quả)", () => {
    const a = resolveCollisions({ x: 4.2, z: 5.5 }, OII_STREET.colliders);
    const b = resolveCollisions({ x: 4.2, z: 5.5 }, OII_STREET.colliders);
    expect(a).toEqual(b);
  });

  it("mọi spot nằm trong vùng đi được", () => {
    for (const s of OII_STREET.spots) {
      expect(Math.abs(s.x)).toBeLessThanOrEqual(WALKABLE.maxX);
      expect(Math.abs(s.z)).toBeLessThanOrEqual(WALKABLE.maxZ);
    }
  });
});

describe("layout", () => {
  it("có nhà số 17 ở phía bắc", () => {
    expect(OII_STREET.houses.some((h) => h.side === "north" && h.number === 17)).toBe(true);
  });
  it("tối đa 8 đèn đường có PointLight thật", () => {
    expect(OII_STREET.lamps.filter((l) => l.light).length).toBeLessThanOrEqual(6);
  });
  it("điểm spawn không nằm trong vật cản", () => {
    const s = OII_STREET.spawn;
    for (const c of OII_STREET.colliders) expect(circleIntersectsBox(s, AVATAR_RADIUS, c)).toBe(false);
  });
  it("mọi ghế đều có spot để bấm E", () => {
    for (const seat of OII_STREET.seats) {
      expect(OII_STREET.spots.some((s) => s.seatId === seat.id)).toBe(true);
    }
  });
});
