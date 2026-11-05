import { describe, expect, it } from "vitest";
import { AVATAR_RADIUS } from "@oii-bus/shared";
import { BUS_SCENE, circleIntersectsBox, clampToBounds, resolveCollisions } from "../src";

describe("va chạm", () => {
  it("giữ avatar trong sàn bus", () => {
    const p = clampToBounds({ x: 100, z: -100 }, BUS_SCENE.bounds);
    expect(p.x).toBeCloseTo(BUS_SCENE.bounds.maxX - AVATAR_RADIUS);
    expect(p.z).toBeCloseTo(BUS_SCENE.bounds.minZ + AVATAR_RADIUS);
  });

  it("đẩy avatar ra khỏi vật cản", () => {
    const b = { minX: -1, maxX: 1, minZ: -1, maxZ: 1 };
    const out = resolveCollisions({ x: 0.9, z: 0 }, [b], BUS_SCENE.bounds);
    expect(circleIntersectsBox(out, AVATAR_RADIUS, b)).toBe(false);
  });

  it("tất định (client và server ra cùng kết quả)", () => {
    const a = resolveCollisions({ x: -8.2, z: 0.3 }, BUS_SCENE.colliders, BUS_SCENE.bounds);
    const b = resolveCollisions({ x: -8.2, z: 0.3 }, BUS_SCENE.colliders, BUS_SCENE.bounds);
    expect(a).toEqual(b);
  });
});
