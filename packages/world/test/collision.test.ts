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
